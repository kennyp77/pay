import React from 'react';

import { Icon } from '../../icons';
import { cnListButton, ListButtonBase, ListButtonProps } from '../base';

import ArrowIcon from './assets/arrow-right.svg';

import './styles.scss';

export const ListButtonDefault: React.FunctionComponent<
    ListButtonProps & React.HTMLAttributes<HTMLDivElement>
> = (props) => {
    const iconEdit = <Icon svg={ArrowIcon} size="m" className={cnListButton('ArrowIcon')} />;

    return <ListButtonBase {...props} iconRight={props.iconRight ?? iconEdit} view="default" />;
};
