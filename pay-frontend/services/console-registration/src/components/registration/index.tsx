import React, { useEffect, useState } from 'react';

import { cn } from '@bem-react/classname';
import PassportUser from '@trust/ui/components/passport-user';
import Icon from '@trust/ui/components/ui/icon';

import { getPartners } from '../../api/console-api';
import {
    ENC_CREDS,
    MERCHANT_DOMAINS,
    MERCHANT_NAME,
    PSP_EXTERNAL_ID,
    USER_EMAIL,
} from '../../config';
import { counters } from '../../counters/metrika';
import { isMerchantHaveRegistration } from '../../helpers/check-prev-registration';
import { sendError } from '../../helpers/connection';
import { validateData } from '../../helpers/merchantData';
import { RegistrationError } from '../errors/registration-error';
import { RegistrationContent } from '../registration-content';

import './styles.scss';

const cnRegistration = cn('Registration');

export function RegistrationContainer(): JSX.Element {
    const [error, setError] = useState<string | null>(null);

    function onError(error: string) {
        setError(error);
    }

    useEffect(() => {
        counters.consoleRegistrationPassportEmail({ email: Boolean(USER_EMAIL) });

        const { error, message } = validateData(
            MERCHANT_DOMAINS,
            MERCHANT_NAME,
            ENC_CREDS,
            PSP_EXTERNAL_ID,
        );

        getPartners().then((res) => {
            if (isMerchantHaveRegistration(res.data)) {
                setError('Повторная попытка регистрации');
                sendError('Merchant is already registered');
            }
        });

        if (error) {
            setError('Неверные данные из CMS');
            sendError(message);
        }
    }, []);

    return (
        <div className={cnRegistration()}>
            <div className={cnRegistration('Header')}>
                <div className={cnRegistration('Logo')}>
                    <Icon glyph="ya-pay-logo-brand" />
                </div>

                <PassportUser />
            </div>

            {error ? (
                <RegistrationError error={error} />
            ) : (
                <div className={cnRegistration('Content')}>
                    <RegistrationContent onError={onError} />
                </div>
            )}
        </div>
    );
}
