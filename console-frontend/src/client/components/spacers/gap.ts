import { cn } from '@bem-react/classname';

import { SpacerSize } from './typings';

import './index.scss';

export type GapProps = {
  gap?: SpacerSize;
};

const cls = cn('Gap');

type NoGapProps<T> = Omit<T, keyof GapProps>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const gapMods = <T extends Record<string, any>>(
  props: T,
): [NoGapProps<T>, GapProps] => {
  const { gap, ...rest } = props;

  return [rest, { gap }];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const gapModsCn = <T extends Record<string, any>>(
  props: T,
): [NoGapProps<T>, string] => {
  const [rest, gapProps] = gapMods(props);

  return [rest, cls({ all: gapProps.gap })];
};
