import { compose, composeU, ExtractProps } from '@bem-react/core';
import {
    Button as ButtonBase,
    withSizeS,
    withSizeM,
    withSizeL,
    withViewDefault,
    withViewAction,
    withViewClear,
    withViewPseudo,
    withViewLink,
    withTypeLink,
    withTypeSubmit,
    withPinCircleCircle,
    withWidthMax,
} from '@yandex-lego/components/Button/desktop';

import { withPrice } from './_mix/price';
import { withOutlinePrimary } from './_outline/primary';
import { withOutlineSuccess } from './_outline/success';
import { withPinRoundM } from './_pin/round-m';
import { withPinRoundS } from './_pin/round-s';
import { withVariantPrimary } from './_variant/primary';
import { withVariantSplit } from './_variant/split';
import { withViewInvisible } from './_view/invisible';

import './override.scss';

export const Button = compose(
    composeU(
        withViewDefault,
        withViewAction,
        withViewClear,
        withViewPseudo,
        withViewLink,
        withViewInvisible,
    ),
    composeU(withSizeS, withSizeM, withSizeL),
    composeU(withTypeLink, withTypeSubmit),
    composeU(withWidthMax),
    composeU(withVariantPrimary, withVariantSplit),
    composeU(withPinCircleCircle, withPinRoundS, withPinRoundM),
    composeU(withOutlinePrimary, withOutlineSuccess),
    withPrice,
)(ButtonBase);

export type ButtonProps = ExtractProps<typeof Button>;
