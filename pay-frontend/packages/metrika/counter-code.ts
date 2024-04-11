/**
 * Код метрики взятый из интерфейса Метрики
 */

/* eslint-disable */
// @ts-ignore
(function (m, e, t, r, i, k, a) {
    // @ts-ignore
    m[i] =
        m[i] ||
        function () {
            (m[i].a = m[i].a || []).push(arguments);
        };
    // @ts-ignore
    m[i].l = 1 * new Date();
    (k = e.createElement(t)),
        (a = e.getElementsByTagName(t)[0]),
        (k.async = 1),
        (k.src = r),
        a.parentNode.insertBefore(k, a);
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
/* eslint-enable */

// NB: Экспорт нужен для сброса sideEffect
export default (): void => undefined;
