import send from '../lib/send';
import { ApiResponse } from '../types';

interface Acceptance {
    accepted: boolean;
}

export function loadAcceptance(): Promise<ApiResponse<Acceptance>> {
    const url = '/api/v1/tokenization/acceptance';

    return send.get(url);
}

export function updateAcceptance(): Promise<ApiResponse<Acceptance>> {
    const url = '/api/v1/tokenization/acceptance';

    return send.post(url);
}
