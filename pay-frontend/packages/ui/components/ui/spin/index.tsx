import React from 'react';

import { block } from 'bem-cn';

import './styles.css';

const b = block('spin');

interface SpinProps {
    type?: string;
}

export default function Spin({ type = 'default' }: SpinProps): JSX.Element {
    return <i className={b({ type })} />;
}
