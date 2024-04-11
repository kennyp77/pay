/* eslint-disable @typescript-eslint/class-name-casing, max-classes-per-file */

declare module '@yandex-int/duffman/lib/helpers/errors' {
    export class EXTERNAL_ERROR extends Error {
        constructor(data: Record<any, any>): EXTERNAL_ERROR;
    }

    export class HTTP_ERROR extends Error {
        constructor(res: any): EXTERNAL_ERROR;
    }
}
