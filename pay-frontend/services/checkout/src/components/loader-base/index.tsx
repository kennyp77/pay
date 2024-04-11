import React from 'react';

import { Col } from '../col';
import { Loader } from '../loader';
import { PayLogo } from '../pay-logo';
import { Row } from '../row';
import { Text } from '../text';

export interface LoaderScreenProps {
    message: string;
    description?: string;
}

const i18n = (v: string) => v;

export function LoaderBase({ message, description }: LoaderScreenProps) {
    return (
        <React.Fragment>
            <Row all="m">
                <PayLogo />
            </Row>

            <Loader progress position="center" size="l">
                <div>
                    <Col left="l" right="l" top="l">
                        <Text align="center" variant="header-m">
                            {i18n(message)}
                        </Text>

                        {description && (
                            <Text align="center" color="grey" top="m">
                                {i18n(description)}
                            </Text>
                        )}
                    </Col>
                </div>
            </Loader>
        </React.Fragment>
    );
}
