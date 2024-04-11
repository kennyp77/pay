import { withBemMod } from '@bem-react/core';
import { cnCheckbox } from '@yandex-lego/components/Checkbox';

import './Checkbox_variant_blue.css';

export interface ICheckboxVariantBlueProps {
    variant?: 'blue';
}

export const withVariantBlue = withBemMod<ICheckboxVariantBlueProps>(cnCheckbox(), {
    variant: 'blue',
});
