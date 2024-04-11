import React from 'react';

import { compose, composeU } from '@bem-react/core';
import {
    Checkbox as LegoCheckbox,
    withSizeM,
    ICheckboxProps,
    ICheckboxSizeMProps,
    ICheckboxViewDefaultProps,
    withViewDefault,
    withViewOutline,
    ICheckboxViewOutlineProps,
} from '@yandex-lego/components/Checkbox/desktop';

import { withVariantBlue, ICheckboxVariantBlueProps } from './_variant/_blue/Checkbox_variant_blue';

const ComposedLegoCheckbox = compose(
    composeU(withSizeM),
    composeU(withViewDefault, withViewOutline),
    composeU(withVariantBlue),
)(LegoCheckbox);

type SizeProps = ICheckboxSizeMProps;

type ViewProps = ICheckboxViewDefaultProps | ICheckboxViewOutlineProps;

type VariantProps = ICheckboxVariantBlueProps;

type Props = ICheckboxProps & SizeProps & VariantProps & ViewProps;

const Checkbox = ({ ...rest }: Props) => <ComposedLegoCheckbox {...rest} />;

export { LegoCheckbox };

export default Checkbox;
