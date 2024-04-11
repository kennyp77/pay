import React, { useEffect } from 'react';

import { cn } from '@bem-react/classname';

import './index.scss';

const cnAuth3dsFrame = cn('Auth3dsFrame');

export type PaymentAuth3dsFormProps = {
    authFrameUrl: string;
    onReady: Sys.CallbackFn0;
    onComplete: Sys.CallbackFn0;
};

type Auth3DSData = {
    type: 'tds_complete';
    status: 'AUTHORIZED';
};

export const PaymentAuth3dsForm: React.FC<PaymentAuth3dsFormProps> = ({
    authFrameUrl,
    onReady,
    onComplete,
}) => {
    useEffect(() => {
        const listen = ({ data: { type } }: MessageEvent<Auth3DSData>) => {
            if (type === 'tds_complete') {
                onComplete();
            }
        };

        // TODO: Переделать на MessageConnectionListener
        window.addEventListener('message', listen);

        return () => window.removeEventListener('message', listen);
    }, [onComplete]);

    return (
        <iframe
            className={cnAuth3dsFrame()}
            onLoad={onReady}
            title="3DS"
            name="frame-3ds"
            frameBorder="0"
            scrolling="auto"
            data-label="3ds--frame"
            src={authFrameUrl}
        />
    );
};
