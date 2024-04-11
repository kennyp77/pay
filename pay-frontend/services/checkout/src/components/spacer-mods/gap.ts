import { cn } from '@bem-react/classname';

import { SpacerSize } from './typings';

import './styles.scss';

export type GapProps = {
    gap?: SpacerSize;
};

const cnGap = cn('gap');

type AnyProps = GapProps & Record<string, any>;
type OtherProps<T> = Omit<T, keyof GapProps>;

export const gapMods = <T extends AnyProps>(props: T): [OtherProps<T>, GapProps] => {
    const { gap, ...rest } = props;

    return [rest, { gap }];
};

export const gapCn = (type: 'width' | 'height', props?: Partial<GapProps>) => {
    return props?.gap ? cnGap({ [type]: props.gap }) : '';
};
