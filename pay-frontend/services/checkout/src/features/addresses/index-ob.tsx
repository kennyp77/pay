import React, { useCallback } from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { PanelHeaderOb } from '../../components/panel/header/onboarding@touch';
import { counters } from '../../counters';
import { isGeoAddressWithoutRoom } from '../../helpers/adresses';
import { history, Path } from '../../router';
import { getObSteps, setCurrentObStep } from '../../store/app';

import { Addresses } from '.';

const i18n = (str: string) => str;

export function AddressesOb() {
    const setCurrentObStepFn = useService(setCurrentObStep);
    const { address, totalSteps } = useSelector(getObSteps);

    useEffectOnce(() => {
        setCurrentObStepFn(address.step);
    });

    const completeCallback = useCallback(
        async (addressItem) => {
            // Если при онбординге мы выбрали geo-адрес без квартиры,
            // нужно отправить юзера на форму редактирования для заполнения квартиры
            if (addressItem && isGeoAddressWithoutRoom(addressItem)) {
                counters.addressEditSuggestAddRoom();

                history.push(Path.AddressesEdit(addressItem));
            } else {
                history.push(address.completeHref);
            }
        },
        [address],
    );

    return (
        <Addresses
            obHeader={
                <PanelHeaderOb
                    title={i18n('Доставка')}
                    backHref={address.prevHref}
                    step={[address.step, totalSteps]}
                />
            }
            completeCallback={completeCallback}
            needsObFooter={address.step === 1}
        />
    );
}
