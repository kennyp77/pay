type BrowserData = {
    screenColorDepth: number;
    screenHeight: number;
    screenWidth: number;
    windowHeight: number;
    windowWidth: number;
    language: string;
    javaEnabled: boolean;
    timezone: number;
};

export const getBrowserData = (): BrowserData => {
    return {
        screenColorDepth: window.screen.colorDepth,
        screenHeight: window.screen.height,
        screenWidth: window.screen.width,
        windowHeight: window.outerHeight,
        windowWidth: window.outerWidth,
        language: navigator.language,
        javaEnabled: Boolean(navigator.javaEnabled && navigator.javaEnabled()),
        timezone: new Date().getTimezoneOffset(),
    };
};
