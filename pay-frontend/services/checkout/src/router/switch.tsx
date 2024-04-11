import React from 'react';

import { connect, MapStateToProps } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { RootState } from '../store';

type StateProps = Pick<React.ComponentProps<typeof Switch>, 'location'>;

const mapStateToProps: MapStateToProps<StateProps, {}, RootState> = (state) => ({
    location: state.router.location,
});

// При использовании `Switch` без указания проперти `location` приводит к тому, что обновление
// `store.router.location` и перерисовка страницы (выбор правильного route/Page) происходит в неправильном порядке,
// из-за чего компоненты одной страницу могу получить update и отрендериться на URL не той страницы,
// на которой отрендерились изначально.
export const ConnectedSwitch = connect(mapStateToProps)(Switch);

export function routeWithSubRoutes({
    routes,
    componentProps,
    component: Component,
    ...routeProps
}: Checkout.Route) {
    return (
        <Route
            {...routeProps}
            key={String(routeProps.path)}
            exact
            render={(props) => (
                <React.Fragment>
                    {Component ? <Component {...props} {...componentProps} /> : null}
                    {routes ? routes.map((route) => routeWithSubRoutes(route)) : null}
                </React.Fragment>
            )}
        />
    );
}
