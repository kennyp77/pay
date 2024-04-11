import React from 'react';

import { Loader } from 'components/loader';
import { Text } from 'components/text';

interface PaymentLoaderProps {
    progress?: boolean;
    title: string | React.ReactNode;
    message: string | React.ReactNode;
}

export const PaymentLoader = ({ progress, title, message }: PaymentLoaderProps) => {
    return (
        <Loader progress={progress} fill="white" position="center" size="l">
            <Text align="center" top="m" variant="s">
                {title}
            </Text>
            <Text align="center" top="2xs" variant="header-s">
                {message}
            </Text>
        </Loader>
    );
};
