import React from 'react';

import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { getInitialLoadingStatus, getObSteps } from '../store/app';

import { ConnectedSwitch, routeWithSubRoutes } from './switch';

interface RouterProps {
    routes: Checkout.Routes;
    obRoutes: Checkout.Routes;
}

export const Router: React.FC<RouterProps> = ({ routes, obRoutes }) => {
    const obSteps = useSelector(getObSteps);
    const loading = useSelector(getInitialLoadingStatus);

    if (loading) {
        return null;
    }

    const routesList = obSteps.active ? obRoutes : routes;

    return (
        <ConnectedSwitch>
            {routesList.map((route) => routeWithSubRoutes(route))}
            {obSteps.active ? <Redirect to={obSteps.startHref} /> : null}
        </ConnectedSwitch>
    );
};
