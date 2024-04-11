interface SuccessResponse {
    status: 'success';
    data: any;
}

interface FailureResponse {
    status: 'fail';
    code: number;
    data: {
        message: string;
        description?: string;
    };
}

export function renderJSON(code: number, status: 'fail', data: string): FailureResponse;
export function renderJSON(code: number, status: 'success', data: Record<string, any>): SuccessResponse;
export function renderJSON(code: number, status: string, data: any): any {
    if (status === 'success') {
        return { code, status, data };
    }

    return { code, status: 'fail', data: { message: data } };
}
