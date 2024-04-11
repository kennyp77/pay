import { isTouch } from '@trust/utils/helpers/platform';

export const getWindowOpener = (): WindowProxy => window.top.opener;

export const isOpenerClosed = (): boolean => Boolean(getWindowOpener().closed);

export const closeWindow = (): void => {
    window.close();
};

export const isLandscape = (): boolean => {
    const { screen, innerWidth, innerHeight } = window;
    const orientation = (screen.orientation || {}).type;

    return orientation ? `${orientation}`.includes('landscape') : innerWidth > innerHeight;
};

export const isScreenLessThan = (minDesktopSize: number): boolean => {
    const touch = isTouch();
    const landscape = isLandscape();

    return (
        (touch && !landscape && window.innerWidth < minDesktopSize) ||
        (touch && landscape && window.innerHeight < minDesktopSize)
    );
};
