import { Req } from '../../typings/common';

export const isAndroidWebView = (userAgent: string): boolean => {
    // https://stackoverflow.com/questions/31848320/detect-android-webview/64779190#64779190
    return /Android/i.test(userAgent) && /Version\d+.*\d+.0.0.0 Mobile|; ?wv/i.test(userAgent);
};

export const isIOSWebview = (userAgent: string): boolean => {
    const isSafari = /safari/i.test(userAgent);
    const isIOS = /iphone|ipod|ipad/i.test(userAgent);

    return isIOS && !isSafari;
};

export const getIsWebView = (req: Req): boolean => {
    const ua = req.get('User-Agent');

    return isAndroidWebView(ua) || isIOSWebview(ua);
};
