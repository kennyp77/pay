import React from 'react';

import { Icon } from '../../icons';
import { ListButtonBase, ListButtonProps, cnListButton } from '../base';

import ArrowDownIcon from './assets/arrow-down.svg';

import './styles.scss';

export const ListButtonInput: React.FunctionComponent<
    ListButtonProps & React.HTMLAttributes<HTMLDivElement>
> = (props) => {
    const iconArrowDown = (
        <Icon svg={ArrowDownIcon} size="m" className={cnListButton('ArrowDownIcon')} />
    );

    return <ListButtonBase {...props} iconRight={props.iconRight ?? iconArrowDown} view="input" />;
};
