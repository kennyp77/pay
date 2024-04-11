import React, { ReactNode } from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import { mergeProps } from 'web-platform-alpha';

import { withHover } from '../../../hocs/withHover';
import { ButtonWrapper, ButtonWrapperProps } from '../../button-wrapper';
import { Col } from '../../col';
import { LinkWrapper } from '../../link-wrapper';
import { Row } from '../../row';
import { spacerMods, SpacerProps } from '../../spacer-mods';

import './styles.scss';

type OnClick = ButtonWrapperProps['onPress'];
type Side = 'left' | 'right';

export interface ListButtonProps extends IClassNameProps, SpacerProps {
    view?: 'default' | 'radio' | 'input';
    size: 's' | 'm' | 'l' | 'xl';
    active?: boolean;
    iconLeft?: any;
    iconRight?: any;
    onClick?: OnClick;
    onLeftClick?: OnClick;
    onRightClick?: OnClick;
    href?: string;
    hrefLeft?: string;
    hrefRight?: string;
    children: ReactNode;
    disabled?: boolean;
}

export const cnListButton = cn('ListButton');

const ButtonWrapperWithHover = withHover(ButtonWrapper);

class ListButtonBaseClass extends React.PureComponent<
    ListButtonProps & React.HTMLAttributes<HTMLDivElement>
> {
    renderSideIcon(side: Side) {
        const icon = side === 'left' ? this.props.iconLeft : this.props.iconRight;
        const onClick = side === 'left' ? this.props.onLeftClick : this.props.onRightClick;
        const href = side === 'left' ? this.props.hrefLeft : this.props.hrefRight;

        if (icon && !onClick && !href) {
            return <span className={cnListButton('Icon', { side })}>{icon}</span>;
        }

        return null;
    }

    renderSideButton(side: Side) {
        const icon = side === 'left' ? this.props.iconLeft : this.props.iconRight;
        const onClick = side === 'left' ? this.props.onLeftClick : this.props.onRightClick;
        const href = side === 'left' ? this.props.hrefLeft : this.props.hrefRight;

        if (onClick && icon) {
            return (
                <ButtonWrapperWithHover
                    className={cnListButton('SideButton', { side })}
                    onPress={onClick}
                >
                    {icon}
                </ButtonWrapperWithHover>
            );
        }

        if (href && icon) {
            return (
                <LinkWrapper href={href} className={cnListButton('SideButton', { side })}>
                    {icon}
                </LinkWrapper>
            );
        }

        return null;
    }

    renderContent() {
        const { children, href, onClick, disabled } = this.props;

        if (href) {
            return (
                <LinkWrapper href={href} className={cnListButton('Middle')}>
                    <Row align="center">
                        {this.renderSideIcon('left')}
                        <Col className={cnListButton('Content')}>{children}</Col>
                        {this.renderSideIcon('right')}
                    </Row>
                </LinkWrapper>
            );
        }

        if (onClick) {
            return (
                <ButtonWrapper
                    onPress={onClick}
                    className={cnListButton('Middle')}
                    disabled={disabled}
                >
                    <Row align="center">
                        {this.renderSideIcon('left')}
                        <Col className={cnListButton('Content')}>{children}</Col>
                        {this.renderSideIcon('right')}
                    </Row>
                </ButtonWrapper>
            );
        }

        return (
            <span className={cnListButton('Middle')}>
                <Row align="center">
                    {this.renderSideIcon('left')}
                    <Col className={cnListButton('Content')}>{children}</Col>
                    {this.renderSideIcon('right')}
                </Row>
            </span>
        );
    }

    render() {
        const [{ className, view, size, active }, spacerProps] = spacerMods(this.props);

        // нужно прокидывать пропсы от withHover в компонент
        const {
            view: v,
            size: s,
            active: a,
            className: cn,
            iconLeft,
            iconRight,
            onClick,
            onLeftClick,
            onRightClick,
            children,
            href,
            hrefLeft,
            hrefRight,
            ...props
        } = this.props;

        const classes = cnListButton(
            { view, size, active, noLeft: !iconLeft, noRight: !iconRight },
            [className],
        );

        return (
            <Row {...mergeProps(props, spacerProps)} className={classes}>
                {this.renderSideButton('left')}
                {this.renderContent()}
                {this.renderSideButton('right')}
            </Row>
        );
    }
}

export const ListButtonBase = withHover(ListButtonBaseClass);
