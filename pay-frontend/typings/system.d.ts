declare namespace Sys {
    export type CallbackFn0<R = void> = () => R;
    export type CallbackFn1<A1 = void, R = void> = (a1: A1) => R;
    export type CallbackFn2<A1 = void, A2 = void, R = void> = (a1: A1, a2: A2) => R;

    export type YaEnv = 'prod' | 'test' | 'dev';

    type Return<T> = T extends Promise<infer U>
        ? U
        : T extends (...args: any) => Promise<infer U>
        ? U
        : T extends (...args: any) => infer U
        ? U
        : T;

    type Args<T extends (...args: any) => any> = Parameters<T>;
    type Arg1<T extends (...args: any) => any> = Args<T>[0];
    type Arg2<T extends (...args: any) => any> = Args<T>[1];

    type UnionKeys<T> = T extends T ? keyof T : never;
    type StrictUnionHelper<T, TAll> = T extends any
        ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, undefined>>
        : never;
    export type StrictUnion<T> = StrictUnionHelper<T, T>;
}
