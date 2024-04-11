declare module '*.svg' {
    const content: {
        id: string;
        viewBox: string;
    };

    export default content;
}
