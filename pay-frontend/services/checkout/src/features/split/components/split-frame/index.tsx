import React, { useEffect, useState } from 'react';

import { cn } from '@bem-react/classname';
import { logError, timeStart, timeEnd } from '@trust/rum';
import { dom } from '@trust/utils/dom';

import { SplitConnection, SplitErrorType, SplitMessageType } from 'lib/intercom/split';

import './index.scss';

const cnSplitFrame = cn('SplitFrame');

enum RUM_DELTA_NAMES {
    SplitFrameActive = 'split.frame.active',
}

interface SplitFrameProps {
    splitFrameUrl: Checkout.SplitFrameUrl;
    onFrameReady: () => void;
    onFrameError: () => void;
    onSuccess: () => void;
    onError: (reason?: SplitErrorType) => void;
    onCancel: () => void;
}

export const SplitFrame: React.FC<SplitFrameProps> = React.memo(
    ({ splitFrameUrl, onSuccess, onError, onCancel, onFrameReady, onFrameError }) => {
        const [height, setHeight] = useState<'auto' | number>('auto');

        useEffect(() => {
            timeStart(RUM_DELTA_NAMES.SplitFrameActive);

            const timeEndSplit = () =>
                timeEnd(RUM_DELTA_NAMES.SplitFrameActive, { url: splitFrameUrl });

            const offFnList = [
                dom.on(window, 'unload', timeEndSplit),
                dom.on(window, 'beforeunload', timeEndSplit),
            ];

            return () => {
                offFnList.forEach((fn) => fn());
                timeEndSplit();
            };
        }, [splitFrameUrl]);

        useEffect(() => {
            return SplitConnection.getInstance().on(SplitMessageType.Loaded, onFrameReady);
        }, [onFrameReady]);

        useEffect(() => {
            return SplitConnection.getInstance().on(SplitMessageType.Resize, (e) => {
                if (e?.height) {
                    setHeight(e.height);
                }
            });
        }, [setHeight]);

        useEffect(() => {
            return SplitConnection.getInstance().on(SplitMessageType.Success, onSuccess);
        }, [onSuccess]);

        useEffect(() => {
            return SplitConnection.getInstance().on(SplitMessageType.Error, (e) => {
                logError('Split error', new Error(e?.reason || 'Unknown reason'));
                onError(e?.reason);
            });
        }, [onError]);

        useEffect(() => {
            return SplitConnection.getInstance().on(SplitMessageType.Cancel, onCancel);
        }, [onCancel]);

        return (
            <div className={cnSplitFrame()}>
                <iframe
                    src={splitFrameUrl}
                    onError={onFrameError}
                    title="Yandex.Split"
                    name="split-frame"
                    frameBorder="0"
                    scrolling="auto"
                    data-label="split-frame"
                    style={{ height: height > 0 ? height : 'auto' }}
                />
            </div>
        );
    },
);
