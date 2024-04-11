import { compose, ExtractProps } from '@bem-react/core';
import { Radiobox as RadioGroupDesktop, withSizeM, withViewDefault } from '@yandex-lego/components/Radiobox/desktop';

import './override.scss';

export const RadioGroup = compose(withSizeM, withViewDefault)(RadioGroupDesktop);

export type RadioGroupProps = ExtractProps<typeof RadioGroup>;
