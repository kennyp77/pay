import { FC, ChangeEvent, useRef, useCallback } from 'react';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { Field, useField, useFormikContext } from 'formik';
import { useToggle, useClickAway } from 'react-use';

import { SpacerProps, spacerModsCn } from '../spacers';
import { Checkbox } from '../checkbox';
import { Tooltip } from '../tooltip';

type CheckboxVariants = 'gray-label';
type CheckboxViews = 'default';
type CheckboxSizes = 'm';

interface CustomCheckboxProps extends IClassNameProps, SpacerProps {
  fieldName: string;
  variant?: CheckboxVariants;
  view?: CheckboxViews;
  size?: CheckboxSizes;
  setChecked: () => void;
  checked: boolean;
  label: JSX.Element;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const CustomCheckbox: FC<CustomCheckboxProps> = ({
  fieldName,
  variant,
  view,
  size,
  setChecked,
  checked,
  label,
  className,
  disabled,
}) => {
  const buttonRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [field, meta] = useField(fieldName);
  const { setFieldValue } = useFormikContext();
  const [checkboxVisible, checkboxVisibleToggle] = useToggle(false);

  useClickAway(tooltipRef, () => {
    checkboxVisibleToggle(false);
  });

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      field.onChange(e);
      setFieldValue(fieldName, e.target.checked);
      setChecked();

      if (!field.value) {
        checkboxVisibleToggle(true);
      }
    },
    [field, setChecked, setFieldValue, checkboxVisibleToggle, fieldName],
  );

  return (
    <>
      <Checkbox
        name={fieldName}
        variant={variant}
        view={view}
        size={size}
        onChange={handleChange}
        onBlur={field.onBlur}
        checked={checked}
        label={label}
        innerRef={buttonRef}
        className={className}
        disabled={disabled}
      />
      {meta.touched && meta.error && (
        <Tooltip
          variant="short"
          view="default"
          direction="top-start"
          size="m"
          hasTail={true}
          anchor={buttonRef}
          visible={checkboxVisible}
          innerRef={tooltipRef}
        >
          {meta.error}
        </Tooltip>
      )}
    </>
  );
};

export const FormCheckbox: FC<CustomCheckboxProps> = ({
  variant,
  view,
  size,
  ...props
}) => {
  const [rest, spacerClassName] = spacerModsCn(props);

  return (
    <div className={spacerClassName}>
      <Field
        {...props}
        component={CustomCheckbox}
        variant={variant ? variant : 'gray-label'}
        view={view ? view : 'default'}
        size={size ? size : 'm'}
        type="checkbox"
        {...rest}
      />
    </div>
  );
};

export type FormCheckboxProps = ExtractProps<typeof FormCheckbox>;
