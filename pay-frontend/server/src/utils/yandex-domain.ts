const DOMAIN_RX =
    /\.(yandex\.(?:com\.am|az|com|ee|fr|com\.ge|co\.il|kg|lt|lv|md|tj|tm|uz|ru|ua|by|kz|com|com\.tr)|yandex-team\.ru)$/;

/**
 * Возвращает яндекс-домен
 * @examples
 * getYandexDomain('mail.yandex.com.tr') // -> yandex.com.tr
 */
export function getYandexDomain(host: string): string {
    const domainParse = DOMAIN_RX.exec(host);
    if (domainParse) {
        return domainParse[1];
    } else {
        return 'yandex.ru';
    }
}
