export function amountDiv(amountA: number | string, n: number | string): string {
    return (Number(amountA) / Number(n)).toFixed(2);
}

export function amountSum(amountA: number | string, amountB: number | string): string {
    return (Number(amountA) + Number(amountB)).toFixed(2);
}

export function amountMul(amountA: number | string, amountB: number | string): string {
    return (Number(amountA) * Number(amountB)).toFixed(2);
}
