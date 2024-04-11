import { FC } from 'react';
import { ExtractProps } from '@bem-react/core';

import { FormContentProps } from './base';
import { Textinput } from '../text-input';

export const FormInputContent: FC<FormContentProps> = ({
  inputVariant,
  name,
  view,
  size,
  label,
  placeholder,
  className,
  onFocus,
  onInput,
  disabled,
  state,
  hint,
  onChangeHandler,
  onBlurHandler,
  inputRef,
  changeIcon,
  mouseEventHandler,
  value,
  autoComplete,
  iconLeft,
  type = 'text',
}) => {
  return (
    <Textinput
      name={name}
      variant={inputVariant}
      view={view}
      size={size}
      label={label}
      placeholder={placeholder}
      className={className}
      state={state}
      hint={hint}
      onChange={onChangeHandler}
      onFocus={onFocus}
      onBlur={onBlurHandler}
      onInput={onInput}
      innerRef={inputRef}
      iconLeft={iconLeft}
      iconRight={changeIcon}
      onMouseEnter={() => mouseEventHandler(true)}
      onMouseLeave={() => mouseEventHandler(false)}
      disabled={disabled}
      type={type}
      value={value}
      autoComplete={autoComplete}
    />
  );
};

export type FormInputContentProps = ExtractProps<typeof FormInputContent>;
