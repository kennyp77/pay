import React from 'react';

import { useUniqId } from '@yandex-lego/components/useUniqId';
import { useField } from 'formik';

export interface FormFieldProps {
    label?: string;
    labelAction?: JSX.Element;
}

interface StateConfig {
    valid?: boolean;
}

export function withFormField<T extends {}>(
    Field: React.ComponentType<T>,
    defaultProps: Partial<T> = {},
    stateConfig: StateConfig = {},
) {
    const fieldName = Field.displayName || Field.name || 'Field';
    const stateProps: Record<string, string | boolean> = { hint: '', state: '' };

    const FormField: React.FC<FormFieldProps & T> = (props) => {
        const id = useUniqId(fieldName);
        const [field, meta] = useField(props as any);

        stateProps.hint = meta.touched && meta.error ? meta.error : '';
        stateProps.state = meta.touched && meta.error ? 'error' : '';

        if (stateConfig.valid) {
            stateProps.valid = meta.touched && !meta.error;
        }

        return <Field id={id} {...defaultProps} {...(props as T)} {...field} {...stateProps} />;
    };

    FormField.displayName = `withFormField(${fieldName})`;

    return FormField;
}
