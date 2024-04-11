import { withBemMod } from '@bem-react/core-fork';

import { IButtonProps, cnButton } from '../base';

import './round-m.scss';

interface ButtonPinRoundSProps {
    pin?: 'round-s';
}

export const withPinRoundS = withBemMod<ButtonPinRoundSProps, IButtonProps>(cnButton(), {
    pin: 'round-s',
});
