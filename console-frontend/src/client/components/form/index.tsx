import * as React from 'react';

import {
  Form as FormikForm,
  Formik,
  FormikConfig,
  FormikProps,
  FormikValues,
  validateYupSchema,
  yupToFormErrors,
} from 'formik';

interface FormProps<V extends FormikValues = FormikValues>
  extends FormikConfig<V> {
  children:
    | ((value: V, formik: FormikProps<V>) => React.ReactNode)
    | React.ReactNode
    | undefined;
}

export class Form<
  Values extends FormikValues = FormikValues,
> extends React.PureComponent<FormProps<Values>> {
  formikProps!: FormikProps<Values>;

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

        return errors;
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
    const { ...props } = this.props;

    return (
      <Formik
        {...props}
        validate={props.validate ? props.validate : this.validate}
      >
        {this.renderForm}
      </Formik>
    );
  }
}

export type { FormikSetValuesType } from './base';
