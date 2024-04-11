import { withBemMod } from '@bem-react/core-fork';

import { IButtonProps, cnButton } from '../base';

import './primary.scss';

interface ButtonOutlinePrimaryProps {
    outline?: 'primary';
}

export const withOutlinePrimary = withBemMod<ButtonOutlinePrimaryProps, IButtonProps>(cnButton(), {
    outline: 'primary',
});
