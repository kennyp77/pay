import * as React from 'react';
import InputMask from 'react-input-mask';
import { withBemMod } from '@bem-react/core';
import { cn } from '@bem-react/classname';
import { Textinput } from 'components/text-input';
import { CustomInputProps } from 'components/form-input';

import { FormContentProps, FormContentVariantProps } from '../base';

const cnInputContent = cn('InputContent');

export const withVariantMask = withBemMod<
  FormContentVariantProps,
  FormContentProps
>(cnInputContent(), { variant: 'mask' }, () => {
  return ({ ...props }) => {
    return (
      <InputMask
        mask={props.mask as string}
        maskChar=""
        formatChars={{
          '9': '[0-9]',
          a: '[A-Za-z]',
          '*': '[A-Za-z0-9]',
          '?': '[0-7, 9]',
        }}
        value={props.value}
        onBlur={props.onBlurHandler}
        onChange={props.onChangeHandler}
        onFocus={props.onFocus}
        disabled={props.disabled}
      >
        {(inputProps: CustomInputProps) => (
          <Textinput
            {...inputProps}
            state={props.state}
            hint={props.hint}
            name={props.name}
            variant={props.inputVariant}
            view={props.view}
            size={props.size}
            label={props.label}
            placeholder={props.placeholder}
            className={props.className}
            onInput={props.onInput}
            innerRef={props.inputRef}
            iconRight={props.changeIcon}
            disabled={props.disabled}
            type={props.type}
            onMouseEnter={() => props.mouseEventHandler(true)}
            onMouseLeave={() => props.mouseEventHandler(false)}
          />
        )}
      </InputMask>
    );
  };
});
