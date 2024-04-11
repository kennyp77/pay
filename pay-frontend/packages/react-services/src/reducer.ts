import { SERVICE_ACTION } from './constants';
import { ReduxAction, ReduxReducer } from './typings';

const defaultAction = {} as ReduxAction<any>;

export function createServiceReducer<StateSchema>(
    initialServiceStore: StateSchema,
    nestedReducer?: ReduxReducer<StateSchema>,
) {
    const reducer: ReduxReducer<StateSchema> = (
        state = initialServiceStore,
        action = defaultAction,
    ) => {
        const nextState =
            (action.type as string).startsWith(SERVICE_ACTION) && action.payload
                ? action.payload
                : state;

        if (nestedReducer) {
            return {
                ...nextState,
                ...nestedReducer(nextState, action),
            };
        }

        return nextState;
    };

    return reducer;
}
