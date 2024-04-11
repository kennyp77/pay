import React, { useContext, useCallback, useRef, useState } from 'react';

import throttleEnd from '@tinkoff/utils/function/throttleEnd';
import toPairs from '@tinkoff/utils/object/toPairs';
import { block } from 'bem-cn';

import { scenarioContext } from '../../../../store/scenario';

import './index.css';

const b = block('scenario');

export function Scenario(): JSX.Element {
    const sheetRef = useRef<HTMLTextAreaElement>();
    const scenario = useContext(scenarioContext);
    const [disabled, setDisabled] = useState(false);

    const changeSheet = useCallback(
        throttleEnd(200, () => {
            try {
                JSON.parse(sheetRef.current.value);
                setDisabled(false);
            } catch (err) {
                setDisabled(true);
            }
        }),
        [sheetRef],
    );

    const updateSheet = useCallback(() => {
        try {
            if (sheetRef.current) {
                scenario.replaceSheet(JSON.parse(sheetRef.current.value));
            }
        } catch (err) {
            alert('Invalid JSON');
        }
    }, [sheetRef, scenario]);

    const updateShipping = useCallback(
        (event) => scenario.selectShipping(event.target.value),
        [scenario],
    );

    return (
        <div className={b()}>
            <div className={b('shipping')}>
                <span>{'Варианты доставки '}</span>
                <select onChange={updateShipping} value={scenario.shipping.activeId}>
                    {toPairs(scenario.shipping.list).map(([shippingId]) => (
                        <option key={shippingId} value={shippingId}>
                            {shippingId}
                        </option>
                    ))}
                </select>
            </div>

            <div className={b('apply')}>
                <button type="button" disabled={disabled} onClick={updateSheet}>
                    Apply
                </button>
                {disabled && <span>Invalid JSON</span>}
            </div>

            <textarea
                ref={sheetRef}
                defaultValue={JSON.stringify(scenario.sheet.data, null, 2)}
                onChange={changeSheet}
            />
        </div>
    );
}
