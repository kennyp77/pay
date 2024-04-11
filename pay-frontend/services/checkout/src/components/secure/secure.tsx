import React from 'react';

import { cn } from '@bem-react/classname';

import { Icon, SvgIcon } from '../icons';
import { Row } from '../row';
import { Text } from '../text';

import PayBadgeIcon from './assets/pay-badge.svg';
import SecureIcon from './assets/secure.svg';

import './secure.scss';

const cnSecureInfo = cn('SecureInfo');

const i18n = (v: string) => v;

interface SecureInfoProps {
    logo?: SvgIcon;
}

export function SecureInfo({ logo = PayBadgeIcon }: SecureInfoProps) {
    return (
        <Row justify="between" align="center">
            <Row right="m" align="center">
                <Icon svg={SecureIcon} size="m" />
                <Text left="s" variant="xs" color="grey">
                    {i18n('Карты надёжно хранятся')} <br />
                    {i18n('в зашифрованном виде')}
                </Text>
            </Row>

            <Icon svg={logo} className={cnSecureInfo('PayIcon')} />
        </Row>
    );
}
