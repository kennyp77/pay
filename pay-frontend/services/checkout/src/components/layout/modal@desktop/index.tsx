import React, { ReactNode, useRef, useEffect } from 'react';

import { cn } from '@bem-react/classname';
import debounce from '@tinkoff/utils/function/debounce';

import { Block } from '../../block';
import { Modal } from '../../modal';

import './styles.scss';

const globalState = (() => {
    let _active = false;

    return {
        isActive: () => _active,
        enable: () => {
            _active = true;
        },
        disable: debounce(50, () => {
            _active = false;
        }),
    };
})();

interface ModalLayoutProps {
    children: ReactNode;
    width?: 'auto' | 'fixed';
    className?: string;
}

const cnModalLayout = cn('ModalLayout');

const scopeNode = getScopeNode();

export function ModalLayout({ children, className, width = 'fixed' }: ModalLayoutProps) {
    const ref = useRef(scopeNode);

    useEffect(() => () => globalState.disable(), []);

    globalState.enable();

    const hasAnimation = !globalState.isActive();

    return (
        <Modal
            theme="normal"
            visible
            hasAnimation={hasAnimation}
            scope={ref}
            className={cnModalLayout({ width }, [className])}
        >
            <Block bg="white" radius="xl" className={cnModalLayout('Block')}>
                {children}
            </Block>
        </Modal>
    );
}

function getScopeNode() {
    const node = document.createElement('div');

    document.body.appendChild(node);

    return node;
}
