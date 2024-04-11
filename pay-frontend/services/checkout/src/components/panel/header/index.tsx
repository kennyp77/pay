import React, { ReactNode } from 'react';

import { cn } from '@bem-react/classname';

import { withHover } from '../../../hocs/withHover';
import { Box } from '../../box';
import { ButtonWrapper } from '../../button-wrapper';
import { Icon } from '../../icons';
import { LinkWrapper } from '../../link-wrapper';
import { Row } from '../../row';
import { Text } from '../../text';

import BackIcon from './assets/back.svg';
import CrossIcon from './assets/cross.svg';
import TrashIcon from './assets/trash.svg';

import './styles.scss';

interface PanelHeaderProps {
    title?: ReactNode;
    titleAlign?: 'left' | 'center' | 'right';
    backHref?: string;
    closeHref?: string;
    deleteAction?: Sys.CallbackFn0;
    closeAction?: Sys.CallbackFn0;
}

export const cnPanelHeader = cn('PanelHeader');

const ButtonWrapperWithHover = withHover(ButtonWrapper);

export function PanelHeader({
    title,
    titleAlign = 'center',
    backHref,
    closeHref,
    deleteAction,
    closeAction,
}: PanelHeaderProps) {
    return (
        <Row className={cnPanelHeader()}>
            {backHref ? (
                <LinkWrapper href={backHref} className={cnPanelHeader('Back')}>
                    <Icon svg={BackIcon} size="m" />
                </LinkWrapper>
            ) : null}
            <Box>
                <Text variant="header-m" align={titleAlign}>
                    {title}
                </Text>
            </Box>
            {closeHref ? (
                <LinkWrapper href={closeHref} className={cnPanelHeader('Close')}>
                    <Icon svg={CrossIcon} size="m" />
                </LinkWrapper>
            ) : null}
            {closeAction ? (
                <ButtonWrapper onClick={closeAction} className={cnPanelHeader('Close')}>
                    <Icon svg={CrossIcon} size="m" />
                </ButtonWrapper>
            ) : null}
            {deleteAction && !closeHref ? (
                <ButtonWrapperWithHover onClick={deleteAction} className={cnPanelHeader('Delete')}>
                    <Icon svg={TrashIcon} size="m" />
                </ButtonWrapperWithHover>
            ) : null}
        </Row>
    );
}
