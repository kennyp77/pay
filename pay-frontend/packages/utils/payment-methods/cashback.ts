import { PaymentCashback } from './typings';

export const hasCashback = (cashback: PaymentCashback): boolean => Boolean(cashback) && Number(cashback.amount) !== 0;
