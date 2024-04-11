import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { classnames } from '@bem-react/classnames';
import * as Sdk from '@yandex-pay/sdk/src/typings';

import { Icon } from 'components/icon';
import { getCustomSheet } from 'helpers/get-custom-sheet';

export interface AdditionalOption {
    cashback: boolean;
    split: boolean;
}

export type Extra = 'bills' | 'fall';

export interface AppearanceMetadata extends Record<string, any> {
    theme: Sdk.ButtonTheme;
    showCard: boolean;
    showAvatar: boolean;
    additionalOption: AdditionalOption;
    type: Sdk.ButtonType;
    extra?: Extra;
}

interface CustomAppearanceProps {
    appearanceMetadata: AppearanceMetadata;
    YaPay: Sdk.YaPay;
    className?: string;
}

export const YandexPayCustomAppearance: React.FC<CustomAppearanceProps> =
    function YandexPayCustomAppearance({ className, appearanceMetadata, YaPay }) {
        const buttonContainerRef = useRef<HTMLDivElement>(null);

        const paymentRef = useRef<Sdk.Payment | null>(null);
        const buttonRef = useRef<Sdk.Button | null>(null);
        const unmountRef = useRef<boolean>(false);

        const setup = useCallback(async () => {
            const paymentSheet = getCustomSheet(appearanceMetadata);
            const payment = await YaPay.createPayment(paymentSheet);

            if (!buttonContainerRef.current) {
                console.error('buttonContainerRef is undefined');

                return null;
            }

            const button = payment.createButton({
                type: appearanceMetadata.type,
                theme: appearanceMetadata.theme,
                width: Sdk.ButtonWidth.Max,
            });

            button.on(Sdk.ButtonEventType.Click, () => {
                console.log('clicked button with props:', appearanceMetadata);
            });

            button.mount(buttonContainerRef.current);

            payment.on(Sdk.PaymentEventType.Process, () => {});
            payment.on(Sdk.PaymentEventType.Abort, () => {});
            payment.on(Sdk.PaymentEventType.Error, () => {});

            paymentRef.current = payment;
            buttonRef.current = button;
        }, [appearanceMetadata, YaPay]);

        useEffect(() => {
            setup().catch((err) => {
                console.error(err);
            });

            return () => {
                unmountRef.current = true;
                paymentRef.current?.destroy();
                buttonRef.current?.destroy();
            };
        }, [setup]);

        return (
            <div>
                <div className={classnames('flex', 'items-center')}>
                    {appearanceMetadata.type}
                    <span style={{ flexGrow: 1 }} />
                    <span
                        className={classnames(
                            appearanceMetadata.showCard ? 'text-green-500' : 'text-rose-500',
                        )}
                    >
                        <Icon type="card" />
                    </span>

                    <span
                        className={classnames(
                            appearanceMetadata.showAvatar ? 'text-green-500' : 'text-rose-500',
                        )}
                    >
                        <Icon type="user" height={14} />
                    </span>
                </div>
                <div
                    className={classnames(
                        'flex',
                        'items-center',
                        'mt-1',
                        'h-14',
                        'justify-center',
                        'content-box',
                        className,
                    )}
                    ref={buttonContainerRef}
                />
                <div className={classnames('overflow-hidden')}>
                    {appearanceMetadata.extra ? `extra: ${appearanceMetadata.extra}` : null}
                </div>
            </div>
        );
    };
