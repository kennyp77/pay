/* eslint-disable @typescript-eslint/no-explicit-any */
import { Draft } from 'immer';
import { Action, AnyAction } from 'redux';

export type ReduxAction<Output> = { payload: Output } & AnyAction;

export type ReduxAnyAction<StateSchema, Output> = ReduxAction<StateSchema> | ServiceAction<StateSchema, Output>;

export interface ServiceAction<StateSchema, Output> {
    (options: ServiceActionOptions<StateSchema>): Output;

    __service: true;
}

export interface ServiceActionOptions<StateSchema> {
    dispatch: ServiceDispatch<StateSchema>;

    getState(): StateSchema;

    setState(recipe: (draft: Draft<StateSchema>) => StateSchema | void | undefined, type?: string): void;

    logService(name: string, input: unknown): void;

    subscribe(callback: () => void): () => void;
}

export type ServiceCallback<StateSchema, Input extends any[], Output> = (
    options: ServiceActionOptions<StateSchema>,
    ...data: Input
) => Output;

export interface ServiceCreator<StateSchema, Input extends any[], Output> {
    (...data: Input): ServiceAction<StateSchema, Output>;
}

export interface Store<StateSchema> {
    dispatch: ServiceDispatch<StateSchema>;

    getState(): StateSchema;

    subscribe(callback: () => void): () => void;
}

export interface ServiceDispatch<StateSchema> {
    <TReturnType>(serviceAction: ServiceAction<StateSchema, TReturnType>): TReturnType;

    <A extends Action>(action: A): A;

    // This overload is the union of the two above
    <TReturnType, TAction extends Action>(action: TAction | ServiceAction<StateSchema, TReturnType>):
        | TAction
        | TReturnType;
}
