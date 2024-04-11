import React from 'react';

import { cn } from '@bem-react/classname';

import { spacerModsCn, SpacerProps } from '../spacer-mods';

import './styles.scss';

type TextColor = 'black' | 'grey' | 'white' | 'plus' | 'red' | 'green';
type TextVariant = 'header-l' | 'header-m' | 'header-s' | 'm' | 's' | 'xs';
type TextWeight = 'bold';
type TextAlign = 'left' | 'center' | 'right';
type TextOverflow = 'ellipsis';

interface TextProps extends SpacerProps {
    as?: React.ElementType;
    color?: TextColor;
    variant?: TextVariant;
    weight?: TextWeight;
    align?: TextAlign;
    overflow?: TextOverflow;
    className?: string;
    tabNums?: boolean;
    inline?: boolean;
    /**
     * Other html attributes.
     */
    htmlFor?: string;
}

const cnText = cn('Text');

export class Text extends React.PureComponent<
    React.PropsWithChildren<TextProps & React.HTMLAttributes<HTMLElement>>
> {
    static TabularNums: React.FC = (props) => <span {...props} className={cnText('TabularNums')} />;

    render() {
        const [
            {
                as: ElementType = 'span',
                color = 'black',
                align = 'left',
                variant = 'm',
                weight,
                inline,
                overflow,
                tabNums,
                className,
                children,
                ...props
            },
            spacerClassName,
        ] = spacerModsCn(this.props);

        const classes = cnText(
            {
                color,
                align,
                variant,
                weight,
                overflow,
                tabNums,
                inline,
            },
            [className, spacerClassName],
        );

        return (
            <ElementType className={classes} {...props}>
                {children}
            </ElementType>
        );
    }
}
