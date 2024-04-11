import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import { logInfo, logWarn, timeEnd, timeStart } from '@trust/rum';
import { timeRace } from '@trust/utils/promise/time-race';
import {
    MerchantErrors,
    MessageType,
    Order,
    InitPaymentSheet,
    UpdateErrorCode,
} from '@yandex-pay/sdk/src/typings';

import { toShippingAddress } from '../../api-transform/addresses';

import { FormConnection } from './connection';
import { RpcQueue } from './helpers/rpc-queue';

type RpcResponse<T extends Record<string, any>> = T & {
    order?: Order;
    errors?: MerchantErrors[];
};

enum RUM_DELTA_NAMES {
    Setup = 'setup',
    CouponChange = 'coupon.change',
    CouponReset = 'coupon.reset',
    ShippingAddressChange = 'shipping.address.change',
    ShippingOptionChange = 'shipping.option.change',
    PickupOptionChange = 'pickup.option.change',
    PickupInfoRequest = 'pickup.option.info-request',
    ShippingOptionReset = 'shipping.option.reset',
    PickupBoundsChange = 'pickup.bounds.change',
    PickupSetup = 'pickup.setup',
}

const TRACKING_TIMEOUT = 2000;
const RPC_REQUEST_TIMEOUT = 15000;
const RPC_SETUP_REQUEST_TIMEOUT = 5000;

const logWarnWithTime = (message: string, time: number) => {
    // @ts-ignore
    logWarn({ message }, { time });
};

const trackPeriodically = (name: string) => {
    let timer: NodeJS.Timeout;
    let times = 0;

    timer = setInterval(() => {
        times += 1;

        // отправляем в секундах
        logWarnWithTime(name, (times * TRACKING_TIMEOUT) / 1000);
    }, TRACKING_TIMEOUT);

    return () => {
        clearInterval(timer);
    };
};

const startTracking = (name: RUM_DELTA_NAMES) => {
    const clear = trackPeriodically(name);
    timeStart(name);

    return () => {
        clear();
        timeEnd(name);
    };
};

const boundsChangeQ = new RpcQueue();

export class CheckoutClientApi {
    static getInstance = memoizeOnce((): CheckoutClientApi => {
        return new CheckoutClientApi();
    });

    waitSheet(waitTimeout: number) {
        const conn = FormConnection.getInstance();

        const error = new Error('The payment sheet was not provided');
        const sheetP = new Promise<InitPaymentSheet>((resolve, reject) => {
            conn.once(MessageType.Payment, (data) => (data ? resolve(data.sheet) : reject(error)));
        });

        return timeRace(sheetP, waitTimeout, error);
    }

    setup() {
        const stopTracking = startTracking(RUM_DELTA_NAMES.Setup);

        type Response = RpcResponse<{
            pickupPoints?: Sdk.PickupPoint[];
        }>;
        const conn = FormConnection.getInstance();

        const emptyResponse: Response = {};
        const rejectWith = () => {
            stopTracking();
        };

        const setupP = new Promise<Response>((resolve) => {
            conn.once(MessageType.Setup, (data) => {
                if (data && data.setupData && data.setupData) {
                    stopTracking();
                    resolve(data.setupData as Response);
                }
            });
            conn.setup({ pickupPoints: true });
        });

        return timeRace(setupP, RPC_SETUP_REQUEST_TIMEOUT, rejectWith).catch(() => emptyResponse);
    }

    shippingAddressChange(address: Checkout.Address) {
        const stopTracking = startTracking(RUM_DELTA_NAMES.ShippingAddressChange);

        type Response = RpcResponse<{
            shippingOptions: Sdk.ShippingOption[];
        }>;
        const conn = FormConnection.getInstance();

        const error = () => {
            stopTracking();

            return new Error('The shipping options were not provided');
        };

        const shippingAddress = toShippingAddress(address);

        const shippingAddressP = new Promise<Response>((resolve) => {
            const offFn = conn.on(MessageType.Update, (data) => {
                if (data && data.updateData && data.updateData.shippingOptions) {
                    offFn();
                    stopTracking();
                    resolve(data.updateData as Response);
                }
            });
            conn.change({ shippingAddress });
        });

        return timeRace(shippingAddressP, RPC_REQUEST_TIMEOUT, error);
    }

    couponChange(coupon: Sdk.Coupon) {
        const stopTracking = startTracking(RUM_DELTA_NAMES.CouponChange);

        type Response = RpcResponse<{ order: Order }>;
        const conn = FormConnection.getInstance();

        const error = () => {
            stopTracking();

            return new Error('The order was not provided');
        };

        const couponP = new Promise<Response>((resolve, reject) => {
            // Ожидаю событие Update с новым order
            // в ответ на событие ниже conn.change
            const offFn = conn.on(MessageType.Update, (data) => {
                const error = data?.updateData?.errors?.find(
                    (e) => e.code === UpdateErrorCode.Coupon,
                );

                if (error) {
                    offFn();
                    stopTracking();

                    return reject(error.message);
                }

                if (data?.updateData?.order) {
                    offFn();
                    stopTracking();

                    return resolve(data.updateData as Response);
                }
            });

            conn.change({ coupon });
        });

        return timeRace(couponP, RPC_REQUEST_TIMEOUT, error);
    }

    couponReset() {
        const stopTracking = startTracking(RUM_DELTA_NAMES.CouponReset);

        type Response = RpcResponse<{ order: Order }>;
        const conn = FormConnection.getInstance();

        const error = () => {
            stopTracking();

            return new Error('The order was not provided');
        };

        const couponP = new Promise<Response>((resolve, reject) => {
            const offFn = conn.on(MessageType.Update, (data) => {
                if (data && data.updateData && data.updateData.order) {
                    offFn();
                    stopTracking();
                    resolve(data.updateData as Response);
                }
            });
            conn.reset({ coupon: true });
        });

        return timeRace(couponP, RPC_REQUEST_TIMEOUT, error);
    }

    /**
     * Метод не фейлится по таймеру, это важно, т.к.
     * 1 - эти запросы могут / будут идти параллельно, и фейлить их значит пропускать "запоздалые" ответы
     * 2 - метод используется в неблокирующем UI, и отсутствие ответа просто рисует прелоадер
     */
    pickupBoundsChange(bounds: Sdk.GeoBounds, center: Sdk.GeoPoint) {
        const taskQ = boundsChangeQ.task();

        const conn = FormConnection.getInstance();
        const stopTracking = startTracking(RUM_DELTA_NAMES.PickupBoundsChange);
        const startTime = performance.now();

        type Response = RpcResponse<{
            pickupPoints: Sdk.PickupPoint[];
        }>;

        return new Promise<Response>((resolve) => {
            taskQ.register(() => {
                const offFn = conn.on(MessageType.Update, (data) => {
                    if (data && data.updateData && data.updateData.pickupPoints) {
                        const pickupPoints = data.updateData.pickupPoints;

                        offFn();
                        taskQ.done();
                        stopTracking();
                        logInfo(new Error('pickupPointsTime'), {
                            time: performance.now() - startTime,
                            count: pickupPoints.length,
                        });
                        resolve({ pickupPoints });
                    }
                });
            });

            conn.change({
                pickupBounds: bounds,
                pickupArea: { bounds, center },
            });
        });
    }

    pickupInfoRequest(data: Sdk.PickupInfo) {
        const stopTracking = startTracking(RUM_DELTA_NAMES.PickupInfoRequest);

        type Response = RpcResponse<{
            pickupPoint?: Sdk.PickupPoint;
        }>;
        const conn = FormConnection.getInstance();

        const rejectWith = () => {
            stopTracking();
        };

        const pickupInfoRequestP = new Promise<Response>((resolve) => {
            conn.on(MessageType.Update, (data) => {
                if (data && data.updateData && data.updateData.pickupPoint) {
                    stopTracking();
                    resolve(data.updateData as Response);
                }
            });
            conn.change({ pickupInfo: data });
        });

        return timeRace(pickupInfoRequestP, RPC_REQUEST_TIMEOUT, rejectWith);
    }

    shippingOptionChange(shippingOption: Sdk.ShippingOption) {
        const stopTracking = startTracking(RUM_DELTA_NAMES.ShippingOptionChange);

        type Response = RpcResponse<{ order: Order }>;
        const conn = FormConnection.getInstance();

        const error = () => {
            stopTracking();

            return new Error('The order was not provided');
        };

        const shippingOptionP = new Promise<Response>((resolve) => {
            const offFn = conn.on(MessageType.Update, (data) => {
                if (data && data.updateData && data.updateData.order) {
                    offFn();
                    stopTracking();
                    resolve(data.updateData as Response);
                }
            });
            conn.change({ shippingOption });
        });

        return timeRace(shippingOptionP, RPC_REQUEST_TIMEOUT, error);
    }

    pickupPointChange(pickupPoint: Sdk.PickupPoint) {
        const stopTracking = startTracking(RUM_DELTA_NAMES.PickupOptionChange);

        type Response = RpcResponse<{ order: Order }>;
        const conn = FormConnection.getInstance();

        const error = () => {
            stopTracking();

            return new Error('The order was not provided');
        };

        const pickupOptionP = new Promise<Response>((resolve) => {
            const offFn = conn.on(MessageType.Update, (data) => {
                if (data && data.updateData && data.updateData.order) {
                    offFn();
                    stopTracking();
                    resolve(data.updateData as Response);
                }
            });
            conn.change({ pickupPoint });
        });

        return timeRace(pickupOptionP, RPC_REQUEST_TIMEOUT, error);
    }

    shippingOptionReset() {
        const stopTracking = startTracking(RUM_DELTA_NAMES.ShippingOptionReset);

        type Response = RpcResponse<{ order: Order }>;
        const conn = FormConnection.getInstance();

        return new Promise<Response>((resolve) => {
            const offFn = conn.on(MessageType.Update, (data) => {
                if (data && data.updateData && data.updateData.order) {
                    offFn();
                    stopTracking();
                    resolve(data.updateData as Response);
                }
            });
            conn.reset({ shippingOption: true });
        });
    }
}
