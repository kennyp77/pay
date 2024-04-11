export function isTest(): boolean {
    const { origin } = window.location;

    if (__DEV__) {
        return true;
    }

    return origin === 'https://test.pay.yandex.ru';
}
