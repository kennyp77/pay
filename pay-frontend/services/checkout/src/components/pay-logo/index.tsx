import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { Icon } from '../icons';

import LogoPayIcon from './assets/logo-pay.svg';

import './styles.scss';

const cnPayLogo = cn('PayLogo');

interface PayLogoProps extends IClassNameProps {}

export function PayLogo({ className }: PayLogoProps) {
    return <Icon svg={LogoPayIcon} className={cnPayLogo({}, [className])} />;
}
