import { withBemMod } from '@bem-react/core-fork';

import { IButtonProps, cnButton } from '../base';

import './success.scss';

interface ButtonOutlineSuccessProps {
    outline?: 'success';
}

export const withOutlineSuccess = withBemMod<ButtonOutlineSuccessProps, IButtonProps>(cnButton(), {
    outline: 'success',
});
