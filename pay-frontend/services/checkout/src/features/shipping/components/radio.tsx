import React from 'react';

import { useSelector } from 'react-redux';

import { Amount } from '../../../components/amount';
import { ListButtonRadio } from '../../../components/list-button';
import { Text } from '../../../components/text';
import { getCurrencyCode } from '../../../store/payment';
import { getShippingOptionsList } from '../../../store/shipping';

const i18n = (v: string) => v;

export type DirectShippingRadioOptionsProps = {
    selected?: Sdk.ShippingOption;
    onChange?: Sys.CallbackFn1<Sdk.ShippingOption>;
};

export function DirectShippingRadioOptions({
    selected,
    onChange,
}: DirectShippingRadioOptionsProps) {
    const list = useSelector(getShippingOptionsList);
    const currencyCode = useSelector(getCurrencyCode);

    return (
        <React.Fragment>
            {list.map((shippingOption) => (
                <React.Fragment key={shippingOption.id}>
                    <ListButtonRadio
                        size="m"
                        bottom="xs"
                        active={selected?.id === shippingOption.id}
                        onClick={() => onChange?.(shippingOption)}
                        iconRight=""
                        radioPosition="left"
                    >
                        <Text>
                            {`${shippingOption.label || shippingOption.provider}, `}
                            <b>
                                <Amount amount={shippingOption.amount} currency={currencyCode} />
                            </b>
                        </Text>
                        {shippingOption.provider === 'RUSSIAN_POST' && (
                            <Text variant="s" color="grey">
                                {i18n('Самовывоз из отделения почты')}
                            </Text>
                        )}
                    </ListButtonRadio>
                </React.Fragment>
            ))}
        </React.Fragment>
    );
}
