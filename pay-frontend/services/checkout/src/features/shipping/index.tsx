import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { cn } from '@bem-react/classname';
import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { Button } from '../../components/button';
import { Loader } from '../../components/loader';
import { Panel, PanelHeader } from '../../components/panel';
import { hasDate, hasDateAndTime } from '../../helpers/shippings';
import { history, Path } from '../../router';
import {
    getSelectedShippingOption,
    getSelectShippingOptionsStatus,
    getShippingOptionsList,
    getShippingOptionsListStatus,
    selectShippingOption,
} from '../../store/shipping';

import { DirectShippingDateOptions } from './components/date';
import { DirectShippingDatetimeOptions } from './components/datetime';
import { DirectShippingRadioOptions } from './components/radio';

import './styles.scss';

export const cnSelectShipping = cn('SelectShipping');

const i18n = (v: string) => v;

export function DirectShipping() {
    const selectShippingFn = useService(selectShippingOption);

    const list = useSelector(getShippingOptionsList);
    const selectedShipping = useSelector(getSelectedShippingOption);
    const listStatus = useSelector(getShippingOptionsListStatus);
    const selectStatus = useSelector(getSelectShippingOptionsStatus);

    const [selected, setSelected] = useState(selectedShipping);

    const onChooseShipping = useCallback(
        (option: Sdk.ShippingOption) => {
            setSelected(option);
        },
        [setSelected],
    );

    const onSelectShipping = useCallback(() => {
        if (!!selected) {
            selectShippingFn(selected.id, () => history.push(Path.Main));
        }
    }, [selectShippingFn, selected]);

    useEffect(() => {
        if (!selected) {
            setSelected(selectedShipping);
        }
    }, [selected, setSelected, selectedShipping]);

    const shippingSelector = useMemo(() => {
        if (list.some(hasDateAndTime)) {
            return (
                <DirectShippingDatetimeOptions selected={selected} onChange={onChooseShipping} />
            );
        }

        if (list.some(hasDate)) {
            return <DirectShippingDateOptions selected={selected} onChange={onChooseShipping} />;
        }

        return <DirectShippingRadioOptions selected={selected} onChange={onChooseShipping} />;
    }, [list, selected, onChooseShipping]);

    return (
        <Panel
            className={cnSelectShipping()}
            header={<PanelHeader title={i18n('Доставка')} closeHref={Path.Main} />}
            footer={
                <Button
                    size="l"
                    view="action"
                    variant="primary"
                    width="max"
                    pin="round-m"
                    disabled={!selected}
                    onClick={onSelectShipping}
                    progress={asyncData.isPending(selectStatus)}
                >
                    {i18n('Выбрать')}
                </Button>
            }
        >
            <Loader progress={asyncData.isPending(listStatus)} position="center" size="l" />

            {asyncData.isSuccess(listStatus) && shippingSelector}
        </Panel>
    );
}
