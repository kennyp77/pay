import React, { useCallback, useEffect, useState } from 'react';

import { cn } from '@bem-react/classname';
import BigButton from '@trust/ui/components/ui/big-button';
import Checkbox from '@trust/ui/components/ui/checkbox';

import {
    createMerchantIntegration,
    createMerchantKey,
    registerMerchant,
} from '../../api/console-api';
import {
    CALLBACK_URL,
    ENC_CREDS,
    ENV,
    MERCHANT_DOMAINS,
    MERCHANT_NAME,
    PSP_EXTERNAL_ID,
    USER_EMAIL,
    USER_PHONE,
} from '../../config';
import { counters } from '../../counters/metrika';
import { sendError, sendMerchantData } from '../../helpers/connection';
import { InputForm } from '../input-form';
import { Loader } from '../loader';
import { ModalContainer } from '../modal-container';
import { Policy } from '../policy';

import './styles.scss';

const cnRegistrationContent = cn('RegistrationContent');

const EMAIL_PATTERNS = [/^[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]+\.[A-Z]{2,}$/i];
const PHONE_PATTERNS = [/^\+7\d{10}$/];
const INN_PATTERNS = [/^[\d+]{10}$/, /^[\d+]{12}$/];
const OGRN_PATTERNS = [/^[15][\d+]{12}$/];

interface IRegistrationContentProps {
    onError: (error: string) => void;
}

export function RegistrationContent({ onError }: IRegistrationContentProps): JSX.Element {
    const [email, setEmail] = useState(USER_EMAIL);
    const [phone, setPhone] = useState(USER_PHONE);

    const [inn, setInn] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [ogrn, setOgrn] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [ceoName, setCeoName] = useState('');
    const [postalAddress, setPostalAddress] = useState('');

    const [agreementStatus, setAgreementStatus] = useState(false);
    const [pending, setPending] = useState(false);
    const [pendingMessage, setPendingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);

    const isAllValid = Boolean(
        email && phone && inn && companyName && ogrn && companyAddress && ceoName && postalAddress,
    );

    useEffect(() => {
        if (!isAllValid) {
            setError('Заполните все поля');
        } else if (!agreementStatus) {
            setError('Нужно принять условия');
        } else {
            setError(null);
        }
    }, [isAllValid, agreementStatus]);

    const changeAgreementStatus = useCallback(() => {
        setAgreementStatus(!agreementStatus);
    }, [agreementStatus]);

    const onModalAgree = useCallback(() => {
        setAgreementStatus(true);
        setShowModal(false);
    }, []);

    const onCheckboxLinkClick = useCallback((ev: React.MouseEvent<HTMLSpanElement>) => {
        ev.stopPropagation();
        ev.preventDefault();

        setShowModal(true);
    }, []);

    const getMerchantData = useCallback(async () => {
        if (!agreementStatus) {
            return;
        }

        counters.confirmAgreement();

        setPendingMessage('Создание merchantId');
        setPending(true);

        try {
            const { data: merchantData } = await registerMerchant({
                partnerName: MERCHANT_NAME,
                partnerRegistrationData: {
                    contact: {
                        phone,
                        email,
                    },
                    taxRefNumber: inn,
                    ogrn,
                    legalAddress: companyAddress,
                    fullCompanyName: companyName,
                    ceoName: ceoName,
                    postalAddress,
                },
                offerAccepted: agreementStatus,
                origins: MERCHANT_DOMAINS.map((origin) => ({ origin })),
                callbackUrl: CALLBACK_URL,
            });

            setPendingMessage('Создание интеграции');

            const { data: integrationData } = await createMerchantIntegration(
                merchantData.merchant.merchantId,
                {
                    pspExternalId: PSP_EXTERNAL_ID,
                    creds: JSON.stringify(ENC_CREDS),
                    encrypted: true,
                    forTesting: ENV !== 'production',
                },
            );

            setPendingMessage('Создание ключа');

            const { data: keyData } = await createMerchantKey(integrationData.merchantId);

            sendMerchantData(
                integrationData.merchantId,
                merchantData.merchant.name,
                keyData.key.keyId,
                keyData.key.value,
            );
            setPending(false);
        } catch (error) {
            setError('Произошла ошибка');
            sendError(error);
            setPending(false);
            onError(error.message);
        }
    }, [
        agreementStatus,
        email,
        phone,
        inn,
        companyName,
        ogrn,
        companyAddress,
        ceoName,
        postalAddress,
        onError,
    ]);

    const isContactsInputsShowed = !USER_EMAIL || !USER_PHONE;

    return (
        <div className={cnRegistrationContent()}>
            <h1>Регистрация</h1>

            {isContactsInputsShowed && (
                <div className={cnRegistrationContent('block')}>
                    <h2 className={cnRegistrationContent('block-label')}>Укажите ваши контакты</h2>

                    {!USER_EMAIL && (
                        <InputForm
                            className={cnRegistrationContent('Input')}
                            label="Эл. почта для связи"
                            value={email}
                            patterns={EMAIL_PATTERNS}
                            errorMessage="Неверный формат почты"
                            onChange={setEmail}
                            disabled={pending}
                        />
                    )}

                    {!USER_PHONE && (
                        <InputForm
                            className={cnRegistrationContent('Input')}
                            label="Телефон для связи"
                            value={phone}
                            patterns={PHONE_PATTERNS}
                            errorMessage="Неверный формат телефона"
                            onChange={setPhone}
                            mask="+00000000000"
                            placeholder="+79112345678"
                            disabled={pending}
                        />
                    )}
                </div>
            )}

            <div className={cnRegistrationContent('block')}>
                <h2 className={cnRegistrationContent('block-label')}>
                    Ваша организация (резидент РФ)
                </h2>

                <InputForm
                    className={cnRegistrationContent('Input')}
                    label="ИНН"
                    value={inn}
                    patterns={INN_PATTERNS}
                    errorMessage="Неверный формат ИНН"
                    onChange={setInn}
                    mask={['0000000000', '000000000000']}
                    placeholder="000000000000"
                    disabled={pending}
                />
                <InputForm
                    className={cnRegistrationContent('Input')}
                    label="Наименование компании"
                    required
                    value={companyName}
                    onChange={setCompanyName}
                    disabled={pending}
                />
                <InputForm
                    className={cnRegistrationContent('Input')}
                    label="ОГРН"
                    value={ogrn}
                    patterns={OGRN_PATTERNS}
                    errorMessage="Неверный формат ОГРН"
                    onChange={setOgrn}
                    mask="0000000000000"
                    placeholder="1000000000000"
                    disabled={pending}
                />
                <InputForm
                    className={cnRegistrationContent('Input')}
                    label="Адрес регистрации компании"
                    required
                    value={companyAddress}
                    onChange={setCompanyAddress}
                    disabled={pending}
                />
                <InputForm
                    className={cnRegistrationContent('Input')}
                    label="Почтовый адрес компании"
                    required
                    value={postalAddress}
                    onChange={setPostalAddress}
                    disabled={pending}
                />
                <InputForm
                    className={cnRegistrationContent('Input')}
                    label="ФИО директора"
                    required
                    value={ceoName}
                    onChange={setCeoName}
                    disabled={pending}
                />
            </div>

            <Checkbox
                className={cnRegistrationContent('Checkbox')}
                checked={agreementStatus}
                onChange={changeAgreementStatus}
                label={
                    <span>
                        <span>Принимаю условия </span>
                        <span
                            className={cnRegistrationContent('CheckboxLink')}
                            onClick={onCheckboxLinkClick}
                        >
                            пользовательского соглашения
                        </span>
                    </span>
                }
                view="outline"
                size="m"
                variant="blue"
            />

            <div className={cnRegistrationContent('Button')}>
                <BigButton
                    type="red"
                    disabled={!isAllValid || !agreementStatus}
                    onClick={getMerchantData}
                >
                    {error ?? (pending ? pendingMessage : 'Подключить')}
                </BigButton>

                <Loader visible={pending} className={cnRegistrationContent('Spin')} />
            </div>

            <ModalContainer
                onClose={() => setShowModal(false)}
                visible={showModal}
                onAgree={onModalAgree}
                header="Оферта на оказание услуг «Yandex Pay Checkout»"
                content={<Policy />}
            />
        </div>
    );
}
