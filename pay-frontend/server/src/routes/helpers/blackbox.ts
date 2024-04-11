import _get from 'lodash/get';
import _has from 'lodash/has';

import config from '../../configs';

export const getUID = (blackbox?: ExpressBlackbox.PassportUser): string =>
    _get(blackbox, ['uid'], '') as string;

export const getLogin = (blackbox?: ExpressBlackbox.PassportUser): string =>
    _get(blackbox, ['login'], '');

export const getRawLogin = (blackbox?: ExpressBlackbox.PassportUser): string =>
    _get(blackbox, ['raw', 'login'], '');

export const getUserEmail = (blackbox?: ExpressBlackbox.PassportUser): string =>
    _get(blackbox, ['raw', 'address-list', '0', 'address'], '');

export const getUserFirstName = (blackbox?: ExpressBlackbox.PassportUser): string =>
    _get(blackbox, ['firstName'], '');

export const getUserLastName = (blackbox?: ExpressBlackbox.PassportUser): string =>
    _get(blackbox, ['lastName'], '');

export const getUserFullName = (blackbox?: ExpressBlackbox.PassportUser): string => {
    const lastName = getUserLastName(blackbox);
    const firstName = getUserFirstName(blackbox);
    const fullName = [];

    if (lastName) {
        fullName.push(lastName);
    }

    if (firstName) {
        fullName.push(firstName);
    }

    return fullName.join(' ');
};

export const hasUserPhone = (blackbox?: ExpressBlackbox.PassportUser): boolean => {
    // Нейминг параметров (is_confirmed) задается в middleware
    return _get(blackbox, ['phones'], []).some((phone) => phone.is_confirmed === '1');
};

export const hasAvatar = (blackbox?: ExpressBlackbox.PassportUser): boolean => {
    return _has(blackbox, ['avatar', 'empty']) && !_get(blackbox, ['avatar', 'empty'], false);
};

export const getAvatarId = (blackbox?: ExpressBlackbox.PassportUser): string => {
    return _has(blackbox, ['avatar', 'default']) ? _get(blackbox, ['avatar', 'default'], '') : '';
};

export const getAvatarURL = (avatarId: string, isRetina = true): string =>
    `${config.avatarUrl}/get-yapic/${avatarId}/${
        isRetina ? 'islands-retina-middle' : 'islands-middle'
    }`;

export const isStaffAccount = (blackbox: ExpressBlackbox.PassportUser): boolean => {
    return _has(blackbox, ['raw', 'aliases', '13']);
};
