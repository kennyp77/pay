import { O } from 'ts-toolbelt';

import { State } from 'store/state';

import { useValue, useSetValue } from './use-store';

export function useAvailableOptions<
    P extends O.Paths<State['availableOptions']>,
    Value = O.Path<State['availableOptions'], P>,
>(path: P): Value {
    return useValue(['availableOptions', ...path]);
}

export function useOption<P extends O.Paths<State['options']>, Value = O.Path<State['options'], P>>(
    path: P,
): [Value, (value: Value) => void] {
    return [useValue(['options', ...path]), useSetValue(['options', ...path])];
}
