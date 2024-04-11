import React, { ReactElement, ReactNode } from 'react';

import {
    Formik,
    Form as FormikForm,
    FormikConfig,
    FormikProps,
    FormikErrors,
    FormikValues,
    validateYupSchema,
    yupToFormErrors,
} from 'formik';

interface FormProps<V extends FormikValues = FormikValues> extends FormikConfig<V> {
    className?: string;
    children: ((value: V, formik: FormikProps<V>) => ReactNode) | ReactElement | undefined;
}

export class Form<Values extends FormikValues = FormikValues> extends React.PureComponent<
    FormProps<Values>
> {
    formikProps: FormikProps<Values>;

    emptyErrors = {};

    /**
     * Убираем ошибки на untouched полях
     * @private
     */
    validate = (values: Values) => {
        if (!(this.props.validationSchema && this.formikProps)) {
            return this.emptyErrors;
        }

        return validateYupSchema(values, this.props.validationSchema).then(
            () => this.emptyErrors,
            (err) => {
                if (err.name !== 'ValidationError') {
                    return Promise.reject(err);
                }

                const errors = yupToFormErrors<FormikValues>(err);
                const touchedFields = Object.keys(this.formikProps.touched);

                if (!touchedFields.length) {
                    return errors;
                }

                return touchedFields.reduce((_errors, field) => {
                    if (errors[field]) {
                        _errors[field] = errors[field];
                    }

                    return _errors;
                }, {} as FormikErrors<FormikValues>);
            },
        );
    };

    renderChildren(formikProps: FormikProps<Values>): React.ReactNode {
        const { children } = this.props;

        this.formikProps = formikProps;

        if (typeof children === 'function') {
            return children(formikProps.values, formikProps);
        }

        return children;
    }

    renderForm = (formikProps: FormikProps<Values>): React.ReactNode => {
        return <FormikForm>{this.renderChildren(formikProps)}</FormikForm>;
    };

    render(): React.ReactNode {
        const { validationSchema, children, ...props } = this.props;

        return (
            <Formik {...props} validate={this.validate}>
                {this.renderForm}
            </Formik>
        );
    }
}
