export function toUnixTs(date: Date) {
    return (date.getTime() * 0.001) | 0;
}
