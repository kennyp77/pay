import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import { TransactionStatus } from '@trust/pay-api';
import { logError } from '@trust/rum';
import { getBrowserData } from '@trust/utils/browser';
import { EventEmitter } from '@trust/utils/event-emitter';
import { doUntil } from '@trust/utils/fn/do-until';
import { CardPaymentMethod } from '@trust/utils/payment-methods/typings';
import {
    InitPaymentSheet,
    PaymentMethodInfo,
    PaymentMethodType,
} from '@yandex-pay/sdk/src/typings';

import { getChallengeParams, getChallengeReturnPath } from '../challenge';
import { CHALLENGE_LIMIT_EXCEEDED } from '../config';
import { CASH_KEY } from '../helpers/payment-method';
import { toPaymentData } from '../transform/payment';

import { API, ServerApiModule } from './module';

const WATCH_SERVER_PAYMENT_INTERVAL = 4000;

export interface TypedObject<T> {
    type: T;
}

export enum CheckoutProcessType {
    startServerPayment = 'START_SERVER_PAYMENT',
    startClientPayment = 'START_CLIENT_PAYMENT',
    startWatchServerPayment = 'START_WATCH_SERVER_PAYMENT',
    paymentOrder = 'PAYMENT_ORDER',
    error = 'ERROR',
    transactionStatusChanged = 'TRANSACTION_STATUS_CHANGED',
    transaction3ds = 'TRANSACTION_3DS',
    paymentData = 'PAYMENT_DATA',
    challengeRedirect = 'CHALLENGE_REDIRECT',
}

interface StartServerPaymentEvent extends TypedObject<CheckoutProcessType.startServerPayment> {}

interface StartClientPaymentEvent extends TypedObject<CheckoutProcessType.startClientPayment> {}

interface StartWatchServerPaymentEvent
    extends TypedObject<CheckoutProcessType.startWatchServerPayment> {}
interface TransactionStatusChangedEvent
    extends TypedObject<CheckoutProcessType.transactionStatusChanged> {
    status: TransactionStatus;
}
interface Transaction3dsEvent extends TypedObject<CheckoutProcessType.transaction3ds> {
    method: 'IFRAME';
    url: string;
}
interface ErrorEvent extends TypedObject<CheckoutProcessType.error> {
    state: 'wait_transaction' | 'start_checkout' | 'create_payment';
    error: Error;
}

interface ChallengeRedirectEvent extends TypedObject<CheckoutProcessType.challengeRedirect> {
    redirectPath: string;
}

type PaymentData = {
    token: Sdk.PaymentToken;
    paymentMethodInfo: PaymentMethodInfo;
};

type PaymentDataEvent = TypedObject<CheckoutProcessType.paymentData> & PaymentData;

interface Order {
    orderId: string;
    checkoutOrderId: string;
    transactionId?: string;
    metadata?: string;
}

type PaymentOrderEvent = TypedObject<CheckoutProcessType.paymentOrder> & Order;

export interface EventsMap {
    [CheckoutProcessType.startServerPayment]: StartServerPaymentEvent;
    [CheckoutProcessType.startClientPayment]: StartClientPaymentEvent;
    [CheckoutProcessType.paymentOrder]: PaymentOrderEvent;
    [CheckoutProcessType.startWatchServerPayment]: StartWatchServerPaymentEvent;
    [CheckoutProcessType.error]: ErrorEvent;
    [CheckoutProcessType.transactionStatusChanged]: TransactionStatusChangedEvent;
    [CheckoutProcessType.transaction3ds]: Transaction3dsEvent;
    [CheckoutProcessType.paymentData]: PaymentDataEvent;
    [CheckoutProcessType.challengeRedirect]: ChallengeRedirectEvent;
}

const getEvent = <T extends keyof EventsMap>(
    type: T,
    data?: Omit<EventsMap[T], 'type'>,
): [T, Omit<EventsMap[T], 'type'> & { type: T }] => {
    return [
        type,
        {
            type,
            ...data,
        },
    ];
};

interface StartPaymentData {
    paymentMethod?: CardPaymentMethod;
    isServerApi: boolean;
    sheet: InitPaymentSheet;
    totalAmount: string;
    paymentMethodType: PaymentMethodType;
    billingContact?: Checkout.BillingContact;
    shippingContact?: Checkout.CheckoutShippingMethodContactData;
    shippingMethod?: Checkout.CheckoutShippingMethodData;
    merchantOrigin: string;
}

export class CheckoutProcess extends EventEmitter<EventsMap> {
    static getInstance = memoizeOnce((): CheckoutProcess => {
        return new CheckoutProcess();
    });

    public order: Order;

    private lastTransactionStatus: TransactionStatus;

    startPayment(data: StartPaymentData) {
        this.reset();

        if (data.isServerApi) {
            this.startServerPayment(data);
        } else {
            this.startClientPayment(data);
        }
    }

    private reset() {
        this.order = null;
        this.lastTransactionStatus = null;
    }

    cancelPayment() {
        this.reset();
        this.clear();
    }

    async startServerPayment({
        paymentMethod,
        isServerApi,
        sheet,
        totalAmount,
        paymentMethodType,
        ...extData
    }: StartPaymentData) {
        try {
            if (!paymentMethod && paymentMethodType !== PaymentMethodType.Cash) {
                throw new Error('Unable to create order: payment-method not set');
            }

            this.emit(...getEvent(CheckoutProcessType.startServerPayment));

            const order = await ServerApiModule.getInstance().createOrder({
                paymentMethodType,
                paymentMethod,
                ...extData,
            });

            this.order = {
                orderId: order.orderId,
                checkoutOrderId: order.checkoutOrderId,
            };

            if (paymentMethodType !== PaymentMethodType.Cash) {
                const transaction = await API.createTransaction(order.checkoutOrderId, {
                    cardId: paymentMethod.id,
                    browserData: getBrowserData(),
                    challengeReturnPath: getChallengeReturnPath(paymentMethod.id),
                });

                this.order.transactionId = transaction.data.transaction.transactionId;
                this.order.metadata = order.metadata;
            }

            this.emit(...getEvent(CheckoutProcessType.paymentOrder, this.order));

            if (paymentMethodType !== PaymentMethodType.Cash) {
                this.watchServerPayment();
            }
        } catch (error) {
            this.emit(
                ...getEvent(CheckoutProcessType.error, {
                    state: 'start_checkout',
                    error,
                }),
            );
        }
    }

    async watchServerPayment() {
        try {
            if (!this.order || !this.order.transactionId) {
                throw new Error('Unable to watch transaction status: order not set');
            }

            this.emit(...getEvent(CheckoutProcessType.startWatchServerPayment));

            await doUntil(WATCH_SERVER_PAYMENT_INTERVAL, async () => {
                // Если платёж отменён, стопаем вочер
                if (!this.order) {
                    return { continue: false };
                }

                const result = await API.getTransactionStatus(this.order.transactionId ?? '');

                const { transaction } = result.data;

                if (this.lastTransactionStatus === transaction.status) {
                    return { continue: true };
                }

                this.lastTransactionStatus = transaction.status;

                if (transaction.status === 'FAILED') {
                    this.emit(
                        ...getEvent(CheckoutProcessType.transactionStatusChanged, {
                            status: transaction.status,
                        }),
                    );

                    return { continue: false };
                }

                if (transaction.status === 'AUTHORIZED' || transaction.status === 'CHARGED') {
                    this.emit(
                        ...getEvent(CheckoutProcessType.transactionStatusChanged, {
                            status: transaction.status,
                        }),
                    );

                    return { continue: false };
                }

                if (
                    transaction.action &&
                    transaction.actionUrl &&
                    transaction.status === 'THREEDS_CHALLENGE'
                ) {
                    this.emit(
                        ...getEvent(CheckoutProcessType.transactionStatusChanged, {
                            status: transaction.status,
                        }),
                    );

                    this.emit(
                        ...getEvent(CheckoutProcessType.transaction3ds, {
                            method: transaction.action,
                            url: transaction.actionUrl,
                        }),
                    );

                    return { continue: true };
                }

                return { continue: true };
            });
        } catch (error) {
            this.emit(
                ...getEvent(CheckoutProcessType.error, {
                    state: 'wait_transaction',
                    error,
                }),
            );
        }
    }

    async startClientPayment({
        paymentMethod,
        isServerApi,
        sheet,
        totalAmount,
        paymentMethodType,
        merchantOrigin,
        ...extData
    }: StartPaymentData) {
        try {
            if (!paymentMethod?.id && paymentMethodType !== PaymentMethodType.Cash) {
                throw new Error('Unable to create order: payment-method-id not set');
            }

            const paymentMethodId = paymentMethod?.id || CASH_KEY;
            const challengeReturnPath = getChallengeReturnPath(paymentMethodId);

            this.emit(...getEvent(CheckoutProcessType.startClientPayment));

            const response = await API.checkout({
                merchantOrigin,
                cardId: paymentMethodId,
                sheet,
                paymentMethodType,
                challengeReturnPath,
                ...extData,
            });

            this.emit(...getEvent(CheckoutProcessType.paymentData, toPaymentData(response)));
        } catch (error) {
            logError(error, { fn: 'startClientPayment' });

            const [isChallengeRequired, redirectPath] = getChallengeParams(error);

            if (isChallengeRequired) {
                if (CHALLENGE_LIMIT_EXCEEDED) {
                    logError('[Challenge] The redirection limit has been exceeded');
                }

                if (!redirectPath) {
                    logError('[Challenge] Empty redirect path');
                }

                if (!CHALLENGE_LIMIT_EXCEEDED && redirectPath) {
                    this.emit(
                        ...getEvent(CheckoutProcessType.challengeRedirect, {
                            redirectPath,
                        }),
                    );

                    return;
                }
            }

            this.emit(
                ...getEvent(CheckoutProcessType.error, {
                    state: 'create_payment',
                    error,
                }),
            );
        }
    }
}
