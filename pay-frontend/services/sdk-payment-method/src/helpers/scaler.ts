const calcScale = (minWidth: number, minHeight: number): number => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scaleX = width / minWidth;
    const scaleY = height / minHeight;

    return Math.min(scaleX, scaleY, 1);
};

const map = new Map<string, { mw: number; mh: number; cb: Sys.CallbackFn1<number> }>();
const onResize = (): void => {
    for (const id of map.keys()) {
        const { mw, mh, cb } = map.get(id);
        const scale = calcScale(mw, mh);

        cb(scale);
    }
};

window.addEventListener('resize', onResize);

export function listenScaleChanges(
    id: string,
    minWidth: number,
    minHeight: number,
    cb: Sys.CallbackFn1<number>,
): void {
    map.set(id, { mw: minWidth, mh: minHeight, cb });

    setTimeout(onResize, 0);
}
