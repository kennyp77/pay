import React from 'react';

import { block } from 'bem-cn';

import Icon from '../../ui/icon';
import Link from '../../ui/link';

import './styles.css';

const b = block('bind-card-header');

interface BindCardHeaderProps {
    title: string | JSX.Element;
    subtitle: string | JSX.Element;
    errorHeader?: boolean;
    onClickBack?: Sys.CallbackFn0;
}

export default function BindCardHeader({
    title,
    subtitle,
    errorHeader = false,
    onClickBack,
}: BindCardHeaderProps): JSX.Element {
    return (
        <div className={b()}>
            <div className={b('header')}>
                {onClickBack && (
                    <div className={b('back-link')}>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <Link theme="grey" leftIcon={<Icon glyph="chevron" />} onClick={onClickBack} />
                    </div>
                )}
                <div className={b('icon')}>
                    {errorHeader ? (
                        <Icon glyph="payment-error" className={b('error')} />
                    ) : (
                        <Icon glyph="ya-pay-logo-with-accent" className={b('logo')} />
                    )}
                </div>
            </div>
            <div className={b('title')}>{title}</div>
            <div className={b('subtitle')}>{subtitle}</div>
        </div>
    );
}
