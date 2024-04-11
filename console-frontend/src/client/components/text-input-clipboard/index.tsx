import { FC, useCallback, useRef } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../button';
import { Textinput } from '../text-input';
import { Icon } from '../icon';

import { basePath } from 'const';
import './index.scss';

interface TextinputClipboardProps {
  value: string;
  variant?: 'outlined' | 'bordered';
  label?: string;
}

const cnTextinputClipboard = cn('TextinputClipboard');

export const TextinputClipboard: FC<TextinputClipboardProps> = ({
  value,
  label,
  variant = 'outlined',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const IconClipboard = useCallback(
    (className: string) => (
      <Icon
        className={className}
        size={40}
        url={`${basePath}/icons/copy.svg`}
      />
    ),
    [],
  );

  const copyText = useCallback(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.select();
    }
    navigator.clipboard.writeText(value);
  }, [value]);

  return (
    <div className={cnTextinputClipboard()}>
      <Textinput
        className={cnTextinputClipboard('Input')}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variant={variant as any}
        view="material"
        label={label}
        value={value}
        readOnly
        controlRef={inputRef}
      />
      <Button
        className={cnTextinputClipboard('ButtonCopy')}
        icon={IconClipboard}
        view="clear"
        onClick={copyText}
      />
    </div>
  );
};
