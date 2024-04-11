import React from 'react';

import { useSelector } from 'react-redux';

import { getErrorScreen } from '../../store/app';

import { ErrorScreen } from './error';
import { LoaderScreen } from './loader';

export function InfoScreens() {
    const error = useSelector(getErrorScreen);

    if (error) {
        return <ErrorScreen />;
    }

    return <LoaderScreen />;
}
