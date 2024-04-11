import { compose, ExtractProps } from '@bem-react/core';
import {
    Textinput as InputBase,
    withSizeM,
    withViewMaterial,
} from '@yandex-lego/components/Textinput/desktop';

import { withMask } from './_mix/mask';

import './override.scss';

export const Input = compose(withViewMaterial, withSizeM, withMask)(InputBase);

export type InputProps = ExtractProps<typeof Input>;
