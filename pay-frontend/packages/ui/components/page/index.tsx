import React, { useEffect } from 'react';

import { dom } from '@trust/utils/dom';
import { block } from 'bem-cn';

import { Theme, Template } from '../../typings';
import { IThemeSettings } from '../../typings/theme';
import { TEMPLATE_CLASSNAME, THEME_CLASSNAME } from '../constants';
import PassportUser from '../passport-user';
import YandexLogo from '../yandex-logo';

import './styles.css';

const b = block('page');

interface PageProps {
    theme?: Theme;
    template?: Template;
    themeSettings?: IThemeSettings;
    children: JSX.Element | JSX.Element[];
}

export default function Page({
    theme = Theme.Default,
    template = Template.Mobile,
    themeSettings = {},
    children,
}: PageProps): JSX.Element {
    useEffect(() => {
        const themeClassName =
            theme === Theme.Default ? THEME_CLASSNAME.default : THEME_CLASSNAME.dark;
        const templateClassName =
            template === Template.Desktop ? TEMPLATE_CLASSNAME.desktop : TEMPLATE_CLASSNAME.mobile;

        /**
         * Важно!
         * Важно чтобы тема была на html а шаблон на body
         * Темы прогоняются через postcss-theme-fold
         * и становятся контекстом для остальных глобальных модификаторов
         */
        dom.addClass(document.documentElement, themeClassName);
        dom.addClass(document.body, templateClassName);

        /**
         * TODO: Выпилил класс `service-...`. Нужно вернуть, как появится необходимость.
         */
        // dom.addClass(document.documentElement, `service-${SERVICE_ID}`);
    }, [theme, template]);

    return (
        <div className={b({ ...themeSettings })}>
            <div className={b('background')} />
            <div className={b('header')}>
                <div className={b('header-content')}>
                    <YandexLogo template={template} />
                    <PassportUser />
                </div>
            </div>
            <div className={b('content')}>{children}</div>
        </div>
    );
}
