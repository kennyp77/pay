import { compose, composeU, ExtractProps } from '@bem-react/core';
import {
    Spin as SpinBase,
    withViewDefault,
    withSizeM,
    withSizeL,
} from '@yandex-lego/components/Spin/desktop';

import './override.scss';

export const Spin = compose(withViewDefault, composeU(withSizeM, withSizeL))(SpinBase);

export type SpinProps = ExtractProps<typeof Spin>;
