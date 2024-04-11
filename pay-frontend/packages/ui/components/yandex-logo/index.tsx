import React from 'react';

import { block } from 'bem-cn';

import { Template } from '../../typings';
import Icon from '../ui/icon';

import './styles.css';

const b = block('yandex-logo');

interface YandexLogoProps {
    template?: Template;
}

export default function YandexLogo({ template }: YandexLogoProps): JSX.Element {
    const tpl = template === Template.Desktop ? 'desktop' : 'mobile';

    return (
        <div className={b({ tpl })} aria-hidden="true">
            <Icon className={b('icon')} glyph="yandex-logo" />
        </div>
    );
}
