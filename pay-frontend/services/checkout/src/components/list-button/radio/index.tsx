import React from 'react';

import { Icon } from '../../icons';
import { ListButtonBase, ListButtonProps, cnListButton } from '../base';

import EditIcon from './assets/edit.svg';
import RadioDisabledIcon from './assets/radio-disabled.svg';
import RadioIcon from './assets/radio.svg';

import './styles.scss';

export type ListButtonRadioProps = ListButtonProps & {
    radioPosition?: 'left' | 'right';
};

export const ListButtonRadio: React.FunctionComponent<
    ListButtonRadioProps & React.HTMLAttributes<HTMLDivElement>
> = ({ radioPosition = 'left', className, disabled, ...props }) => {
    const icon = (
        <Icon
            svg={props.active && !disabled ? RadioIcon : RadioDisabledIcon}
            size="s"
            className={cnListButton('RadioIcon', { active: props.active ? 'yes' : 'no' })}
        />
    );
    const iconEdit = <Icon svg={EditIcon} size="xs" className={cnListButton('EditIcon')} />;

    return (
        <ListButtonBase
            {...props}
            iconLeft={radioPosition === 'left' ? icon : props.iconLeft ?? iconEdit}
            iconRight={radioPosition === 'right' ? icon : props.iconRight ?? iconEdit}
            view="radio"
            className={cnListButton({ radio: radioPosition, disabled }, [className])}
            disabled={disabled}
        />
    );
};
