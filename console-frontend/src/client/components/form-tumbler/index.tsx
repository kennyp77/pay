import { FC, ChangeEvent, useRef, useCallback } from 'react';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { Field, useField, useFormikContext } from 'formik';

import { SpacerProps, spacerModsCn } from '../spacers';
import { Tumbler } from '@yandex/ui/Tumbler/desktop/bundle';

type TumblerViews = 'default';
type TumblerSizes = 'm';

interface CustomTumblerProps extends IClassNameProps, SpacerProps {
  fieldName: string;
  view?: TumblerViews;
  size?: TumblerSizes;
  setChecked: () => void;
  checked: boolean;
  labelAfter: JSX.Element;
  className?: string;
  required?: boolean;
}

const CustomTumbler: FC<CustomTumblerProps> = ({
  fieldName,
  view,
  size,
  setChecked,
  checked,
  labelAfter,
  className,
}) => {
  const buttonRef = useRef<HTMLElement>(null);
  const [field] = useField(fieldName);
  const formikProps = useFormikContext();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      field.onChange(e);
      formikProps.setFieldValue(fieldName, e.target.checked);
      setChecked();
    },
    [field, fieldName, formikProps, setChecked],
  );

  return (
    <Tumbler
      name={fieldName}
      view={view}
      size={size}
      onChange={handleChange}
      onBlur={field.onBlur}
      checked={checked}
      labelAfter={labelAfter}
      innerRef={buttonRef}
      className={className}
    />
  );
};

export const FormTumbler: FC<CustomTumblerProps> = ({
  view,
  size,
  ...props
}) => {
  const [rest, spacerClassName] = spacerModsCn(props);

  return (
    <div className={spacerClassName}>
      <Field
        {...props}
        component={CustomTumbler}
        view={view ? view : 'default'}
        size={size ? size : 'm'}
        type="checkbox"
        {...rest}
      />
    </div>
  );
};

export type FormTumblerProps = ExtractProps<typeof FormTumbler>;
