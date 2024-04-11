import { compose, ExtractProps } from '@bem-react/core';
import {
    Textinput as InputBase,
    withSizeM,
    withViewMaterial,
} from '@yandex-lego/components/Textinput/desktop';

import './override.scss';

export const Input = compose(withViewMaterial, withSizeM)(InputBase);

export type InputProps = ExtractProps<typeof Input>;
