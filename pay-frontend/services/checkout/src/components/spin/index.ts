import { compose, composeU, ExtractProps } from '@bem-react/core';
import {
    Spin as SpinBase,
    withViewDefault,
    withSizeXXS,
    withSizeXS,
    withSizeM,
    withSizeL,
} from '@yandex-lego/components/Spin/desktop';

import './override.scss';

export const Spin = compose(
    withViewDefault,
    composeU(withSizeXXS, withSizeXS, withSizeM, withSizeL),
)(SpinBase);

export type SpinProps = ExtractProps<typeof Spin>;
