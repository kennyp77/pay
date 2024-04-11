import React from 'react';

import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';

import { Amount } from '../../../../components/amount';
import { Dropdown } from '../../../../components/dropdown';
import { Icon } from '../../../../components/icons';
import { Row } from '../../../../components/row';
import { Text } from '../../../../components/text';
import { getCurrencyCode, getTotalAmount } from '../../../../store/payment';
import { MainCart } from '../cart';

import ArrowBottomIcon from './assets/arrow-bottom.svg';
import CartIcon from './assets/cart.svg';

import './styles.scss';

const cnMainCartButton = cn('MainCartButton');

export function MainCartButton(): JSX.Element {
    const totalAmount = useSelector(getTotalAmount);
    const currencyCode = useSelector(getCurrencyCode);

    return (
        <div className={cnMainCartButton()}>
            <Dropdown
                content={<MainCart height="fixed" />}
                className={cnMainCartButton('DropdownContent')}
                direction="bottom"
            >
                <Row align="center" className={cnMainCartButton('Content')}>
                    <Icon svg={CartIcon} size="xs" />
                    <Text inline left="xs" right="2xs">
                        <Amount amount={totalAmount} currency={currencyCode} fullFraction />
                    </Text>
                    <Icon
                        svg={ArrowBottomIcon}
                        size="s"
                        className={cnMainCartButton('ArrowDownIcon')}
                    />
                </Row>
            </Dropdown>
        </div>
    );
}
