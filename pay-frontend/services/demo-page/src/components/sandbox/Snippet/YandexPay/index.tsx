import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import * as Sdk from '@yandex-pay/sdk/src/typings';

import { buttonContext } from '../../../../store/button';
import { resultContext } from '../../../../store/result';
import { scenarioContext } from '../../../../store/scenario';

import PickupPoints from './pickup-points';

const normalizeSchedule = (schedule) => {
    if (!schedule) {
        return null;
    }

    return schedule
        .split(', ')
        .map((el) => el.split(': '))
        .map(([label, info]) => ({
            label,
            timeFrom: info.split('-')[0],
            timeTo: info.split('-')[1],
        }));
};

const normalize = (data: any): Sdk.PickupOption => {
    const [latitude, longitude] = data.GPS.split(',');

    return {
        id: data.Code,
        label: data.Name,
        address: data.Address,
        info: {
            schedule: normalizeSchedule(data.WorkShedule),
            contacts: [data.Phone],
            description: data.TripDescription,
        },
        date: 0,
        amount: '',
        coordinates: [Number(latitude), Number(longitude)],
    };
};

const OPTIONS: Sdk.PickupOption[] = PickupPoints.map(normalize);

function isCoordinatesInArea(
    area: Sdk.PickupAddress['coordinates'],
    coordinates: [Number, Number],
) {
    const { latitude: minLatitude, longitude: minLongitude } = area[0];
    const { latitude: maxLatitude, longitude: maxLongitude } = area[1];

    const [longitude, latitude] = coordinates;

    return (
        longitude > minLongitude &&
        longitude < maxLongitude &&
        latitude > minLatitude &&
        latitude < maxLatitude
    );
}

function getPickupOptionList({ coordinates }: Sdk.PickupAddress): Sdk.PickupOption[] {
    return OPTIONS.filter((opt) => isCoordinatesInArea(coordinates, opt.coordinates));
}

function getInitialOptionList() {
    return getPickupOptionList({
        coordinates: [
            { longitude: 55.468877418368145, latitude: 37.29917456624078 },
            { longitude: 56.01426435898404, latitude: 37.90342261311579 },
        ],
    });
}

interface YandexPayProps {
    className: string;
    onReady: () => void;
    onProcess: () => void;
    onSuccess: () => void;
    onError: () => void;
    onDisabled: () => void;
}

export function YandexPay({
    className,
    onReady,
    onProcess,
    onSuccess,
    onError,
    onDisabled,
}: YandexPayProps): JSX.Element {
    const styleRef = useRef<HTMLStyleElement>();
    const buttonBoxRef = useRef<HTMLDivElement>();
    const [button, setButton] = useState<Sdk.Button>();
    const [payment, setPayment] = useState<Sdk.Payment>();

    const scenario = useContext(scenarioContext);
    const buttonCtx = useContext(buttonContext);
    const resultCtx = useContext(resultContext);

    const createButton = useCallback(() => {
        const { YaPay } = window;

        if (!payment) {
            return;
        }

        // @ts-ignore
        const _button = YaPay.Button.create(buttonCtx.style);

        _button.on(Sdk.ButtonEventType.Click, () => {
            resultCtx.start();
            payment.checkout();
        });

        _button.mount(buttonBoxRef.current);

        setButton((prev) => {
            if (prev) {
                prev.unmount();
            }

            return _button;
        });
    }, [payment, buttonCtx]);

    useEffect(() => {
        const { YaPay } = window;

        if (!payment || !YaPay) {
            return;
        }

        const { order } = scenario.sheet.data;
        const offFnList: Sys.CallbackFn0[] = [];

        new Promise((resolve, reject) => {
            onReady();

            // TODO: только для теста ошибок
            const counter = {
                shippingAddress: 0,
                shippingOption: 0,
            };

            offFnList.push(
                payment.on(Sdk.PaymentEventType.Process, (event) => {
                    resolve(event);
                }),
                payment.on(Sdk.PaymentEventType.Abort, (event) => {
                    reject(event);
                }),
                payment.on(Sdk.PaymentEventType.Error, (event) => {
                    reject(event);
                }),
                payment.on(Sdk.PaymentEventType.Change, (event) => {
                    resultCtx.append({ event });

                    if (event.shippingAddress) {
                        setTimeout(() => {
                            counter.shippingAddress += 1;

                            if (counter.shippingAddress === 3) {
                                return;
                            }

                            if (counter.shippingAddress === 4) {
                                return payment.update({ shippingOptions: [] });
                            }

                            payment.update({ shippingOptions: scenario.shipping.active });
                        }, 500);
                    }

                    if (event.shippingOption) {
                        setTimeout(() => {
                            counter.shippingOption += 1;

                            if (counter.shippingOption === 3) {
                                return;
                            }

                            const shippingAmount = event.shippingOption.amount;

                            payment.update({
                                order: {
                                    ...order,
                                    items: [
                                        ...order.items,
                                        {
                                            label: 'Доставка курьером',
                                            amount: event.shippingOption.amount,
                                        },
                                    ],
                                    total: {
                                        label: 'Итого',
                                        amount: (
                                            Number(order.total.amount) + Number(shippingAmount)
                                        ).toFixed(),
                                    },
                                },
                            });
                        }, 500);
                    }

                    if (event.pickupAddress) {
                        setTimeout(() => {
                            payment.update({
                                pickupOptions: getPickupOptionList(event.pickupAddress),
                            });
                        }, 500);
                    }

                    if (event.pickupOption) {
                        setTimeout(() => {
                            const shippingAmount = event.pickupOption.amount;

                            payment.update({
                                order: {
                                    ...order,
                                    items: [
                                        ...order.items,
                                        {
                                            label: 'Доставка до пункта выдачи',
                                            amount: event.pickupOption.amount,
                                        },
                                    ],
                                    total: {
                                        label: 'Итого',
                                        amount: (
                                            Number(order.total.amount) + Number(shippingAmount)
                                        ).toFixed(),
                                    },
                                },
                            });
                        }, 500);
                    }

                    if (event.coupon) {
                        if (event.coupon === 'timeout') {
                            return;
                        }

                        setTimeout(() => {
                            if (event.coupon === '123') {
                                payment.update({
                                    order: {
                                        id: order.id,
                                        total: {
                                            ...order.total,
                                            amount: parseFloat(order.total.amount) * 0.9 + '',
                                        },
                                        items: [
                                            ...order.items,
                                            {
                                                type: YaPay.OrderItemType.Promocode,
                                                amount: parseFloat(order.total.amount) * -0.1 + '',
                                                label: 'Промокод',
                                            },
                                        ],
                                    },
                                });
                            } else {
                                payment.update({
                                    errors: [
                                        {
                                            code: YaPay.UpdateErrorCode.Coupon,
                                            message: 'Промокод не найден',
                                        },
                                    ],
                                });
                            }
                        }, 500);
                    }
                }),
                payment.on(Sdk.PaymentEventType.Reset, (event) => {
                    resultCtx.append({ event });

                    if (event.shippingOption) {
                        setTimeout(() => {
                            payment.update({
                                order,
                            });
                        }, 500);
                    }
                }),
                payment.on(Sdk.PaymentEventType.Setup, (event) => {
                    resultCtx.append({ event });

                    if (event.pickupOptions) {
                        setTimeout(() => {
                            payment.update({
                                pickupOptions: getInitialOptionList(),
                            });
                        }, 500);
                    }
                }),
            );
        }).then(
            (event) => {
                resultCtx.append({ event });
                onProcess();

                setTimeout(() => {
                    payment.complete(Sdk.CompleteReason.Success);
                    onSuccess();
                }, 3000);
            },
            (event) => {
                resultCtx.append({ event });
                onError();
            },
        );

        return () => {
            offFnList.forEach((fn) => fn());
        };
    }, [payment, scenario]);

    useEffect(() => {
        const { YaPay } = window;

        resultCtx.reset();

        YaPay.createPayment(scenario.sheet.data)
            .then((_payment) => {
                setPayment((prev) => {
                    if (prev) {
                        prev.destroy();
                    }

                    return _payment;
                });
            })
            .catch((err) => {
                resultCtx.append({ error: err });
                resultCtx.start();

                onDisabled();

                setButton((prev) => {
                    if (prev) {
                        prev.unmount();
                    }

                    return undefined;
                });
            });
    }, [scenario.sheet.version]);

    useEffect(() => {
        createButton();
    }, [payment, buttonCtx.style, buttonCtx.buttonId]);

    // @ts-ignore
    useEffect(() => {
        const { customStyle, useCustomStyle } = buttonCtx;

        if (styleRef.current) {
            if (useCustomStyle) {
                styleRef.current.textContent = `html .ya-pay-button {
              border-radius: ${customStyle['border-radius']}px;
              width: ${customStyle.width}px;
              height: ${customStyle.height}px;
          }`;
            } else {
                styleRef.current.textContent = '';
            }
        }
    }, [buttonCtx.useCustomStyle, buttonCtx.customStyle]);

    useEffect(() => {
        if (payment) {
            payment.update(scenario.sheet.data);
        }
    }, [payment, scenario.sheet.data]);

    return (
        <>
            <style ref={styleRef} />
            <div className={className} ref={buttonBoxRef} />
        </>
    );
}
