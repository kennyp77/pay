import { FlagValue, isExpFlagEnabled, getExpFlag } from '@trust/utils/experiment';

import { EXPERIMENT } from '../config';

export const hasExp = (name: string, checkValue?: FlagValue): boolean =>
    isExpFlagEnabled(EXPERIMENT, name, checkValue);

export const getExpValue = <T>(name: string): T => getExpFlag<T>(EXPERIMENT, name);
