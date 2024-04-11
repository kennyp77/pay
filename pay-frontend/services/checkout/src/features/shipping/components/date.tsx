import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useSelector } from 'react-redux';

import { cnSelectShipping } from '..';
import { Amount } from '../../../components/amount';
import { ExpressIcon } from '../../../components/icons/express-icon';
import { Select } from '../../../components/select';
import { Text } from '../../../components/text';
import {
    formatShippingTime,
    hasDate,
    isYandexExpress,
    prepareOptions,
    WithDateOption,
} from '../../../helpers/shippings';
import { getCurrencyCode } from '../../../store/payment';
import { getShippingOptionsList } from '../../../store/shipping';

const i18n = (v: string) => v;

export type DirectShippingDateOptionsProps = {
    selected?: Sdk.ShippingOption;
    onChange?: Sys.CallbackFn1<Sdk.ShippingOption>;
};

export function DirectShippingDateOptions({ selected, onChange }: DirectShippingDateOptionsProps) {
    const list = useSelector(getShippingOptionsList);
    const currencyCode = useSelector(getCurrencyCode);

    const options = useMemo(() => {
        return prepareOptions(list);
    }, [list]);

    const onPickOption = useCallback(
        (v) => {
            onChange?.(v);
        },
        [onChange],
    );

    const renderOption = useCallback(
        (option: WithDateOption) => {
            return (
                <Text top="s" bottom="s">
                    {formatShippingTime(option)}
                    {', '}
                    <b>
                        <Amount amount={option.amount} currency={currencyCode} />
                    </b>
                    {isYandexExpress(option) && <ExpressIcon />}
                </Text>
            );
        },
        [currencyCode],
    );

    return (
        <React.Fragment>
            <Select
                selected={selected}
                menuItems={options.map((option) => ({
                    value: option,
                    content: renderOption(option),
                }))}
                content={selected && hasDate(selected) ? renderOption(selected) : ''}
                onChange={onPickOption}
            />
        </React.Fragment>
    );
}
