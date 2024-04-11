import React from 'react';

import { Box } from '../../box';
import { Icon } from '../../icons';
import { LinkWrapper } from '../../link-wrapper';
import { PassportUser } from '../../passport-user';
import { PayLogo } from '../../pay-logo';
import { Row } from '../../row';
import { Text } from '../../text';

import BackIcon from './assets/back.svg';
import { PanelHeaderObProps } from './onboarding';

export function PanelHeaderOb({ step, title, backHref }: PanelHeaderObProps) {
    return (
        <Box>
            <Row>
                {backHref ? (
                    <LinkWrapper href={backHref}>
                        <Icon svg={BackIcon} size="m" />
                    </LinkWrapper>
                ) : (
                    <PayLogo />
                )}
                <Row.Spacer />
                <PassportUser />
            </Row>
            {step ? (
                <Text variant="s" color="grey" align="left" top="l">
                    {`Шаг ${step[0]} из ${step[1]}`}
                </Text>
            ) : null}
            <Text variant="header-l" align="left" top="2xs">
                {title}
            </Text>
        </Box>
    );
}
