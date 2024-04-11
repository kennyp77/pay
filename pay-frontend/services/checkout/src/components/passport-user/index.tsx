import React, { memo, useEffect, useMemo } from 'react';

import { cn } from '@bem-react/classname';
import { dom } from '@trust/utils/dom';
import { getStaticPath } from '@yandex-lego/serp-header/staticPath';

import './styles.scss';

const USER_TEMPLATE_ID = 'user_template';

const cnPassportUser = cn('passport-user');

const passportScriptPromise = () =>
    new Promise<Sys.CallbackFn0>((resolve) => {
        const scriptSrc = getStaticPath({
            block: 'user2',
        });

        const passportScript = document.createElement('script');
        dom.attrs(passportScript, { src: scriptSrc });

        passportScript.onload = (): void => {
            resolve(() => {
                dom.remove(passportScript);
            });
        };

        dom.add('body', passportScript);
    });

export const PassportUser = memo((): JSX.Element => {
    useEffect(() => {
        let isActive = true;
        const offFnList: Sys.CallbackFn0[] = [];

        passportScriptPromise().then((fn) => {
            // убираем тэг скрипта из dom'а
            offFnList.push(fn);

            // NB: Включаем кнопку только после загрузки скрипта
            dom.style('.passport-user .legouser__current-account.user-account', {
                'pointer-events': 'auto',
            });
        });

        return () => {
            isActive = false;
            offFnList.forEach((offFn) => offFn());
        };
    });

    const userHtml = useMemo(() => {
        const userWrapper = document.getElementById(USER_TEMPLATE_ID);

        return userWrapper.innerHTML;
    }, []);

    // eslint-disable-next-line react/no-danger
    return <div className={cnPassportUser()} dangerouslySetInnerHTML={{ __html: userHtml }} />;
});
