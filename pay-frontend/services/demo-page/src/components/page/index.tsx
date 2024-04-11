import React from 'react';

import { block } from 'bem-cn';

import logo from './assets/yapay.svg';
import './index.css';

const b = block('page');

interface PageProps {
    children: JSX.Element;
}

export default function Page({ children }: PageProps): JSX.Element {
    return (
        <div className={b()}>
            <div className={b('logo')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox={logo.viewBox}>
                    <use xlinkHref={`#${logo.id}`} />
                </svg>
            </div>
            <div className={b('content')}>{children}</div>
        </div>
    );
}
