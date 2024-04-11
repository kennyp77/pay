import React, { useCallback, useRef, useState } from 'react';

import { cn } from '@bem-react/classname';
import { OrderItemType, ShippingType } from '@yandex-pay/sdk/src/typings';
import { useSelector } from 'react-redux';

import { Amount } from '../../../../components/amount';
import { Box } from '../../../../components/box';
import { Col } from '../../../../components/col';
import { Divider } from '../../../../components/divider';
import { Icon } from '../../../../components/icons';
import QuestionSvg from '../../../../components/icons/assets/question.svg';
import { ExpressIcon } from '../../../../components/icons/express-icon';
import { Popup } from '../../../../components/popup';
import { Row } from '../../../../components/row';
import { Text } from '../../../../components/text';
import { getReadableQuantity } from '../../../../helpers/order';
import { isYandexExpress } from '../../../../helpers/shippings';
import {
    getCashbackAmount,
    getCurrencyCode,
    getSheetItemsSorted,
    getTotalAmount,
} from '../../../../store/payment';
import { getSelectedShippingOption, getShippingType } from '../../../../store/shipping';
import { isPayWithSplit } from '../../../../store/split';
import { MerchantLogo } from '../merchant-logo';

import './styles.scss';

const cnMainCart = cn('MainCart');

const i18n = (v: string) => v;

interface MainCartProps {
    hideQuantity?: boolean;
    height?: 'auto' | 'fixed';
}

export function MainCart({ hideQuantity, height = 'auto' }: MainCartProps): JSX.Element {
    const sheetItems = useSelector(getSheetItemsSorted);
    const currencyCode = useSelector(getCurrencyCode);
    const totalAmount = useSelector(getTotalAmount);
    const cashbackAmount = useSelector(getCashbackAmount);
    const shippingOption = useSelector(getSelectedShippingOption);
    const shippingType = useSelector(getShippingType);
    const payWithSplit = useSelector(isPayWithSplit);
    const plusPopupAnchor = useRef(null);
    const [plusPopupVisible, setPlusPopupVisible] = useState(false);

    const switchPlusPopup = useCallback(
        () => setPlusPopupVisible((visible) => !visible),
        [setPlusPopupVisible],
    );

    const handleClose = useCallback(() => setPlusPopupVisible(false), [setPlusPopupVisible]);

    const hasYandexShipping = Boolean(
        shippingType === ShippingType.Direct && shippingOption && isYandexExpress(shippingOption),
    );

    return (
        <Col className={cnMainCart()}>
            <MerchantLogo bottom="m" align="center" className={cnMainCart('StoreLogo')} />
            <div className={cnMainCart('CartItems', { height })}>
                <table>
                    <tbody>
                        {sheetItems.map((item, i) => (
                            <tr key={i} className={cnMainCart('item')}>
                                <td>
                                    <Text right="s" variant="s" inline>
                                        {item.label}
                                        {!hideQuantity && item.quantity ? (
                                            <Text inline color="grey" variant="s" left="xs">
                                                {getReadableQuantity(item.quantity)}
                                            </Text>
                                        ) : null}
                                        {item.type === OrderItemType.Shipping &&
                                            hasYandexShipping && (
                                                <ExpressIcon
                                                    className={cnMainCart('ExpressIcon')}
                                                />
                                            )}
                                    </Text>
                                </td>
                                <td>
                                    <Text
                                        align="right"
                                        variant="s"
                                        color={
                                            item.type === OrderItemType.Discount ||
                                            item.type === OrderItemType.Promocode
                                                ? 'red'
                                                : 'black'
                                        }
                                    >
                                        <Amount
                                            amount={item.amount}
                                            currency={currencyCode}
                                            fullFraction
                                        />
                                    </Text>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Box top="m">
                <Divider color="grey" />
            </Box>

            <Row justify="between" top="m" className={cnMainCart('TotalAmount')}>
                <Text variant="m" right="l">
                    {i18n('ИТОГО')}
                </Text>
                <Text variant="m">
                    <Amount amount={totalAmount} currency={currencyCode} fullFraction />
                </Text>
            </Row>

            {Number(cashbackAmount) > 0 && (
                <Row top="m">
                    <Text right="xs" variant="s">
                        {i18n('Кешбэк Баллами Плюса')}
                    </Text>
                    {payWithSplit ? (
                        <span
                            className={cnMainCart('QuestionMark')}
                            ref={plusPopupAnchor}
                            onClick={switchPlusPopup}
                        >
                            <Icon size="xs" svg={QuestionSvg} />
                        </span>
                    ) : null}
                    <Row.Spacer />
                    <Text variant="s">
                        <Amount amount={cashbackAmount} currency="PLUS" />
                    </Text>
                    <Popup
                        view="default"
                        direction="top"
                        target="anchor"
                        hasTail
                        anchor={plusPopupAnchor}
                        visible={plusPopupVisible}
                        onClose={handleClose}
                        theme="dark"
                    >
                        <div className={cnMainCart('PlusPopup')}>
                            <Text color="white" variant="header-s">
                                {i18n('Баллы Плюса')}
                            </Text>
                            <Text color="white" top="s" variant="s">
                                {i18n(
                                    'Баллы будут зачислены на Ваш счет после оплаты последней части платежа.',
                                )}
                            </Text>
                            <Text color="white" top="xs" variant="s">
                                {i18n(
                                    'Зачисление происходит в установленные сроки. Максимальное количество баллов, доступных к начислению, в календарный месяц - не более 3000.',
                                )}
                            </Text>
                        </div>
                    </Popup>
                </Row>
            )}
        </Col>
    );
}
