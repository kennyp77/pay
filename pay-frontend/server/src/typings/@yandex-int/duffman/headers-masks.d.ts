declare module '@yandex-int/duffman/lib/core/helpers/headers-masks' {
    type Handler = (val: string) => string;

    const Handlers: Record<string, string | Handler>;

    export default Handlers;
}
