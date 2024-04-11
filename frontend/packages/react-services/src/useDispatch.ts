import { useStore } from 'react-redux';

import { ServiceDispatch } from './types';

export function useDispatch<StateSchema>(): ServiceDispatch<StateSchema> {
    const store = useStore();

    return store.dispatch;
}
