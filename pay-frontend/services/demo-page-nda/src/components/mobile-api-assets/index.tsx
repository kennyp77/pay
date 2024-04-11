import React, { useCallback, useEffect, useState } from 'react';

import { Text } from '@yandex-lego/components/Text/desktop/bundle';
import { block } from 'bem-cn';

import './index.css';

const b = block('mobile-api-assets');

export function MobileApiAssets(): JSX.Element {
    const [rawJson, setRawJson] = useState({});
    const [icons, setIcons] = useState<Array<[string, string]>>([]);

    const getIcons = useCallback(async () => {
        const res = await fetch('/web/api/mobile/v1/bank_logos');
        const iconsJson = await res.json();

        setRawJson(iconsJson);
        setIcons(Object.entries(iconsJson));
    }, [setRawJson, setIcons]);

    useEffect(() => {
        getIcons();
    }, [getIcons]);

    return (
        <div className={b()}>
            <Text className={b('title').toString()} as="h2" typography="headline-l" weight="bold">
                JSON
            </Text>

            <span className={b('json')}>{JSON.stringify(rawJson, null, 2)}</span>

            <ul className={b('list')}>
                {icons.map(([issuer, src]) => (
                    <li key={issuer} className={b('item')}>
                        <hr />

                        <Text className={b('item-title').toString()} typography="headline-s">
                            {`issuer: ${issuer}`}
                        </Text>
                        <img className={b('item-icon')} src={src} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
