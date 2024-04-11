import send from '../../lib/send';
import { ApiResponseSuccess } from '../../types';

import { TransactionStatus } from './typings';

type CreateTransactionRequest = {
    cardId: string;
    browserData: {
        screenHeight: number;
        language: string;
        javaEnabled: boolean;
        screenWidth: number;
        windowHeight: number;
        screenColorDepth: number;
        timezone: number;
        windowWidth: number;
    };
    challengeReturnPath: string;
};

type CreateTransactionResponse = {
    transaction: {
        messageId: string;
        data: {
            threeds: {
                challengeRequest: {};
                authenticationRequest: {
                    browserData: {
                        userAgent: string;
                        acceptHeader: string;
                        language: string;
                        timezone: number;
                        javaEnabled: boolean;
                        ip: string;
                        screenWidth: number;
                        screenHeight: number;
                        windowWidth: number;
                        screenColorDepth: number;
                        windowHeight: number;
                    };
                    challengeNotificationUrl: string;
                };
                challenge_response: {};
            };
            userIp: string;
        };
        status: string;
        transactionId: string;
        cardId: string;
        reason: string;
        created: string;
        checkoutOrderId: string;
        updated: string;
        version: number;
    };
};

export type GetTransactionStatusResponse = {
    transaction: {
        status: TransactionStatus;
        version: number;
        action?: 'IFRAME';
        actionUrl?: string;
        reason?: string;
        transactionId: string;
    };
};

export function createTransaction(
    checkoutOrderId: string,
    data: CreateTransactionRequest,
): Promise<ApiResponseSuccess<CreateTransactionResponse>> {
    const url = `/api/v1/orders/${checkoutOrderId}/transactions`;

    return send.post(url, { ...data });
}

export function getTransactionStatus(
    transactionId: string,
): Promise<ApiResponseSuccess<GetTransactionStatusResponse>> {
    const url = `/api/v1/transactions/${transactionId}`;

    return send.get(url);
}
