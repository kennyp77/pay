import compose from '@tinkoff/utils/function/compose';
import isEqual from '@tinkoff/utils/is/equal';
import get from '@tinkoff/utils/object/path';
import { useDispatch, useSelector } from 'react-redux';
import { O } from 'ts-toolbelt';

import { State } from 'store/state';

import { setValue } from '../store/services';

export function useValue<P extends O.Paths<State>, Value = O.Path<State, P>>(path: P) {
    return useSelector<State>((state) => get(path, state), isEqual) as Value;
}

export function useSetValue<P extends O.Paths<State>, Value = O.Path<State, P>>(path: P) {
    const dispatch = useDispatch();

    return (value: Value) => compose(dispatch, setValue(path))(value);
}
