import { count, goal, _key, _params, MetrikaCounter } from './utils';

type Checkout3ds = MetrikaCounter<{ state: 'start' | 'ready' | 'complete' | 'cancel' }>;

export const checkout3ds = <Checkout3ds>count('checkout_3ds');
