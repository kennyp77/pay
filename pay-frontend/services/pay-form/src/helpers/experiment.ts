import { FlagValue, isExpFlagEnabled } from '@trust/utils/experiment';

import { EXPERIMENT } from '../config';

export const hasExp = (name: string, checkValue?: FlagValue): boolean => isExpFlagEnabled(EXPERIMENT, name, checkValue);
