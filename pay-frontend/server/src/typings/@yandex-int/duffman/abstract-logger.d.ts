declare module '@yandex-int/duffman/lib/abstract-logger' {
    export default class Logger {
        constructor(format: string, ns: string): Logger;

        public crit(reason: string, args?: any): void;

        public err(reason: string, args?: any): void;

        public error(reason: string, args?: any): void;

        public warning(reason: string, args?: any): void;

        public warn(reason: string, args?: any): void;

        public notice(reason: string, args?: any): void;

        public log(reason: string, args?: any): void;

        public info(reason: string, args?: any): void;

        public debug(reason: string, args?: any): void;

        protected _prepareArgs(reason: string, args?: any): any;

        protected _log(
            level: 'crit' | 'err' | 'error' | 'warning' | 'warn' | 'notice' | 'log' | 'info' | 'debug',
            reason: string,
            args?: any,
        ): void;
    }
}
