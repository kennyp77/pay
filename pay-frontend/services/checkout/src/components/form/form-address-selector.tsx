import { ExtractProps } from '@bem-react/core';

import { AddressSelector, AddressSelectorProps } from '../address-selector';

import { withFormField } from './_field';

export const FormAddressSelector = withFormField<AddressSelectorProps>(
    AddressSelector,
    { size: 'm', view: 'material', variant: 'filled' },
    { valid: true },
);

export type FormInnSelectorProps = ExtractProps<typeof FormAddressSelector>;
