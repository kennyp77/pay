import React, { useState, useRef, useEffect, useMemo } from 'react';

import { Range } from 'components/range';

import { getFromSessionStorage, setToSessionStorage } from '../../lib/session-storage';
import { Toggle } from '../toggle';

interface ButtonSizeProps {
    saveLocal?: true;
}

const storageKey = 'buttons-width-settings';

export function ButtonSize({ saveLocal }: ButtonSizeProps) {
    const styleRef1 = useRef<HTMLStyleElement>(null);
    const styleRef2 = useRef<HTMLStyleElement>(null);

    const initialState = useMemo(() => {
        let state = {
            enabled: false,
            hideFrame: false,
            height: 54,
            width: 320,
            radius: 8,
        };

        if (saveLocal) {
            state = getFromSessionStorage(storageKey, state);
        }

        return state;
    }, [saveLocal]);

    const [enabled, setEnabled] = useState(initialState.enabled);
    const [hideFrame, setHideFrame] = useState(initialState.hideFrame);
    const [height, setHeight] = useState(initialState.height);
    const [width, setWidth] = useState(initialState.width);
    const [radius, setRadius] = useState(initialState.radius);

    useEffect(() => {
        if (saveLocal) {
            setToSessionStorage(storageKey, {
                enabled,
                hideFrame,
                height,
                width,
                radius,
            });
        }
    }, [enabled, height, width, radius, hideFrame, saveLocal]);

    useEffect(() => {
        if (styleRef1.current) {
            styleRef1.current.innerText = enabled
                ? `.ya-pay-button{ width: ${width}px !important; height: ${height}px !important; border-radius: ${radius}px !important;`
                : '';
        }
    }, [enabled, height, width, radius]);

    useEffect(() => {
        if (styleRef2.current) {
            styleRef2.current.innerText = hideFrame
                ? `.ya-pay-button iframe { height: 0 !important; }`
                : '';
        }
    }, [hideFrame]);

    return (
        <div className="flex w-2/3 flex-col gap-y-2">
            <div className="w-full flex items-center">
                <Toggle checked={enabled} onChange={setEnabled} />

                <span className="ml-4 mr-2">0 frame</span>
                <Toggle checked={hideFrame} onChange={setHideFrame} />
            </div>
            <div className="w-full flex items-center">
                <span className="tabular-nums mr-2">{width}</span>
                <Range name="buttonWidth" value={width} min={150} max={500} onChange={setWidth} />
            </div>
            <div className="w-full flex items-center">
                <span className="tabular-nums mr-2">{height}</span>
                <Range name="buttonHeight" value={height} min={40} max={64} onChange={setHeight} />
            </div>
            <div className="w-full flex items-center">
                <span className="tabular-nums mr-2">{radius}</span>
                <Range name="borderRadius" value={radius} min={0} max={35} onChange={setRadius} />
            </div>
            <style type="text/css" ref={styleRef1} />
            <style type="text/css" ref={styleRef2} />
        </div>
    );
}
