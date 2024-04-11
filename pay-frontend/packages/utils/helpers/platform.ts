export const isTouch = (): boolean => {
    try {
        document.createEvent('TouchEvent');

        return true;
    } catch (err) {
        return false;
    }
};

export const isAndroidWebView = (userAgent: string): boolean => {
    // https://stackoverflow.com/questions/31848320/detect-android-webview/64779190#64779190
    // https://st.yandex-team.ru/YANDEXPAY-3457#6203a8ef05fc135f4532b19e
    return (
        /Android/i.test(userAgent) && /Version\d+.*\d+.0.0.0 Mobile|; ?wv|WebView/i.test(userAgent)
    );
};

export const isIOSWebview = (userAgent: string): boolean => {
    const isSafari = /safari/i.test(userAgent);
    const isIOS = /iphone|ipod|ipad/i.test(userAgent);

    return isIOS && !isSafari;
};
