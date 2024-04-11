import React from 'react';

import BindCard from '../common/bind-card';
import BindCardHeader from '../common/bind-card-header';
import SecondaryButton from '../secondary-button';

import { getErrorDescription } from './errors';

interface BindCardErrorProps {
    status: string;
    onClickBack: Sys.CallbackFn0;
    onClickAdd: Sys.CallbackFn0;
}

export default function BindCardError({ status, onClickBack, onClickAdd }: BindCardErrorProps): JSX.Element {
    /**
     * TODO: i18n
     */
    return (
        <BindCard
            header={
                <BindCardHeader
                    errorHeader
                    title="Не удалось добавить карту"
                    subtitle={getErrorDescription(status)}
                    onClickBack={onClickBack}
                />
            }
            content={<SecondaryButton title="Добавить другую" onClick={onClickAdd} />}
        />
    );
}
