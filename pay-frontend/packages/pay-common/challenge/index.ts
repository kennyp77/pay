import pathOr from '@tinkoff/utils/object/pathOr';
import { setSearchParams } from '@trust/utils/url';

import { CHALLENGE_NUM } from '../config';

export const getChallengeReturnPath = (cardId: string): string => {
    return setSearchParams(window.location.href, {
        chn: String(CHALLENGE_NUM + 1),
        chnCardId: cardId,
    });
};

export const getChallengeParams = (data: any): [boolean, string] => {
    const isChallengeRequired =
        pathOr(['response', 'data', 'message'], '', data) === 'CHALLENGE_REQUIRED';
    const redirectPath = pathOr(['response', 'data', 'params', 'challengeUrl'], '', data);

    return [isChallengeRequired, redirectPath];
};
