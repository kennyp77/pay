import {
    formatDate,
    formatTime,
    fromUnixTimestamp,
    getPureDate,
    getPureTime,
    toUnixTimestamp,
} from './date';

const i18n = (v: string) => v;

export type WithDateOption = Sdk.ShippingOption & { date: number };
export type WithDateAndTimeOption = WithDateOption & { time: { from: number; to: number } };
export type YandexExpressOption = WithDateOption & {
    provider: 'YANDEX';
    category: 'express';
};

export function getPureDateOfTimestamp(timestamp: number): number {
    return toUnixTimestamp(getPureDate(fromUnixTimestamp(timestamp)));
}

export function getPureTimeOfTimestamp(timestamp: number): number {
    return toUnixTimestamp(getPureTime(fromUnixTimestamp(timestamp)));
}

export function hasDate(option: Sdk.ShippingOption): option is WithDateOption {
    return !!option.date;
}

export function hasDateAndTime(option: Sdk.ShippingOption): option is WithDateAndTimeOption {
    return hasDate(option) && !!option.time;
}

export function inSameDay(option1: WithDateOption, option2: WithDateOption): boolean {
    return getPureDateOfTimestamp(option1.date) === getPureDateOfTimestamp(option2.date);
}

export function inSameTime(time1: number, time2: number): boolean {
    return getPureTimeOfTimestamp(time1) === getPureDateOfTimestamp(time2);
}

export function inSameDateAndTime(
    option1: WithDateAndTimeOption,
    option2: WithDateAndTimeOption,
): boolean {
    return (
        inSameDay(option1, option2) &&
        inSameTime(option1.time.from, option2.time.from) &&
        inSameTime(option1.time.to, option2.time.to)
    );
}

export function inSameSlot(option1: Sdk.ShippingOption, option2: Sdk.ShippingOption): boolean {
    if (hasDateAndTime(option1) && hasDateAndTime(option2)) {
        return inSameDateAndTime(option1, option2);
    }
    if (hasDate(option1) && !option1.time && hasDate(option2) && !option2.time) {
        return inSameDay(option1, option2);
    }

    return false;
}

export function isCheaper(option: Sdk.ShippingOption, than: Sdk.ShippingOption): boolean {
    return Number(option.amount) < Number(than.amount);
}

export function filterCheapest(options: WithDateOption[]): WithDateOption[] {
    return Array.from(
        options
            .reduce((acc, curr) => {
                const key = hasDateAndTime(curr)
                    ? `${getPureTimeOfTimestamp(curr.time.from)}-${getPureTimeOfTimestamp(
                          curr.time.to,
                      )}`
                    : String(getPureDateOfTimestamp(curr.date));

                const current = acc.get(key);

                if (!current || Number(current.amount) > Number(curr.amount)) {
                    acc.set(key, curr);
                }

                return acc;
            }, new Map<string, WithDateOption>())
            .values(),
    );
}

export function isYandexExpress(option: Sdk.ShippingOption): option is YandexExpressOption {
    return hasDate(option) && option.provider === 'YANDEX' && option.category === 'express';
}

export function isNotYandexExpress(option: Sdk.ShippingOption): boolean {
    return !isYandexExpress(option);
}

export function getOptionIdToSelect(selectId: Sdk.ShippingOptionId, options: Sdk.ShippingOption[]) {
    const hasOption = options.some((option) => option.id === selectId);

    if (hasOption) {
        return selectId;
    }

    if (options.some(hasDate)) {
        return prepareOptions(options.filter((option) => option.provider !== 'RUSSIAN_POST'))[0].id;
    }

    const courierOptions = options
        .filter((option) => option.provider !== 'RUSSIAN_POST')
        .sort((a, b) => Number(a.amount) - Number(b.amount));

    return courierOptions.length ? courierOptions[0].id : '';
}

export function getDateGroups(options: WithDateOption[]): number[] {
    return Array.from(
        new Set(
            options.map((option) => {
                const pure = getPureDate(fromUnixTimestamp(option.date));

                return toUnixTimestamp(pure);
            }),
        ),
    ).sort((a, b) => a - b);
}

export function getDateGroupOfOption(option: WithDateOption): number {
    return toUnixTimestamp(getPureDate(fromUnixTimestamp(option.date)));
}

export function sortOptions(a: WithDateOption, b: WithDateOption): number {
    if (a.time && b.time) {
        if (inSameSlot(a, b)) {
            return Number(a.amount) - Number(b.amount);
        }

        if (inSameDay(a, b) && inSameTime(a.time.from, b.time.from)) {
            return (
                Number(getPureTime(fromUnixTimestamp(a.time.to))) -
                Number(getPureTime(fromUnixTimestamp(b.time.to)))
            );
        }

        if (inSameDay(a, b)) {
            return (
                Number(getPureTime(fromUnixTimestamp(a.time.from))) -
                Number(getPureTime(fromUnixTimestamp(b.time.from)))
            );
        }
    }

    if (a.time && !b.time) {
        return 1;
    }

    if (!a.time && b.time) {
        return -1;
    }

    return (
        Number(getPureDate(fromUnixTimestamp(a.date))) -
        Number(getPureDate(fromUnixTimestamp(b.date)))
    );
}

export function getOptionsOfDateGroup(
    options: Sdk.ShippingOption[],
    dateGroup: number,
): Sdk.ShippingOption[] {
    return options.filter(
        (option) =>
            hasDate(option) &&
            toUnixTimestamp(getPureDate(fromUnixTimestamp(option.date))) === dateGroup,
    );
}

export function prepareOptions(options: Sdk.ShippingOption[]): WithDateOption[] {
    const onlyWithDate = options.filter(hasDate);

    // Разделение чтобы алгоритм не исключил Яндекс Экспресс в
    // пользу более дешевого варианта
    const yandexExpressOptions = onlyWithDate.filter(isYandexExpress);
    const otherOptions = filterCheapest(onlyWithDate.filter(isNotYandexExpress));

    yandexExpressOptions.sort(sortOptions);
    otherOptions.sort(sortOptions);

    return [...yandexExpressOptions, ...otherOptions];
}

export function formatShippingTime(
    option: WithDateOption | WithDateAndTimeOption,
    onlyTime = false,
): string {
    if (isYandexExpress(option) && !option.time) {
        return i18n('За 1-2 часа');
    }

    if (hasDateAndTime(option)) {
        const date = `${formatDate(fromUnixTimestamp(option.date))}`;
        const time = `${i18n('с')} ${formatTime(fromUnixTimestamp(option.time.from))} ${i18n(
            'до',
        )} ${formatTime(fromUnixTimestamp(option.time.to))}`;

        return onlyTime ? time : `${date}, ${time}`;
    }

    return onlyTime ? i18n('В течение дня') : `${formatDate(fromUnixTimestamp(option.date))}`;
}
