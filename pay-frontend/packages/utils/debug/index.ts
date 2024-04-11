type DebugFn = (level: string) => (info: string, ...args: any) => void;

let debug: DebugFn = () => () => {
    /* Empty debug function in prod  */
};

if (__DEV__) {
    debug = require('debug/src/browser');

    const urlSearchParams = new URLSearchParams(window.location.search);

    // @ts-ignore
    debug.disable('*');

    const ns = urlSearchParams.get('debug');
    if (ns) {
        ns.split(',').forEach((n) => {
            // @ts-ignore
            debug.enable(n);
        });
    }
}

export { debug };
