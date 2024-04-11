import React, { useCallback, useState } from 'react';

import { cn } from '@bem-react/classname';
import { hasCashPaymentMethod } from '@trust/utils/payment-sheet';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { PaymentOrCardRawIcon } from '../../components/bank-card-icon';
import { Button } from '../../components/button';
import { ListButtonRadioPayment } from '../../components/list-button';
import { Panel, PanelHeader } from '../../components/panel';
import { Row } from '../../components/row';
import { SecureInfo } from '../../components/secure';
import { Text } from '../../components/text';
import { MAX_BOUND_CARDS } from '../../config';
import { CASH_KEY, NEW_CARD_KEY } from '../../helpers/payment-method';
import { getReadableCardInfo } from '../../helpers/user-card';
import { history, Path } from '../../router';
import { getSheet } from '../../store/payment';
import {
    getActivePaymentId,
    getPaymentMethods,
    selectPaymentMethod,
} from '../../store/payment-methods';

import './styles.scss';

const cnPaymentMethods = cn('PaymentMethods');
const i18n = (v: string) => v;

export function PaymentMethods() {
    const selectPaymentMethodFn = useService(selectPaymentMethod);

    const paymentSheet = useSelector(getSheet);
    const list = useSelector(getPaymentMethods);
    const selectedPaymentMethodId = useSelector(getActivePaymentId);
    const [selectedId, setSelected] = useState(selectedPaymentMethodId);

    const onSelectPaymentMethod = useCallback(
        () => selectPaymentMethodFn(selectedId, () => history.push(Path.Main)),
        [selectPaymentMethodFn, selectedId],
    );

    const isNewCardAvailable = list.length < MAX_BOUND_CARDS;
    const isCashAvailable = hasCashPaymentMethod(paymentSheet);

    return (
        <Panel
            header={<PanelHeader title="Способы оплаты" backHref={Path.Main} />}
            footer={
                <React.Fragment>
                    <Button
                        size="l"
                        view="action"
                        variant="primary"
                        width="max"
                        pin="round-m"
                        disabled={!selectedId}
                        onClick={onSelectPaymentMethod}
                    >
                        {i18n('Сохранить')}
                    </Button>
                    <Row top="s">
                        <SecureInfo />
                    </Row>
                </React.Fragment>
            }
            className={cnPaymentMethods()}
        >
            <Text variant="s" color="grey" top="s">
                {i18n('Карты в Yandex Pay')}
            </Text>

            {list.map((method) => (
                <React.Fragment key={method.id}>
                    <ListButtonRadioPayment
                        active={selectedId === method.id}
                        onClick={() => setSelected(method.id)}
                        svgLeft={PaymentOrCardRawIcon(method.issuer)}
                        top="2xs"
                        disabled={method.disabled}
                    >
                        <Text variant="m">
                            {getReadableCardInfo(method)}
                        </Text>
                    </ListButtonRadioPayment>
                </React.Fragment>
            ))}

            {isNewCardAvailable ? (
                <ListButtonRadioPayment
                    key={NEW_CARD_KEY}
                    active={selectedId === NEW_CARD_KEY}
                    onClick={() => setSelected(NEW_CARD_KEY)}
                    svgLeft={PaymentOrCardRawIcon(NEW_CARD_KEY)}
                    top="2xs"
                >
                    <Text variant="m">{i18n('Оплата новой картой')}</Text>
                </ListButtonRadioPayment>
            ) : null}

            {isCashAvailable ? (
                <React.Fragment>
                    <Text variant="s" color="grey" top="s">
                        {i18n('Другие способы оплаты')}
                    </Text>
                    <ListButtonRadioPayment
                        key={CASH_KEY}
                        active={selectedId === CASH_KEY}
                        onClick={() => setSelected(CASH_KEY)}
                        svgLeft={PaymentOrCardRawIcon(CASH_KEY)}
                        top="2xs"
                    >
                        <Text variant="m">{i18n('Оплата при получении')}</Text>
                    </ListButtonRadioPayment>
                </React.Fragment>
            ) : null}
        </Panel>
    );
}
