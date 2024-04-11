import React from 'react';

import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';

import { AGREEMENT_HREF } from '../../config';
import { isPayWithSplit } from '../../store/split';
import { Icon } from '../icons';
import { Link } from '../link';
import { Row } from '../row';
import { Text } from '../text';

import SecureIcon from './assets/secure.svg';

const i18n = (v: string) => v;

interface SecureInfoPayProps {
    compact?: true;
}

export function SecureInfoPay({ compact }: SecureInfoPayProps) {
    const payWithSplit = useSelector(isPayWithSplit);

    return (
        <Row justify="between" align="center">
            {payWithSplit ? (
                <Text right="m" variant="xs" color="grey">
                    <span>{i18n('Нажимая оплатить вы соглашаетесь c ')}</span>
                    <Link view="default" href={AGREEMENT_HREF} linkType="external" target="_blank">
                        {i18n('пользовательским соглашением')}
                    </Link>
                    <span>{i18n(' и на проверку дополнительной информации у ')}</span>
                    <Link view="default" href={AGREEMENT_HREF} linkType="external" target="_blank">
                        {i18n('третьих лиц')}
                    </Link>
                    <span>{i18n(' по номеру телефона')}</span>
                </Text>
            ) : (
                <Text right="m" variant="xs" color="grey">
                    <span>{i18n('Нажимая оплатить вы принимаете ')}</span>
                    <Link view="default" href={AGREEMENT_HREF} linkType="external" target="_blank">
                        {i18n('пользовательское соглашение')}
                    </Link>
                </Text>
            )}

            <Row shrink align="center">
                {!compact ? (
                    <Text right="s" variant="xs" color="grey" align="right">
                        Protected
                        <br />
                        by Yandex Pay
                    </Text>
                ) : null}
                <Icon svg={SecureIcon} size="m" />
            </Row>
        </Row>
    );
}
