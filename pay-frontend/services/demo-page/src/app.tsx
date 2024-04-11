import React from 'react';

import Page from './components/page';
import Sandbox from './components/sandbox';
import { Store } from './store';

export default (): JSX.Element => (
    <Store>
        <Page>
            <Sandbox />
        </Page>
    </Store>
);
