import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { METRIKA_SESSION_ID } from '../../config';
import { AppError } from '../../typings';
import { Button } from '../button';
import { Col } from '../col';
import { Icon } from '../icons';
import { PanelHeader } from '../panel';
import { PayLogo } from '../pay-logo';
import { Row } from '../row';
import { Text } from '../text';

import ErrorIcon from './assets/error.svg';

import './styles.scss';

export const cnErrorBase = cn('ErrorBase');

export interface ErrorBaseProps extends IClassNameProps {
    action?: AppError['action'];
    message?: AppError['message'];
    description?: AppError['description'];
    actionText?: AppError['actionText'];
    useActionButton?: AppError['useActionButton'];
    closeHref?: string;
    closeAction?: Sys.CallbackFn0;
}

const i18n = (v: string) => v;

const DEFAULT_MESSAGE = i18n('Произошла ошибка');
const DEFAULT_ACTION_TEXT = i18n('Закрыть');

const forSupportLabel = i18n('Для службы поддержки:');

export function ErrorBase({
    action,
    actionText,
    useActionButton,
    message,
    description,
    closeHref,
    closeAction,
}: ErrorBaseProps): JSX.Element {
    return (
        <Col className={cnErrorBase()}>
            <Row all="m">
                <PanelHeader
                    title={<PayLogo />}
                    titleAlign="left"
                    closeHref={closeHref}
                    closeAction={closeAction}
                />
            </Row>

            <Col left="l" right="l" top="m" bottom="xl">
                <Row justify="center" bottom="xl">
                    <Icon svg={ErrorIcon} className={cnErrorBase('ErrorIcon')} />
                </Row>

                <Text align="center" variant="header-m" bottom="xl">
                    {message ? i18n(message) : DEFAULT_MESSAGE}
                </Text>

                {description ? (
                    <Text align="center" color="grey" bottom="3xl">
                        {i18n(description)}
                    </Text>
                ) : null}

                {METRIKA_SESSION_ID ? (
                    <React.Fragment>
                        <Text align="center" color="black" variant="s" bottom="xs">
                            {forSupportLabel}
                        </Text>
                        <Text
                            className={cnErrorBase('SupportCode')}
                            align="center"
                            color="grey"
                            variant="s"
                            bottom="xl"
                        >
                            {METRIKA_SESSION_ID}
                        </Text>
                    </React.Fragment>
                ) : null}

                {action && (
                    <Button
                        size="l"
                        view={useActionButton ? 'action' : 'default'}
                        pin="round-m"
                        onClick={action}
                    >
                        {actionText ? i18n(actionText) : DEFAULT_ACTION_TEXT}
                    </Button>
                )}
            </Col>
        </Col>
    );
}
