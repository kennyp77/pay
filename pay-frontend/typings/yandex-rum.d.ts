declare namespace Ya {
    /**
     * RUM счетчик
     */
    namespace Rum {
        /**
         * Метод для инициализации RUM счетчика
         */
        function init(settings: RUMSettings, vars: Vars): void;

        /**
         * Метод для отправки RUM метки
         */
        function sendTimeMark(
            counterId: string,
            time?: number,
            addPerfMark?: boolean,
            params?: { [s: string]: string },
        ): void;

        /**
         * Метод для отправки необрабатываемых данных счетчика
         */
        function sendRaf(position: string | number): void;

        /**
         * Метод для получения времени от начала загрузки страницы
         */
        function getTime(): number;

        /**
         * Записывает время старта расчёта дельты.
         */
        function time(counterId: string): void;

        /**
         * Записывает время окончания расчёта дельты.
         * При загрузке RUM implementation записанные метрики будут отправлены на бэкэнд.
         */
        function timeEnd(counterId: string, vars?: object): void;

        /**
         * Отправить дельту времени для этого инстанса subPage
         */
        function sendDelta(counterId: string, delta: number, subPage?: any): void;
    }

    /**
     * Параметры RUM счетчика
     */
    interface RUMSettings {
        /**
         * Флаг использовать beacon API или нет
         */
        beacon: boolean;

        /**
         * Адрес хоста для отправки счетчика
         */
        clck: string;

        /**
         * Массив с test-id's или другие идентификаторы выборок, в которые попал показ
         */
        slots: string[];

        /**
         * уникальный id показа
         */
        reqid?: string;
    }

    /**
     * Дополнительные метки RUM счетчика
     */
    interface Vars {
        [s: string]: string;
    }

    const clck: string | undefined;
    const reqid: string | undefined;
    const staticHost: string | undefined;

    /**
     * ErrorBooster
     */
    namespace Rum {
        type LoggableError = Error | ErrorEvent;

        type LogLevel = 'info' | 'debug' | 'warn' | 'error' | 'fatal' | 'trace';
        type LogEnvironment = 'development' | 'testing' | 'prestable' | 'production';

        type Additional = Record<string, any>;

        interface LogErrorOptions {
            message?: string;
            service?: string;
            source?: string;
            sourceMethod?: string;
            type?: string;
            block?: string;
            method?: string;
            page?: string;
            additional?: Additional;
            level?: LogLevel;
        }

        function logError(options: LogErrorOptions, error?: LoggableError): void;
    }
}
