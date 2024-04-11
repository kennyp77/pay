import * as React from 'react';

import { classnames } from '@bem-react/classnames';
import { defineCsrfToken, updateUserSettings } from '@trust/pay-api';

import { Button } from 'components/button';
import { Panel } from 'components/panel';
import { CSRF_TOKEN } from 'config';

defineCsrfToken(CSRF_TOKEN);

export function Reset() {
    // TODO: сделать нормальное апи, вместе с `Reset User Settings`
    const onClickResetSession = React.useCallback(() => {
        fetch('/web-api/v1/decrease-session')
            .then((res) => {
                res.json().then((data) => {
                    if (!data.error) {
                        alert('Куки обновлены');
                    } else {
                        throw Error('');
                    }
                });
            })
            .catch(() => {
                alert('Ошибка в обновлении кук');
            });
    }, []);

    const onClickResetUserSettings = React.useCallback(() => {
        const emptyUserSettings = {
            contactId: '',
            cardId: '',
            addressId: '',
            isCheckoutOnboarded: false,
        };
        updateUserSettings(emptyUserSettings)
            .then(() => alert('User Settings сброшены'))
            .catch(() => {
                alert('Ошибка при сбросе User Settings');
            });
    }, []);

    return (
        <Panel caption="Сбросить данные">
            <div className={classnames('flex', 'flex-wrap', 'gap-2')}>
                <Button onClick={onClickResetUserSettings}>Reset User Settings</Button>
                <Button onClick={onClickResetSession}>Reset Auth</Button>
            </div>
        </Panel>
    );
}
