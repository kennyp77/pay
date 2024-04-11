import * as React from 'react';

import { classnames } from '@bem-react/classnames';

import { Panel } from 'components/panel';
import { PanelOption } from 'components/panel-option';
import { Toggle } from 'components/toggle';
import { Coupon } from 'data/coupons';
import { useOption } from 'hooks/use-options';

function CouponsTumbler() {
    const [coupons, setCoupons] = useOption(['coupons']);

    return <Toggle name="coupons" checked={coupons} onChange={setCoupons} />;
}

export const Coupons = function Coupons() {
    return (
        <Panel caption="Промокоды">
            <PanelOption label="Включены">
                <CouponsTumbler />
            </PanelOption>

            <PanelOption label="Валидный -10%">
                <span
                    className={classnames(
                        'px-2',
                        'py-1.5',
                        'bg-blue-gray-100',
                        'dark:bg-blue-gray-1900',
                        'rounded-lg',
                        'font-mono',
                        'font-bold',
                        'text-green-1100',
                        'dark:text-green-700',
                    )}
                >
                    {Coupon.Valid10}
                </span>
            </PanelOption>

            <PanelOption label="Валидный -50%">
                <span
                    className={classnames(
                        'px-2',
                        'py-1.5',
                        'bg-blue-gray-100',
                        'dark:bg-blue-gray-1900',
                        'rounded-lg',
                        'font-mono',
                        'font-bold',
                        'text-green-1100',
                        'dark:text-green-700',
                    )}
                >
                    {Coupon.Valid50}
                </span>
            </PanelOption>

            <PanelOption label="Просрочен">
                <span
                    className={classnames(
                        'px-2',
                        'py-1.5',
                        'bg-blue-gray-100',
                        'dark:bg-blue-gray-1900',
                        'rounded-lg',
                        'font-mono',
                        'font-bold',
                        'text-blue-gray-1100',
                    )}
                >
                    {Coupon.Expired}
                </span>
            </PanelOption>
        </Panel>
    );
};
