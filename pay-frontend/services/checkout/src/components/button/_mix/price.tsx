import React from 'react';

import { withBemMod } from '@bem-react/core-fork';

import { Amount } from '../../amount';
import { Row } from '../../row';
import { IButtonProps, cnButton } from '../base';

import './price.scss';

interface ButtonVariantPriceProps {
    amount?: string;
    currency?: string;
}

export const withPrice = withBemMod<ButtonVariantPriceProps, IButtonProps>(
    cnButton(),
    { amount: '*' },
    (WrappedComponent) => {
        return ({ amount, currency, children, ...props }) => {
            return (
                <WrappedComponent {...props}>
                    <Row align="center" as="span">
                        {children}
                        <Row.Spacer />
                        <Row
                            shrink
                            className={cnButton('Price')}
                            as="span"
                            left="m"
                            type="inline"
                            align="center"
                        >
                            <Amount amount={amount} currency={currency} fullFraction />
                        </Row>
                    </Row>
                </WrappedComponent>
            );
        };
    },
);
