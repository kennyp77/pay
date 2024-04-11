import { cn } from '@bem-react/classname';

import { SpacerSize } from './typings';

import './index.scss';

export type SpacerProps = {
  all?: SpacerSize;
  bottom?: SpacerSize;
  left?: SpacerSize;
  right?: SpacerSize;
  top?: SpacerSize;
};

const cls = cn('Spacer');

type NoSpacerProps<T> = Omit<T, keyof SpacerProps>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const spacerMods = <T extends Record<string, any>>(
  props: T,
): [NoSpacerProps<T>, SpacerProps] => {
  const { all, top, left, right, bottom, ...rest } = props;

  return [rest, { all, top, left, right, bottom }];
};

export const spacerCn = (props: Partial<SpacerProps>): string => {
  return cls(props);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const spacerModsCn = <T extends Record<string, any>>(
  props: T,
): [NoSpacerProps<T>, string] => {
  const [rest, spacer] = spacerMods(props);

  return [rest, spacerCn(spacer)];
};
