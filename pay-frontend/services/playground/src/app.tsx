import * as React from 'react';

import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { Route, Router, Switch } from 'react-router';

import { ButtonsList } from 'pages/buttons-list';
import { Checkout } from 'pages/checkout';
import { CheckoutBolt } from 'pages/checkout-bolt';
import { Classic } from 'pages/classic';
import { ClassicBolt } from 'pages/classic-bolt';
import { PaymentsSuccess } from 'pages/success';
import { Path } from 'router/paths';

import { store } from './store';

const history = createBrowserHistory({ basename: 'web/playground' });

export function App() {
    return (
        <Provider store={store}>
            <Router history={history}>
                <Switch>
                    <Route exact path="success" component={PaymentsSuccess} />
                    <Route exact path={Path.checkout} component={Checkout} />
                    <Route exact path={Path.checkoutBolt} component={CheckoutBolt} />
                    <Route exact path={Path.classic} component={Classic} />
                    <Route exact path={Path.classicBolt} component={ClassicBolt} />
                    <Route exact path={Path.buttons} component={ButtonsList} />
                </Switch>
            </Router>
        </Provider>
    );
}
