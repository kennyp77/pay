(function (window) {
    // NB: Значения подставляются при сборке
    var project = '%project%';
    var page = '%page%';

    // NB: Значения подставляются при рендере
    var env = '%%env%%';
    var reqid = '%%reqid%%';

    var isTouch = false;
    try {
        document.createEvent('TouchEvent');
        isTouch = true;
    } catch (err) {}

    var version = '%%version%%';
    var slots = '';

    var platform = isTouch ? 'touch' : 'desktop';
    var clck = 'https://yandex.ru/clck/click';

    Ya.Rum.init(
        {
            beacon: true,
            clck: clck,
            reqid: reqid,
            slots: slots,
        },
        {
            // region,
            rum_id: 'ru.' + project + '.' + platform,
            '-project': project,
            '-page': page,
            '-platform': platform,
            '-version': version,
            '-env': env,
        },
    );

    Ya.Rum.initErrors({
        project: project,
        page: page,
        platform: platform,
        version: version,
        env: env,
        slots: slots,
        preventError: false,
        unhandledRejection: true,
        uncaughtException: true,
        transform: function (error) {
            if (!window.__rum_boot) {
                error.source = 'preboot';
            }

            return error;
        },
    });

    // 2876 — first meaningful paint
    Ya.Rum.observeDOMNode('2876', 'body.rum--ready');
    Ya.Rum.observeDOMNode('paint.preloader-node-paint', 'body:not(.rum--ready)');
})(window);
