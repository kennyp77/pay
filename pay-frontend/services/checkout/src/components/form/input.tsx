import { Input, InputProps } from '../input';

import { withFormField } from './_field';

export const FormInput = withFormField<InputProps>(Input, { size: 'm', view: 'material', variant: 'filled' }, { valid: true });
