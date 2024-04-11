import React from 'react';

import { block } from 'bem-cn';

import Amount from '../ui/amount';
import BigButton from '../ui/big-button';
import Icon from '../ui/icon';

import './styles.css';

const b = block('pay-button');

type BigButtonProps = React.ComponentProps<typeof BigButton>;
interface PayButtonProps {
    title?: string;
    amount?: string;
    currency?: string;
    disabled?: boolean;
    enterCvv?: boolean;
    onClick: () => void;
}

export default function PayButton({
    title = 'Карта недоступна',
    amount,
    currency,
    disabled = false,
    onClick,
}: PayButtonProps): JSX.Element {
    const props: Partial<BigButtonProps> = {
        type: 'red',
        iconLeft: (): JSX.Element => (
            <Icon className={b('icon-left', { disabled })} glyph="ya-pay-logo" />
        ),
    };

    let buttonLabel = title;

    if (!disabled) {
        /**
         * TODO: i18n
         * buttonLabel = i18n('card-form', 'submit-pay');
         */
        buttonLabel = 'Оплатить';
        props.iconLeft = (): JSX.Element => <Icon className={b('icon-left')} glyph="ya-pay-logo" />;

        if (amount && currency) {
            props.iconRight = (): JSX.Element => (
                <span className={b('icon-right')}>
                    <Amount amount={amount} currency={currency} />
                </span>
            );
        }
    }

    return (
        <div className={b()}>
            <BigButton
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                disabled={disabled}
                onClick={onClick}
            >
                {buttonLabel}
            </BigButton>
        </div>
    );
}
