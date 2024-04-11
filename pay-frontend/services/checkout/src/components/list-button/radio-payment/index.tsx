import React from 'react';

import { Icon, SvgIcon } from '../../icons';
import { cnListButton } from '../base';
import { ListButtonRadio, ListButtonRadioProps } from '../radio';

import './styles.scss';

type ListButtonRadioPaymentProps = Omit<
    ListButtonRadioProps,
    'iconLeft' | 'size' | 'view' | 'radioPosition'
> & {
    svgLeft: SvgIcon;
};

export const ListButtonRadioPayment: React.FunctionComponent<
    ListButtonRadioPaymentProps & React.HTMLAttributes<HTMLDivElement>
> = ({ svgLeft, ...props }) => {
    return (
        <ListButtonRadio
            {...props}
            size="m"
            view="radio"
            radioPosition="right"
            iconLeft={<Icon svg={svgLeft} size="l" />}
            className={cnListButton('RadioPayment')}
        />
    );
};
