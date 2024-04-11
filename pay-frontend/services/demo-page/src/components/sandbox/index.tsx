import React from 'react';

import { block } from 'bem-cn';

import { isTest } from '../../helpers/env';

import { Settings } from './Settings';
import { Snippet } from './Snippet';
import { TestSettings } from './TestSettings';
import './index.css';

const b = block('sandbox');

export default function Sandbox(): JSX.Element {
    return (
        <div className={b()}>
            <Snippet />
            {isTest() && <TestSettings />}
            <Settings />
        </div>
    );
}
