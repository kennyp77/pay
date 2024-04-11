import React from 'react';

import { CardSystem } from '@trust/utils/cards';
import { block } from 'bem-cn';

import BindCard from '../common/bind-card';
import BindCardHeader from '../common/bind-card-header';
import PrimaryButton from '../primary-button';

import CardNotAllowed from './card-not-allowed';
import './styles.css';

const b = block('bind-card-frame');

interface BindCardFrameProps {
    frameRef: React.Ref<HTMLDivElement>;
    isCardAllowed: boolean;
    isAuthScreen: boolean;
    cardSystem?: CardSystem;
    onClickBack?: Sys.CallbackFn0;
    onClickSubmit?: Sys.CallbackFn0;
}

export default function BindCardFrame({
    frameRef,
    isCardAllowed,
    isAuthScreen,
    cardSystem,
    onClickBack,
    onClickSubmit,
}: BindCardFrameProps): JSX.Element {
    /**
     * TODO: i18n
     */
    let submitTitle = 'Введите данные';

    if (onClickSubmit) {
        submitTitle = isCardAllowed ? 'Добавить' : 'Добавить все равно';
    }

    return (
        <BindCard
            className={b().toString()}
            header={
                <BindCardHeader
                    title="Добавить карту"
                    subtitle="Добавьте карту в Yandex&nbsp;Pay, чтобы безопасно оплачивать покупки в интернете и сервисах Яндекса"
                    onClickBack={onClickBack}
                />
            }
            warning={!isCardAllowed && <CardNotAllowed cardSystem={cardSystem} />}
            content={<div className={b('content', { auth: isAuthScreen })} ref={frameRef} />}
            footer={<PrimaryButton title={submitTitle} disabled={!onClickSubmit} onClick={onClickSubmit} />}
        />
    );
}
