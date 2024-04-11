import { compose, ExtractProps } from '@bem-react/core';

import {
  RadioButton as RadioButtonDesktop,
  withViewDefault,
  withSizeM,
} from '@yandex/ui/RadioButton/desktop';

import './_view/default.scss';

export const RadioButton = compose(
  withSizeM,
  withViewDefault,
)(RadioButtonDesktop);

export type RadioButtonProps = ExtractProps<typeof RadioButton>;
