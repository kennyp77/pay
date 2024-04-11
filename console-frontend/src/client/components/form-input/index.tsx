import {
  FC,
  ChangeEvent,
  FocusEvent,
  useState,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { Icon } from 'components/icon';
import { Field, useField, useFormikContext } from 'formik';

import { SpacerProps, spacerModsCn } from '../spacers';
import { TextinputProps } from '../text-input';
import { Tooltip } from '../tooltip';
import { FormInputContent } from 'components/form-input-content/base';
import { Text } from 'components/text';
import { useResponsive } from 'client/hooks/useResponsive';

import { InputVariantProps } from 'components/text-input';
import { basePath } from 'const';

export interface CustomInputProps extends IClassNameProps, SpacerProps {
  fieldName: string;
  variant?: InputVariantProps['variant'];
  view?: TextinputProps['view'];
  size?: TextinputProps['size'];
  label?: string;
  placeholder?: string;
  className?: string;
  value?: TextinputProps['value'];
  tooltipText?: string;
  mask?: string;
  maskDefaultValue?: string;
  type?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  inputVariant?: InputVariantProps['variant'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentVariant?: any;
  autoComplete?: string;
  iconLeft?: TextinputProps['iconLeft'];
  canValidated?: boolean;
}

const CustomInput: FC<CustomInputProps> = ({
  fieldName,
  view,
  size,
  label,
  placeholder,
  className,
  tooltipText,
  mask,
  maskDefaultValue,
  onChange,
  onFocus,
  onBlur,
  onInput,
  disabled,
  inputVariant,
  contentVariant,
  value,
  autoComplete,
  iconLeft,
  type = 'text',
  canValidated = true,
}) => {
  const [visible, setVisible] = useState(false);
  const [wasChanged, setWasChanged] = useState(false);
  const inputRef = useRef(null);
  const [field, meta] = useField(fieldName);
  const formikProps = useFormikContext();
  const { isDesktop } = useResponsive();

  const changeIcon = useMemo(() => {
    if (canValidated) {
      if (field.value && !meta.error) {
        return (
          <Icon glyph="type-check" style={{ color: 'var(--color-succes)' }} />
        );
      }
      if (wasChanged && meta.touched && meta.error) {
        return <Icon url={`${basePath}/form-input-error-icon.svg`} />;
      }
    }
    return <></>;
  }, [field, meta, wasChanged, canValidated]);

  const onBlurHandler = useCallback(
    (e: React.FocusEvent<HTMLInputElement>): void => {
      if (mask && meta.touched && e.target.value === '') {
        setWasChanged(true);
        formikProps.setFieldValue(fieldName, maskDefaultValue);
      }
      onBlur && onBlur(e);
      return field.onBlur(e);
    },
    [
      field,
      fieldName,
      formikProps,
      mask,
      maskDefaultValue,
      meta.touched,
      onBlur,
    ],
  );

  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (e.target.value !== '') {
        setWasChanged(true);
      }
      onChange && onChange(e);
      return field.onChange(e);
    },
    [field, onChange],
  );

  const mouseEventHandler = useCallback(
    (newValue: boolean) => setVisible(newValue),
    [],
  );

  return (
    <>
      {view === 'default' && label ? (
        <Text color="secondary" bottom={8} as="p">
          {label}
        </Text>
      ) : null}
      <FormInputContent
        variant={contentVariant}
        inputVariant={inputVariant}
        name={fieldName}
        view={view}
        size={size}
        label={label}
        placeholder={placeholder}
        className={className}
        state={wasChanged && meta.touched && meta.error ? 'error' : undefined}
        hint={wasChanged && meta.touched ? meta.error : undefined}
        value={value || field.value}
        onChangeHandler={onChangeHandler}
        onFocus={onFocus}
        onBlurHandler={onBlurHandler}
        onInput={onInput}
        inputRef={inputRef}
        changeIcon={changeIcon}
        mouseEventHandler={mouseEventHandler}
        disabled={disabled}
        type={type}
        mask={mask}
        maskDefaultValue={maskDefaultValue}
        autoComplete={autoComplete}
        iconLeft={iconLeft}
      />
      {tooltipText && (
        <Tooltip
          variant="short"
          view="default"
          direction={isDesktop ? 'right' : 'bottom'}
          size="m"
          hasTail={true}
          anchor={inputRef}
          visible={visible}
        >
          {tooltipText}
        </Tooltip>
      )}
    </>
  );
};

export const FormInput: FC<CustomInputProps> = ({
  variant,
  view,
  size,
  ...props
}) => {
  const [rest, spacerClassName] = spacerModsCn(props);

  return (
    <div className={spacerClassName}>
      <Field
        inputVariant={variant ? variant : 'outlined'}
        view={view ? view : 'material'}
        size={size}
        component={CustomInput}
        {...rest}
      />
    </div>
  );
};

export type FormInputProps = ExtractProps<typeof FormInput>;
