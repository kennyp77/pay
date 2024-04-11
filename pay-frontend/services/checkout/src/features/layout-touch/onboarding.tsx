import React, { ReactNode } from 'react';

import { Box } from '../../components/box';
import { Button } from '../../components/button';
import { Col } from '../../components/col';
import { Row } from '../../components/row';
import { Text } from '../../components/text';

interface OnboardingLayoutProps {
    title: ReactNode;
    step?: Readonly<[number, number]>;
    onBack?: Sys.CallbackFn0;
    rightBlock?: ReactNode;
    children: ReactNode;
}

const TOP_CONTROLS_WIDTH = 50;

export function ObLayout({ step, title, onBack, rightBlock, children }: OnboardingLayoutProps): JSX.Element {
    return (
        <Col>
            <Row>
                <Box style={{ width: TOP_CONTROLS_WIDTH }}>
                    {onBack ? (
                        <Button view="clear" size="s" onClick={onBack}>
                            {'<'}
                        </Button>
                    ) : null}
                </Box>
                <Box>
                    {step ? (
                        <Text variant="s" color="grey" align="center">
                            {`Шаг ${step[0]} из ${step[1]}`}
                        </Text>
                    ) : null}
                    <Text variant="header-s" align="center">
                        {title}
                    </Text>
                </Box>
                <Box style={{ width: TOP_CONTROLS_WIDTH }}>{rightBlock || null}</Box>
            </Row>
            <Box>{children}</Box>
        </Col>
    );
}
