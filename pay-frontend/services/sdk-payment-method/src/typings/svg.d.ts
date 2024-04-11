declare module '*.svg' {
    interface SVGMeta {
        id: string;
        viewBox: string;
    }

    const content: SVGMeta;

    export default content;
}
