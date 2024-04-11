import { withBemMod } from '@bem-react/core-fork';

import { TumblerProps, cnTumbler } from '../base';

import './split.scss';

interface ButtonVariantPrimaryProps {
    variant?: 'split';
}

export const withVariantSplit = withBemMod<ButtonVariantPrimaryProps, TumblerProps>(cnTumbler(), {
    variant: 'split',
});
