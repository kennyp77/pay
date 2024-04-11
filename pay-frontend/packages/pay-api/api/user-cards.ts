import { FetchOptions } from '@trust/fetch';

import send from '../lib/send';
import { ApiResponseSuccess } from '../types';

interface UserCardResponse {
    id: string;
    uid: number;
    last4: string;
    cardNetwork: string;
    issuerBank: string;
}

export interface UserCardsResponse {
    cards: Array<UserCardResponse>;
}

export function loadUserCards(): Promise<ApiResponseSuccess<UserCardsResponse>> {
    const url = '/api/v1/user_cards';

    return send.get(url);
}

export function syncUserCard(
    cardId: string,
    options: { polling?: boolean } = {},
): Promise<ApiResponseSuccess<UserCardResponse>> {
    const url = '/api/v1/sync_user_card';
    const opt: FetchOptions = {};

    if (options.polling) {
        // Роняем запрос если статус не 200
        opt.errorByStatus = (status: number) => status !== 200;
        // Ретраим запрос если статус не 200
        opt.retry = {
            limit: 5,
            statuses: (status: number) => status !== 200,
        };
    }

    return send.post(url, { cardId }, opt);
}
