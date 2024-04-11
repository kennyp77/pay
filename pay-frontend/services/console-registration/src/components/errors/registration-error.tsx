import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import BigButton from '@trust/ui/components/ui/big-button';
import Icon from '@trust/ui/components/ui/icon';

import { HELP_LINK, REQ_ID } from '../../config';

import './registration-error.scss';

interface IRegistrationErrorProps extends IClassNameProps {
    error: string;
}

const cnRegistrationError = cn('RegistrationError');

export const RegistrationError = ({ error, className }: IRegistrationErrorProps) => {
    function openHelp() {
        window.open(HELP_LINK);
    }

    return (
        <>
            <div className={cnRegistrationError({ className })}>
                <div className={cnRegistrationError('Error')}>
                    <Icon glyph="error" className={cnRegistrationError('Icon')} />
                    <div className={cnRegistrationError('ErrorMessage')}>
                        <h2 className={cnRegistrationError('ErrorMessageHeader')}>
                            Произошла ошибка <br /> регистрации
                        </h2>
                        <p>
                            Для продолжения регистрации, пожалуйста, обратитесь в службу поддержки.
                            В сообщении укажите следующие данные:
                        </p>
                        <p>Ошибка: {error}</p>
                        <p>
                            Информация для службы поддержки:&nbsp;
                            <span className={cnRegistrationError('ErrorMessageInfo')}>
                                reqid: {REQ_ID}; {window.location.href}
                            </span>
                        </p>
                    </div>
                    <BigButton
                        type="red"
                        className={cnRegistrationError('ErrorButton')}
                        onClick={openHelp}
                    >
                        Написать в техническую поддержку
                    </BigButton>
                </div>
            </div>
        </>
    );
};
