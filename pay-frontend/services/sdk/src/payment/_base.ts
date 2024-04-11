import { logError, logWarn, logFatal } from '@trust/rum/light/error-logger';
import { ConnectionManager } from '@trust/utils/connections/connection-manager';
import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { IConnectionAgent } from '@trust/utils/connections/types';
import { debug } from '@trust/utils/debug';
import { dom } from '@trust/utils/dom';
import { isInFrame } from '@trust/utils/window';

import { Button } from '../button';
import { FORM_NAME, FORM_SIZE } from '../config';
import {
    getBaseFormUrl,
    getFormUrl,
    getFormName,
    getWindowFeatures,
} from '../helpers/payment-form';
import { isV3PaymentData } from '../helpers/payment-sheet';
import { isFirefox } from '../helpers/user-agent';
import { innerEmitter } from '../inner-emitter';
import { pageFocusWatcher } from '../lib/page-focus-watcher';
import { counters } from '../metrika';
import { Overlay } from '../overlay';
import {
    PaymentType,
    InitPaymentData,
    InitPaymentSheet,
    PaymentEventType,
    PaymentEvent,
    ReadyEvent,
    InnerEventType,
    AbortEvent,
    AbortEventReason,
    ErrorEvent,
    ProcessEvent,
    ChangeEvent,
    PaymentEnv,
    SetupPaymentData,
    UpdatePaymentData,
    CompleteReason,
    MessageType,
    PingEvent,
    Message,
    ResetEvent,
    SetupEvent,
    PaymentMethodType,
    SuccessEvent,
    ButtonParent,
    ButtonOptions,
    ButtonEventType,
} from '../typings';

import { PaymentEmitter } from './_emitter';
import { PaymentProxy } from './proxy';

interface EventsMap {
    [PaymentEventType.Ready]: ReadyEvent;
    [PaymentEventType.Abort]: AbortEvent;
    [PaymentEventType.Error]: ErrorEvent;
    [PaymentEventType.Process]: ProcessEvent;
    [PaymentEventType.Ping]: PingEvent;
    [PaymentEventType.Change]: ChangeEvent;
    [PaymentEventType.Reset]: ResetEvent;
    [PaymentEventType.Setup]: SetupEvent;
    [PaymentEventType.Success]: SuccessEvent;
}

interface ResolversMap {
    [PaymentEventType.Setup]: SetupPaymentData;
    [PaymentEventType.Change]: UpdatePaymentData;
    [PaymentEventType.Reset]: UpdatePaymentData;
}

// Задержка перед эмитом process-event'a
// для того чтобы фокус успел вернуться на окно мерча
// Это критично в webview
const MAX_DELAY_BEFORE_SEND_TOKEN = 5000;

const MAX_DELAY_TO_SEND_COUNTERS = 1500;

const CLOSE_CHECK_TIMEOUT = 3000;

// TODO: extends YaPay.Payment
export class BasePayment extends PaymentEmitter<EventsMap, ResolversMap> {
    protected checkoutCounter = 0;
    protected overlay: Overlay;
    protected connectionOptions: ConnectionOptions;
    protected connectionManager: ConnectionManager<PaymentEvent, Message>;
    protected connectionAgent: IConnectionAgent<Message>;
    protected checkTargetOpeningTimer: NodeJS.Timeout;
    protected paymentCompleted: boolean;
    protected formLoading: boolean = false;

    protected formBaseUrl: string;
    protected formWindowFeatures?: string;

    protected buttons: Button[] = [];

    public env: PaymentEnv;
    public sheet: InitPaymentSheet;
    public type: PaymentType;

    constructor(paymentData: InitPaymentData, type: PaymentType) {
        super();
        this.logIfMissedImportantSubscribers();

        try {
            const { env = PaymentEnv.Production, ...sheet } = paymentData;

            this.env = env;
            this.type = type;
            this.sheet = sheet;
            this.overlay = Overlay.getInstance();
            this.overlay.on(Overlay.Events.Click, this.onOverlayClick);

            this.formBaseUrl = getBaseFormUrl(sheet, type);
            this.formWindowFeatures = getWindowFeatures(FORM_SIZE);

            const formUrl = getFormUrl(this.formBaseUrl, sheet, { env });
            const formName = getFormName(FORM_NAME, sheet);

            this.connectionOptions = new ConnectionOptions(formUrl, formName);
            this.connectionManager = new ConnectionManager(this.connectionOptions);
            this.connectionManager.on(this.onMessage);

            this.resolvers[PaymentEventType.Change] = (data?: UpdatePaymentData) => {
                if (data) {
                    this.update(data);
                }
            };

            this.resolvers[PaymentEventType.Reset] = (data?: UpdatePaymentData) => {
                if (data) {
                    this.update(data);
                }
            };

            this.resolvers[PaymentEventType.Setup] = (data?: SetupPaymentData) => {
                if (data) {
                    this.setup(data);
                }
            };

            dom.on(window, 'beforeunload', this.onBeforeUnload);
            dom.on(window, 'unload', this.onBeforeUnload);

            counters.paymentInit(sheet);
        } catch (err) {
            logError('payment create', err);
        }
    }

    public mountButton(parent: ButtonParent, options: ButtonOptions): void {
        const button = new Button(options, new PaymentProxy(this));

        button.mount(parent);

        button.on(ButtonEventType.Click, () => this.checkout());

        this.buttons.push(button);
    }

    protected setup(setupData: SetupPaymentData): void {
        if (this.connectionAgent && this.connectionAgent.isConnected) {
            this.connectionAgent.send({
                type: MessageType.Setup,
                setupData,
            });
        }
    }

    protected update(updateData: UpdatePaymentData): void {
        if (updateData.order) {
            this.sheet.order = updateData.order;

            innerEmitter.emit(InnerEventType.PaymentUpdate, undefined);
        }

        if (updateData.metadata) {
            this.sheet.metadata = updateData.metadata;
        }

        if (this.connectionAgent && this.connectionAgent.isConnected) {
            this.connectionAgent.send({
                type: MessageType.Update,
                updateData,
            });

            if (this.formLoading) {
                logError(`Update on loading, type: ${this.type}`);
            }
        }
    }

    complete(reason: CompleteReason, errors?: any): void {
        counters.paymentComplete(this.sheet, reason);

        if (!this.connectionAgent) {
            logError('Complete on undefined agent');

            return;
        }

        if (this.connectionAgent.isConnected) {
            this.connectionAgent.send({
                type: MessageType.Complete,
                reason,
                errors: JSON.stringify(errors),
            });
        } else {
            logError('Complete on unconnected agent');
            this.destroyChannel();
        }
    }

    protected checkout(): Promise<void> {
        try {
            if (this.connectionAgent) {
                this.connectionAgent.focus();

                return;
            }

            this.checkoutCounter += 1;
            this.paymentCompleted = false;
            this.formLoading = true;

            counters.paymentCheckout(this.sheet, this.checkoutCounter);

            // NB: В FF открываем в соседнем табе
            const windowFeatures = isFirefox ? undefined : this.formWindowFeatures;
            const formUrl = getFormUrl(this.formBaseUrl, this.sheet, {
                checkoutCounter: this.checkoutCounter,
                env: this.env,
                type: this.type,
            });

            this.connectionManager.options.targetUrl = formUrl;
            this.connectionAgent = this.connectionManager.open(
                {
                    type: MessageType.Payment,
                    sheet: this.sheet,
                },
                windowFeatures,
                this.checkIsInFrame,
            );

            this.startCheckingTargetOpening({
                type: PaymentEventType.Abort,
                reason: AbortEventReason.Close,
            });

            // NB: В FF нет фокуса на табе.
            if (!isFirefox) {
                this.overlay.show();
            }
        } catch (err) {
            logError('payment checkout', err);
        }
    }

    protected onMessage = (event: PaymentEvent): void => {
        if (!event || !event.type) {
            return;
        }

        switch (event.type) {
            case PaymentEventType.Ready:
                this.formLoading = false;
                this.emit(event.type, event);
                break;

            case PaymentEventType.Change:
                this.emit(event.type, event);
                break;

            case PaymentEventType.Reset:
                this.emit(event.type, event);
                break;

            case PaymentEventType.Setup:
                this.emit(event.type, event);
                break;

            case PaymentEventType.Success:
            case PaymentEventType.Process:
                // NB: Отправляем через колбэк, для гарантии доставки
                //     YANDEXPAY-2400
                const eventProcessCb = (counterError?: string) => {
                    if (counterError) {
                        logError('error-process-counter', new Error(counterError));
                    }

                    const keepWindowOpen =
                        event.type === PaymentEventType.Success ||
                        (event.type === PaymentEventType.Process &&
                            event.paymentMethodInfo.type === PaymentMethodType.Split);

                    // NB: Помечаем paymentCompleted, чтобы не выбросить abort событие
                    // здесь, а не в pageFocusWatcher, потому что всё равно будем эмитить успех,
                    // а если поставить paymentCompleted позднее, то abort вылезет
                    this.completeCheckout();

                    if (!keepWindowOpen) {
                        this.closeCheckoutWindow('process');
                    }

                    // NB: Ждем фокуса чтобы на странице мог пройти form-submit
                    //     (у некоторых мерчей он есть)
                    pageFocusWatcher((trigger, state) => {
                        if (trigger) {
                            logWarn(`Unexpected page focus (trigger=${trigger} state=${state})`);
                        }

                        this.emit(event.type, event);
                    }, MAX_DELAY_BEFORE_SEND_TOKEN);
                };

                counters.paymentProcess(this.sheet, MAX_DELAY_TO_SEND_COUNTERS, eventProcessCb);
                break;

            case PaymentEventType.Abort:
                // NB: Закрываем через чекер, т.к. мог быть рефреш.
                this.startCheckingTargetOpening(event);
                break;

            case PaymentEventType.Error:
                // NB: Закрываем через чекер, т.к. форма может быть не закрыта.
                this.completeCheckout();
                this.closeCheckoutWindow('error');
                this.emit(event.type, event);
                break;

            case PaymentEventType.Ping:
                this.connectionAgent.send({ type: MessageType.Ping });
                break;

            default:
            /* nothing */
        }
    };

    private completeCheckout(): void {
        this.paymentCompleted = true;
        this.formLoading = false;

        if (this.overlay) {
            this.overlay.hide();
        }
    }

    private closeCheckoutWindow(from: string): void {
        if (this.connectionAgent && this.connectionAgent.isConnected) {
            this.connectionAgent.close();
            this.stopCheckingTargetOpening();

            setTimeout(() => {
                if (this.connectionAgent && this.connectionAgent.isConnected) {
                    logFatal(`Yandex pay not closed (source=sdk, from=${from})`);
                }
            }, CLOSE_CHECK_TIMEOUT);
        }
    }

    protected onOverlayClick = (): void => {
        if (this.connectionAgent) {
            this.connectionAgent.focus();
        }
    };

    protected onBeforeUnload = (): void => {
        this.destroyChannel();
    };

    destroy(): void {
        super.destroy();
        this.complete(CompleteReason.Close);
        this.destroyChannel();

        this.sheet = undefined;

        if (this.connectionManager) {
            this.connectionManager.destroy();
            this.connectionManager = null;
        }

        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }

        this.buttons.forEach((button) => button.destroy());
    }

    protected destroyChannel(): void {
        if (__DEV__) {
            debug('Destroy channel');
        }

        this.stopCheckingTargetOpening();

        if (this.connectionAgent) {
            this.connectionAgent.destroy();
            this.connectionAgent = null;
        }

        if (this.overlay) {
            this.overlay.hide();
        }
    }

    protected onTargetOpeningCheck = (event: AbortEvent | ErrorEvent): void => {
        const isNotConnected = !(this.connectionAgent && this.connectionAgent.isConnected);

        if (!this.paymentCompleted && isNotConnected) {
            this.completeCheckout();
            this.destroyChannel();
            this.emit(event.type, event);
        }
    };

    protected startCheckingTargetOpening(event: AbortEvent | ErrorEvent): void {
        this.stopCheckingTargetOpening();

        if (__DEV__) {
            debug('Start checking target opening');
        }

        this.checkTargetOpeningTimer = setInterval(this.onTargetOpeningCheck, 500, event);
    }

    protected stopCheckingTargetOpening(): void {
        if (__DEV__) {
            debug('Stop checking target opening');
        }

        if (this.checkTargetOpeningTimer) {
            clearInterval(this.checkTargetOpeningTimer);

            this.checkTargetOpeningTimer = undefined;
        }
    }

    private checkIsInFrame(): boolean {
        const inFrame = isInFrame();

        if (inFrame) {
            logError('Yandex Pay in query mode in iFrame');
        }

        return inFrame;
    }

    private logIfMissedImportantSubscribers(): void {
        // Функция проверяет наличие подписчиков, которые могут появиться только после создания объекта.
        // setTimeout нужен, чтобы сначала синхронно выполнился код конструктора и следующий за ним.

        setTimeout(() => {
            const listener = isV3PaymentData(this.sheet)
                ? PaymentEventType.Success
                : PaymentEventType.Process;

            if (!this.hasListener(listener)) {
                console.warn(
                    `Yandex.Pay: Payment object requires subscriptions on %c${listener} event`,
                    'font-weight: bold;',
                );
                logWarn(`Missed Payment subscription: ${listener}`);
            }
        }, 10);
    }
}
