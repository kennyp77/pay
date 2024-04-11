import * as Sdk from '@yandex-pay/sdk/src/typings';

export function amountSum(amountA: number | Sdk.Price, amountB: number | Sdk.Price): Sdk.Price {
    return (Number(amountA) + Number(amountB)).toFixed(2);
}

export function amountMul(amountA: number | Sdk.Price, amountB: number | Sdk.Price): Sdk.Price {
    return (Number(amountA) * Number(amountB)).toFixed(2);
}
