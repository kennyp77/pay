import React, { Ref, ElementType } from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { spacerModsCn, gapMods, gapCn, SpacerProps, GapProps } from '../spacer-mods';

import './styles.scss';

const cnRow = cn('row');

export interface RowProps extends IClassNameProps, SpacerProps, GapProps {
    type?: 'inline';
    as?: ElementType;
    align?: 'start' | 'center' | 'end' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    wrap?: 'yes';
    shrink?: boolean;
    innerRef?: Ref<HTMLDivElement>;
}

interface RowInnerProps {
    direction?: 'col';
}

const Spacer: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
    <div {...props} className={cnRow('spacer')} />
);

export class Row extends React.PureComponent<
    RowProps & RowInnerProps & React.HTMLAttributes<HTMLDivElement>
> {
    static Spacer = Spacer;

    renderChildren() {
        const [props, gapProps] = gapMods(this.props);

        if (!gapProps.gap) {
            return props.children;
        }

        const gapType = props.direction === 'col' ? 'height' : 'width';

        return React.Children.map(props.children, (child, idx) => (
            <React.Fragment>
                {idx === 0 || !child ? null : (
                    <span className={cnRow('gap', [gapCn(gapType, gapProps)])} />
                )}
                {child}
            </React.Fragment>
        ));
    }

    render() {
        const [props, spacerClassName] = spacerModsCn(this.props);
        const {
            as: Component = 'div',
            className,
            children,
            type,
            align,
            justify,
            wrap,
            direction,
            innerRef,
            gap: _,
            shrink,
            ...restProps
        } = props;

        const mods = {
            direction,
            type,
            align,
            justify,
            wrap,
            shrink,
        };
        const classes = cnRow(mods, [className, spacerClassName]);

        return (
            <Component ref={innerRef} className={classes} {...restProps}>
                {this.renderChildren()}
            </Component>
        );
    }
}
