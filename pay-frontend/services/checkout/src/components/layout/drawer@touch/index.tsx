import React, { ReactNode, useRef, useEffect } from 'react';

import { cn } from '@bem-react/classname';
import debounce from '@tinkoff/utils/function/debounce';

import { Drawer, DrawerProps } from '../../drawer';

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

const disableAnimation = {
    tension: 0,
    friction: 0,
    disabled: true,
    dragImmediate: true,
};

interface DrawerLayoutProps {
    children: ReactNode;
    fullHeight?: boolean;
    zIndexGroupLevel?: DrawerProps['zIndexGroupLevel'];
    className?: string;
}

const scopeNode = getScopeNode();

const cnMapLayout = cn('DrawerLayout');

export function DrawerLayout({
    children,
    fullHeight,
    className,
    zIndexGroupLevel,
}: DrawerLayoutProps) {
    const ref = useRef(scopeNode);

    useEffect(() => () => globalState.disable(), []);

    globalState.enable();

    const animation = globalState.isActive() ? disableAnimation : undefined;

    return (
        <Drawer
            view="default"
            dragDisabled // TODO временное решение
            visible
            scope={ref}
            animation={animation}
            className={cnMapLayout({ fullHeight }, [className])}
            zIndexGroupLevel={zIndexGroupLevel}
        >
            {children}
        </Drawer>
    );
}

function getScopeNode() {
    const node = document.createElement('div');

    document.body.appendChild(node);

    return node;
}
