import React, { useCallback, useEffect, useState } from 'react';

import { cn } from '@bem-react/classname';
import BigButton from '@trust/ui/components/ui/big-button';
import Checkbox from '@trust/ui/components/ui/checkbox';

import { registerMerchant } from '../../api/console-api';
import { MERCHANT_DOMAINS, MERCHANT_NAME, USER_EMAIL } from '../../config';
import { counters } from '../../counters/metrika';
import { sendError, sendMerchantData } from '../../helpers/connection';
import { validateMerchant } from '../../helpers/merchantData';
import { Input } from '../input';
import { Loader } from '../loader';

import './styles.scss';

const cnAgreement = cn('Agreement');

const EMAIL_PATTERN = /^[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function Agreement(): JSX.Element {
    const [agreementStatus, setAgreementStatus] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState(USER_EMAIL);
    const [emailError, setEmailError] = useState<string | null>(null);

    useEffect(() => {
        counters.consoleAgreementPassportEmail({ email: Boolean(USER_EMAIL) });

        const { error, message } = validateMerchant(MERCHANT_DOMAINS, MERCHANT_NAME);

        if (error) {
            setError('Неверные данные из CMS');
            sendError(message);
        }
    }, []);

    useEffect(() => {
        const isValid = email ? EMAIL_PATTERN.test(email) : true;

        setEmailError(isValid ? null : 'Неверный формат почты');
    }, [email, emailError, setEmailError]);

    const onChangeEmail = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }, []);

    const changeAgreementStatus = useCallback(() => {
        setAgreementStatus(!agreementStatus);
    }, [agreementStatus]);

    const getMerchantData = useCallback(async () => {
        if (!agreementStatus) {
            return;
        }

        counters.confirmAgreement();

        setPending(true);

        try {
            const res = await registerMerchant({
                partnerName: MERCHANT_NAME,
                origins: MERCHANT_DOMAINS.map((origin) => ({ origin })),
                partnerRegistrationData: {
                    contact: {
                        email: USER_EMAIL || email,
                    },
                },
                offerAccepted: agreementStatus,
            });

            const { merchantId, name } = res.data.merchant;

            sendMerchantData(merchantId, name);
            setPending(false);
        } catch (error) {
            setError('Произошла ошибка');
            sendError(error);
            setPending(false);
        }
    }, [agreementStatus, email]);

    return (
        <div className={cnAgreement()}>
            {!USER_EMAIL && (
                <Input
                    className={cnAgreement('Email')}
                    size="m"
                    view="material"
                    variant="filled"
                    label="Еmail для обмена документами"
                    value={email}
                    hint={emailError}
                    state={emailError ? 'error' : null}
                    onChange={onChangeEmail}
                />
            )}

            <Checkbox
                className={cnAgreement('Checkbox')}
                checked={agreementStatus}
                onChange={changeAgreementStatus}
                label="Я принимаю лицензионное соглашение"
                view="outline"
                size="m"
                variant="blue"
            />

            <div className={cnAgreement('Button')}>
                <BigButton
                    type="red"
                    disabled={
                        !agreementStatus ||
                        (!USER_EMAIL && !email) ||
                        pending ||
                        Boolean(error) ||
                        Boolean(emailError)
                    }
                    onClick={getMerchantData}
                >
                    {error ?? 'Продолжить'}
                </BigButton>
                <Loader visible={pending} className={cnAgreement('Spin')} />
            </div>
        </div>
    );
}
