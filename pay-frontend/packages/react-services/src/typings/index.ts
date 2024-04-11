import { Draft } from 'immer';
import { AnyAction, Reducer, Dispatch } from 'redux';

export type ServiceUpdatePayload<StateSchema> = StateSchema extends (...args: any[]) => any
    ? (draft: StateSchema) => StateSchema
    : StateSchema;

export type ReduxAction<StateSchema> = { payload: StateSchema } & AnyAction;

export type ReduxReducer<StateSchema> = Reducer<StateSchema, ReduxAction<StateSchema>>;

export type ReduxAnyAction<StateSchema> = ReduxAction<StateSchema> | ServiceAction<StateSchema>;

export interface ServiceAction<StateSchema> {
    type: string;
    payloadFn: ServiceActionPayloadFn<StateSchema>;
}

interface ServiceStore<StateSchema> {
    // TODO: Исправить тайпинг, делать честный возврат результата,
    //       например Promise
    dispatch: Dispatch;

    getState(): StateSchema;

    setState(state: StateSchema): void;

    produce(recipe: (state: Draft<StateSchema>) => StateSchema | void | undefined): void;
}

interface ServiceActionPayloadFn<StateSchema> {
    (store: ServiceStore<StateSchema>): unknown;
}

export type ServiceCallback<StateSchema, Input extends any[] = any[]> = (
    store: ServiceStore<StateSchema>,
    ...data: Input
) => unknown;

export interface ServiceFn<StateSchema, Input extends any[] = any[]> {
    (...data: Input): ServiceAction<StateSchema>;
}
