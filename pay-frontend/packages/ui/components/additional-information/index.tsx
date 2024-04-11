import React from 'react';

import { block } from 'bem-cn';

import { AGREEMENT_HREF } from '../constants';
import Icon from '../ui/icon';
import Link from '../ui/link';

import './styles.css';

interface AdditionalInformationProps {
    inverse?: boolean;
}

const b = block('additional-information');

export default function AdditionalInformation({
    inverse = false,
}: AdditionalInformationProps): JSX.Element {
    // TODO i18n
    return (
        <div className={b({ inverse })}>
            <div className={b('content')}>
                <div className={b('agreement')}>
                    <span className={b('agreement-link')}>
                        <Link
                            inline
                            href={AGREEMENT_HREF}
                            theme="grey"
                            // Открываем через window.open, иначе грузится страница в фрейме траста
                            onClick={(): void => {
                                window.open(AGREEMENT_HREF, '_blank');
                            }}
                        >
                            <span className={b('agreement-text')}>
                                Нажимая «Оплатить», вы принимаете&nbsp;
                                <br />
                                <span className={b('agreement-text_bold')}>
                                    условия использования Yandex Pay
                                </span>
                            </span>
                        </Link>
                    </span>
                </div>
            </div>
            <div className={b('protection')}>
                <span className={b('protection-text')}>
                    Защищено
                    <br />
                    Сертификатом SSL
                </span>
                <Icon glyph="lock" className={b('lock')} />
            </div>
        </div>
    );
}
