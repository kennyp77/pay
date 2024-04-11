import { createGetter } from '@trust/utils/object';
import { getSearchParams, getSource } from '@trust/utils/url';

export const MAX_CHALLENGE_REDIRECT = 3;

const queryGetter = createGetter(getSearchParams(getSource()));

export const CHALLENGE_NUM = Number(queryGetter<string>('chn') || '0');
export const CHALLENGE_LIMIT_EXCEEDED = CHALLENGE_NUM >= MAX_CHALLENGE_REDIRECT;
