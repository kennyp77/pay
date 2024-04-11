import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useSelector } from 'react-redux';

import { cnSelectShipping } from '..';
import { Amount } from '../../../components/amount';
import { Box } from '../../../components/box';
import { ExpressIcon } from '../../../components/icons/express-icon';
import { Select } from '../../../components/select';
import { Text } from '../../../components/text';
import { formatDate, fromUnixTimestamp } from '../../../helpers/date';
import {
    formatShippingTime,
    getDateGroupOfOption,
    getDateGroups,
    getOptionsOfDateGroup,
    hasDate,
    hasDateAndTime,
    inSameDay,
    isYandexExpress,
    prepareOptions,
} from '../../../helpers/shippings';
import { getCurrencyCode } from '../../../store/payment';
import { getShippingOptionsList } from '../../../store/shipping';

const i18n = (v: string) => v;

export type DirectShippingDatetimeOptionsProps = {
    selected?: Sdk.ShippingOption;
    onChange?: Sys.CallbackFn1<Sdk.ShippingOption>;
};

export function DirectShippingDatetimeOptions({
    selected,
    onChange,
}: DirectShippingDatetimeOptionsProps) {
    const list = useSelector(getShippingOptionsList);
    const currencyCode = useSelector(getCurrencyCode);

    const options = useMemo(() => prepareOptions(list), [list]);

    const dateGroups = useMemo(() => getDateGroups(options), [options]);
    const [selectedDateGroup, setSelectedDateGroup] = useState<number>();

    const filteredOptions = useMemo(
        () => (selectedDateGroup ? getOptionsOfDateGroup(options, selectedDateGroup) : []),
        [options, selectedDateGroup],
    );

    useEffect(() => {
        if (!!selected && hasDate(selected)) {
            setSelectedDateGroup(getDateGroupOfOption(selected));
        }
    }, [selected, setSelectedDateGroup]);

    const onPickGroup = useCallback(
        (group) => {
            setSelectedDateGroup(group);
            onChange?.(getOptionsOfDateGroup(options, group)[0]);
        },
        [setSelectedDateGroup, options, onChange],
    );

    const renderGroup = useCallback(
        (group) => (
            <Text top="s" bottom="s">
                {formatDate(fromUnixTimestamp(group))}
            </Text>
        ),
        [],
    );

    const renderOption = useCallback(
        (option) => (
            <Text top="s" bottom="s">
                {formatShippingTime(option, true)}
                {', '}
                <b>
                    <Amount amount={option.amount} currency={currencyCode}></Amount>
                </b>
                {isYandexExpress(option) && <ExpressIcon />}
            </Text>
        ),
        [currencyCode],
    );

    return (
        <React.Fragment>
            <Select
                selected={selectedDateGroup}
                menuItems={dateGroups.map((group) => ({
                    value: group,
                    content: renderGroup(group),
                }))}
                onChange={onPickGroup}
                content={
                    selectedDateGroup ? (
                        renderGroup(selectedDateGroup)
                    ) : (
                        <Text top="s" bottom="s">
                            {i18n('Выберите дату доставки')}
                        </Text>
                    )
                }
            />
            {selectedDateGroup && (
                <Box top="l">
                    <Select
                        selected={selected}
                        menuItems={filteredOptions.map((option) => ({
                            value: option,
                            content: renderOption(option),
                        }))}
                        onChange={onChange}
                        content={renderOption(selected)}
                    />
                </Box>
            )}
        </React.Fragment>
    );
}
