import { compose, composeU, ExtractProps } from '@bem-react/core';
import {
    RadioButton as RadioButtonDesktop,
    withSizeM,
    withSizeL,
    withViewDefault,
} from '@yandex-lego/components/RadioButton/desktop';

import './override.scss';

export const RadioButton = compose(composeU(withSizeM, withSizeL), withViewDefault)(RadioButtonDesktop);

export type RadioButtonProps = ExtractProps<typeof RadioButton>;
