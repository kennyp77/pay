export interface IConnectionMessage<T> {
    readonly payload: T;
    readonly channel: string;
    readonly sourceUrl?: string;
}
