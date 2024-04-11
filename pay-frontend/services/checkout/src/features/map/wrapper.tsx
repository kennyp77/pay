import * as React from 'react';

import { asyncData } from '@trust/utils/async';
import { useDispatch, useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { getMapSdkStatus, loadMapSdk } from '../../store/map';

import { Map } from './map';

export function MapWrapper() {
    const dispatch = useDispatch();
    const sdkStatus = useSelector(getMapSdkStatus);

    useEffectOnce(() => {
        if (asyncData.isSuccess(sdkStatus)) {
            return;
        }

        dispatch(loadMapSdk());
    });

    if (!asyncData.isSuccess(sdkStatus)) {
        return null;
    }

    return <Map />;
}
