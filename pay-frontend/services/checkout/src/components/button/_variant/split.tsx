import { withBemMod } from '@bem-react/core-fork';

import { IButtonProps, cnButton } from '../base';

import './split.scss';

interface ButtonVariantSplitProps {
    variant?: 'split';
}

export const withVariantSplit = withBemMod<ButtonVariantSplitProps, IButtonProps>(cnButton(), {
    variant: 'split',
});
