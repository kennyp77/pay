import _get from 'lodash/get';

import { Bunker } from '../../typings/common';

export const getFeatureStatus = (bunker: Bunker, feature: string) =>
    _get(bunker, ['features', feature, 'status']);

export const getDisabledInWebviewMerchants = (
    bunker: Bunker,
): Bunker['status']['disabled_in_webview'] => _get(bunker, ['status', 'disabled_in_webview']);
