const dateFormatter = new Intl.DateTimeFormat('ru', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
});

const timeFormatter = new Intl.DateTimeFormat('ru', {
    hour: '2-digit',
    minute: '2-digit',
});

const i18n = (v: string) => v;

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function toUnixTimestamp(date: Date): number {
    return Math.floor(Number(date) / 1000);
}

export function fromUnixTimestamp(timestamp: number): Date {
    return new Date(timestamp * 1000);
}

export function getPureDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getPureTime(time: Date): Date {
    return new Date(
        time.getFullYear(),
        time.getMonth(),
        time.getDate(),
        time.getHours(),
        time.getMinutes(),
    );
}

export function isToday(date: Date): boolean {
    return Number(getPureDate(date)) === Number(getPureDate(new Date()));
}

export function isTomorrow(date: Date): boolean {
    return Number(getPureDate(date)) === Number(getPureDate(new Date(Date.now() + DAY)));
}

export function formatDate(date: Date): string {
    return isToday(date)
        ? i18n('Сегодня')
        : isTomorrow(date)
        ? i18n('Завтра')
        : dateFormatter.format(date);
}

export function formatTime(time: Date): string {
    return timeFormatter.format(time);
}
