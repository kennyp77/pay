import { FC, useCallback, useState, useEffect } from 'react';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { Option } from '@yandex/ui/Select/Select';
import { Field, useField, useFormikContext } from 'formik';

import { SpacerProps, spacerModsCn } from '../spacers';
import { Select } from '../select';
import { Text } from 'components/text';

type SelectVariants = 'outlined';
type SelectWidths = 'max';

interface CustomSelectProps extends IClassNameProps, SpacerProps {
  fieldName: string;
  variant?: SelectVariants;
  view?: string;
  width?: SelectWidths;
  className?: string;
  label: string;
  defaultValue?: string;
  options: Option[];
  hint?: string;
}

const CustomSelect: FC<CustomSelectProps> = ({
  fieldName,
  variant,
  view,
  width,
  className,
  label,
  defaultValue,
  options,
  hint,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [field] = useField(fieldName);
  const formikProps = useFormikContext();

  useEffect(() => {
    formikProps.setFieldValue(fieldName, defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, fieldName]);

  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      setValue(e.target.value);
      formikProps.setFieldValue(fieldName, e.target.value);
      field.onChange(e.target.value);
    },
    [field, fieldName, formikProps],
  );

  return (
    <>
      <Select
        name={fieldName}
        variant={variant}
        view={view}
        width={width}
        value={value}
        className={className}
        onChange={onChangeHandler}
        options={options}
        label={label}
      />
      {hint ? (
        <Text color="tertiary" top={8} as="p">
          {hint}
        </Text>
      ) : null}
    </>
  );
};

export const FormSelect: FC<CustomSelectProps> = ({
  variant,
  view,
  width,
  label,
  defaultValue,
  ...props
}) => {
  const [rest, spacerClassName] = spacerModsCn(props);

  return (
    <div className={spacerClassName}>
      <Field
        {...props}
        as="select"
        component={CustomSelect}
        width={width ? width : 'max'}
        view={view ? view : 'default'}
        variant={variant ? variant : 'outlined'}
        label={label}
        defaultValue={defaultValue}
        {...rest}
      />
    </div>
  );
};

export type FormSelectProps = ExtractProps<typeof FormSelect>;
