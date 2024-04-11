import React from 'react';

import { withBemMod } from '@bem-react/core-fork';
// import Icon from '@trust/ui/components/ui/icon';

import { Icon } from '../../icons';
import { IInputProps, cnInput } from '../base';

import ValidCheckIcon from './assets/valid-check.svg';

import './valid.scss';

interface InputValidProps {
    valid?: boolean;
}

export const withValid = withBemMod<InputValidProps, IInputProps>(cnInput(), { valid: '*' }, (WrappedComponent) => {
    return ({ iconRight, valid, ...props }) => {
        const validIcon = valid ? (
            <Icon svg={ValidCheckIcon} className={cnInput('validIcon')} />
        ) : // ? <Icon glyph="payment-success" />
        undefined;

        return <WrappedComponent {...props} iconRight={iconRight || validIcon} />;
    };
});
