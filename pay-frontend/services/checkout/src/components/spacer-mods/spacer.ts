import { cn } from '@bem-react/classname';

import { SpacerSize } from './typings';

import './styles.scss';

export type SpacerProps = {
    all?: SpacerSize;
    top?: SpacerSize;
    left?: SpacerSize;
    right?: SpacerSize;
    bottom?: SpacerSize;
};

const cnSpacer = cn('spacer');

type AnyProps = SpacerProps & Record<string, any>;
type OtherProps<T> = Omit<T, keyof SpacerProps>;

export const spacerMods = <T extends AnyProps>(props: T): [OtherProps<T>, SpacerProps] => {
    const { all, top, left, right, bottom, ...rest } = props;

    return [
        rest,
        {
            all,
            top,
            left,
            right,
            bottom,
        },
    ];
};

export const spacerCn = (props: Partial<SpacerProps>): string => {
    return cnSpacer(props);
};

export const spacerModsCn = <T extends AnyProps>(props: T): [OtherProps<T>, string] => {
    const [rest, spacer] = spacerMods(props);

    return [rest, spacerCn(spacer)];
};

export const w100ClassName = 'w100';
