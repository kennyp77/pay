import React, { useMemo } from 'react';

import { dom } from '@trust/utils/dom';
import { getStaticPath } from '@yandex-lego/serp-header/staticPath';
import { block } from 'bem-cn';

import './styles.css';

const USER_TEMPLATE_ID = 'user_template';

const b = block('passport-user');

const passportScriptPromise = new Promise((resolve) => {
    const scriptSrc = getStaticPath({
        block: 'user2',
    });

    const passportScript = document.createElement('script');
    dom.attrs(passportScript, { src: scriptSrc });

    passportScript.onload = (): void => resolve();

    dom.add('body', passportScript);
});

export default function User(): JSX.Element {
    const userHtml = useMemo(() => {
        passportScriptPromise.then(() => {
            // NB: Включаем кнопку только после загрузки скрипта
            dom.style('.passport-user .legouser__current-account.user-account', { 'pointer-events': 'auto' });
        });

        const userWrapper = document.getElementById(USER_TEMPLATE_ID);

        return userWrapper.innerHTML;
    }, []);

    // eslint-disable-next-line react/no-danger
    return <div className={b()} dangerouslySetInnerHTML={{ __html: userHtml }} />;
}
