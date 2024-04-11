/* eslint-disable */

import { ComponentType, createElement, forwardRef } from 'react';
import { cn, NoStrictEntityMods, ClassNameFormatter } from '@bem-react/classname';
import { IClassNameProps, Enhance } from '@bem-react/core';
import { classnames } from '@bem-react/classnames';

type withBemModOptions = {
    __passToProps: boolean;
    __simple: boolean;
};

type Dictionary<T = any> = { [key: string]: T };

function getDisplayName(Component: ComponentType | string) {
    return typeof Component === 'string' ? Component : Component.displayName || Component.name || 'Component';
}

type DisplayNameMeta = {
    /**
     * Wrapper component.
     */
    wrapper: any;

    /**
     * Wrapped component.
     */
    wrapped: any;

    /**
     * Modifiers entity.
     */
    value?: any;
};

function setDisplayName(Component: ComponentType<any>, meta: DisplayNameMeta) {
    const wrapperName = getDisplayName(meta.wrapper);
    const wrappedName = getDisplayName(meta.wrapped);

    Component.displayName = `${wrapperName}(${wrappedName})`;

    if (meta.value !== undefined) {
        const value = JSON.stringify(meta.value)
            .replace(/\{|\}|\"|\[|\]/g, '')
            .replace(/,/g, ' | ');

        Component.displayName += `[${value}]`;
    }
}

export function withBemMod<T, U extends IClassNameProps = {}>(
    blockName: string,
    mod: NoStrictEntityMods,
    enhance?: Enhance<T & U> | withBemModOptions,
) {
    let entity: ClassNameFormatter;
    let entityClassName: string;
    let modNames: string[];

    function WithBemMod<K extends IClassNameProps = {}>(WrappedComponent: ComponentType<T & K>) {
        // Use cache to prevent create new component when props are changed.
        let ModifiedComponent: ComponentType<any>;
        let modifierClassName: string;

        entity = entity || cn(blockName);
        entityClassName = entityClassName || entity();

        const BemMod = forwardRef((props: T & K, ref) => {
            modNames = modNames || Object.keys(mod);

            // TODO: For performance can rewrite `every` to `for (;;)`.
            const isModifierMatched = modNames.every((key: string) => {
                const modValue = mod[key];
                const propValue = (props as any)[key];

                return modValue === propValue || (modValue === '*' && typeof propValue !== 'undefined');
            });

            const nextProps = Object.assign({}, props, { ref });

            if (isModifierMatched) {
                const modifiers = modNames.reduce((acc: Dictionary, key: string) => {
                    if (mod[key] !== '*') acc[key] = mod[key];

                    return acc;
                }, {});

                modifierClassName = modifierClassName || entity(modifiers);

                nextProps.className = classnames(modifierClassName, props.className)
                    // Replace first entityClassName for remove duplcates from className.
                    .replace(`${entityClassName} `, '');

                if (typeof enhance === 'function') {
                    if (ModifiedComponent === undefined) {
                        ModifiedComponent = enhance(WrappedComponent as any);

                        if (__DEV__) {
                            setDisplayName(ModifiedComponent, {
                                wrapper: 'WithBemModEnhance',
                                wrapped: WrappedComponent,
                            });
                        }
                    }
                } else {
                    ModifiedComponent = WrappedComponent as any;
                }

                // Use createElement instead of jsx to avoid __assign from tslib.
                return createElement(ModifiedComponent, nextProps);
            }

            // Use createElement instead of jsx to avoid __assign from tslib.
            return createElement(WrappedComponent, nextProps);
        });

        if (__DEV__) {
            setDisplayName(BemMod, {
                wrapper: WithBemMod,
                wrapped: entityClassName,
                value: mod,
            });
        }

        return BemMod;
    }

    // Ignore `forwardRef` typings to keep compatibility with `HOC<T>`
    const withMod = WithBemMod as any as {
        <K extends IClassNameProps = {}>(WrappedComponent: ComponentType<T & K>): (props: T & K) => React.ReactElement;

        __isSimple: boolean;
        __blockName: string;
        __mod: string;
        __value: string | number | boolean | undefined;
        __passToProps: boolean;
    };

    const { __passToProps = true, __simple = false } = (enhance as withBemModOptions) || {};

    const keys = Object.keys(mod);
    const isSimple = !enhance && keys.length === 1;
    const name = keys[0];
    const value = mod[keys[0]];

    withMod.__isSimple = isSimple || __simple;

    if (withMod.__isSimple) {
        withMod.__blockName = blockName;
        withMod.__mod = name;
        withMod.__value = value;
        withMod.__passToProps = __passToProps;
    }

    return withMod;
}
