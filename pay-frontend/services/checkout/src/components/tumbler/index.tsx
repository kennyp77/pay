import { compose, composeU, ExtractProps } from '@bem-react/core';
import {
    Tumbler as TumblerDesktop,
    withSizeM,
    withSizeL,
    withViewDefault,
} from '@yandex-lego/components/Tumbler/desktop';

import { withVariantSplit } from './_variant/split';

import './override.scss';

export const Tumbler = compose(
    composeU(withSizeM, withSizeL),
    withViewDefault,
    withVariantSplit,
)(TumblerDesktop);

export type TumblerProps = ExtractProps<typeof Tumbler>;
