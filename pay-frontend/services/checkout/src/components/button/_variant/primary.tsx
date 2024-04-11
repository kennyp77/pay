import { withBemMod } from '@bem-react/core-fork';

import { IButtonProps, cnButton } from '../base';

import './primary.scss';

interface ButtonVariantPrimaryProps {
    variant?: 'primary';
}

export const withVariantPrimary = withBemMod<ButtonVariantPrimaryProps, IButtonProps>(cnButton(), {
    variant: 'primary',
});
