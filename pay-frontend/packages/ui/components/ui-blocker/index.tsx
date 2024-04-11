import React from 'react';

import { block } from 'bem-cn';
import ReactDOM from 'react-dom';

import './styles.css';

const b = block('ui-blocker');

const node = document.createElement('div');
node.id = 'ui-blocker';
document.body.appendChild(node);

export default function UiBlocker(): React.ReactPortal {
    return ReactDOM.createPortal(<span className={b()} />, node);
}
