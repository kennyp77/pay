import React from 'react';

import { Text } from '../text';

const i18n = (v: string) => v;

export function ObDisclaimerText() {
    return (
        <Text variant="s" top="s" color="grey" align="center" style={{ marginBottom: '-8px' }}>
            {i18n('Договор заключается непосредственно с продавцом')}
        </Text>
    );
}
