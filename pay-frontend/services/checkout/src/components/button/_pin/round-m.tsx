import { withBemMod } from '@bem-react/core-fork';

import { IButtonProps, cnButton } from '../base';

import './round-m.scss';

interface ButtonPinRoundMProps {
    pin?: 'round-m';
}

export const withPinRoundM = withBemMod<ButtonPinRoundMProps, IButtonProps>(cnButton(), {
    pin: 'round-m',
});
