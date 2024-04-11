import { ChangeEvent, FocusEvent, MutableRefObject } from 'react';
import { compose, IClassNameProps } from '@bem-react/core';
import { FormInputContent as Base } from './';
import { withVariantMask } from './_variant/mask';
import { TextinputProps } from 'components/text-input';

type InputViews = 'material' | 'default';

export interface FormContentVariantProps extends IClassNameProps {
  variant?: 'mask';
}

export interface FormContentProps extends IClassNameProps {
  name: string;
  variant?: FormContentVariantProps['variant'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputVariant?: any;
  view?: InputViews;
  size?: TextinputProps['size'];
  label?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  tooltipText?: string;
  mask?: string;
  maskDefaultValue?: string;
  type?: string;
  state?: 'error';
  hint?: string;
  onChangeHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlurHandler?: (event: FocusEvent<HTMLInputElement>) => void;
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  inputRef: MutableRefObject<null>;
  changeIcon: JSX.Element;
  mouseEventHandler: (newValue: boolean) => void;
  autoComplete?: string;
  iconLeft?: TextinputProps['iconLeft'];
}

export const FormInputContent = compose(withVariantMask)(Base);
