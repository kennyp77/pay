export const isInFrame = () => {
    if (!window) {
        return false;
    }

    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};
