import { compose, composeU, ExtractProps } from '@bem-react/core';
import {
    Textinput as InputBase,
    withSizeM,
    withSizeS,
    withViewMaterial,
} from '@yandex-lego/components/Textinput/desktop';
import { withDebounceInput } from '@yandex-lego/components/withDebounceInput';

import { withMask } from './_mix/mask';
import { withProgress } from './_mix/progress';
import { withValid } from './_mix/valid';
import { withAnalytics } from './_with_analytics';

import './override.scss';

export const Input = compose(
    withViewMaterial,
    composeU(withSizeM, withSizeS),
    withValid,
    withMask,
    withProgress,
    withDebounceInput,
    withAnalytics,
)(InputBase);

export type InputProps = ExtractProps<typeof Input>;
