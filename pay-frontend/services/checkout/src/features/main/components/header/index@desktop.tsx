import React from 'react';

import { cn } from '@bem-react/classname';

import { Box } from '../../../../components/box';
import { PassportUser } from '../../../../components/passport-user';
import { PayLogo } from '../../../../components/pay-logo';
import { Row } from '../../../../components/row';

import './styles.scss';

const cnMainHeader = cn('MainHeader');

export function MainHeader(): JSX.Element {
    return (
        <Row justify="between" className={cnMainHeader()}>
            <Box right="m" shrink>
                <PayLogo />
            </Box>

            <Row.Spacer />

            <PassportUser />
        </Row>
    );
}
