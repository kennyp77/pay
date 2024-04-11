export interface BaseShippingItem {
    id: string;
    provider: 'YANDEX' | 'COURIER' | 'CDEK' | 'EMS';
    category: 'EXPRESS' | 'TODAY' | 'STANDARD';
    title: string;
    amount: string;
    fromDate?: number;
    fromTime?: number;
    toTime?: number;
}

const baseShippingItems: Array<BaseShippingItem> = [
    {
        id: '0',
        provider: 'YANDEX',
        category: 'EXPRESS',
        title: 'Яндекс Доставка',
        amount: '400.00',
        fromDate: new Date(2022, 1, 20, 0, 0, 0, 0).getTime(),
        fromTime: new Date(2022, 1, 20, 15, 0, 0, 0).getTime(),
        toTime: new Date(2022, 1, 20, 16, 0, 0, 0).getTime(),
    },
    {
        id: '1',
        provider: 'COURIER',
        category: 'TODAY',
        title: 'Курьер магазина',
        amount: '500.00',
        fromDate: new Date(2022, 1, 20, 0, 0, 0, 0).getTime(),
        fromTime: new Date(2022, 1, 20, 12, 0, 0, 0).getTime(),
        toTime: new Date(2022, 1, 20, 18, 0, 0, 0).getTime(),
    },
    {
        id: '2',
        provider: 'CDEK',
        category: 'STANDARD',
        title: 'CDEK',
        amount: '200.00',
        fromDate: new Date(2022, 1, 21, 0, 0, 0, 0).getTime(),
        fromTime: new Date(2022, 1, 21, 9, 0, 0, 0).getTime(),
        toTime: new Date(2022, 1, 21, 21, 0, 0, 0).getTime(),
    },
    {
        id: '3',
        provider: 'EMS',
        category: 'STANDARD',
        title: 'EMS',
        amount: '200.00',
        fromDate: new Date(2022, 1, 22, 0, 0, 0, 0).getTime(),
        fromTime: new Date(2022, 1, 22, 9, 0, 0, 0).getTime(),
        toTime: new Date(2022, 1, 22, 15, 0, 0, 0).getTime(),
    },
    {
        id: '4',
        provider: 'EMS',
        category: 'STANDARD',
        title: 'EMS',
        amount: '200.00',
        fromDate: new Date(2022, 1, 22, 0, 0, 0, 0).getTime(),
        fromTime: new Date(2022, 1, 22, 15, 0, 0, 0).getTime(),
        toTime: new Date(2022, 1, 22, 21, 0, 0, 0).getTime(),
    },
    {
        id: '5',
        provider: 'EMS',
        category: 'STANDARD',
        title: 'Почта России',
        amount: '300.00',
        fromDate: new Date(2022, 1, 25, 0, 0, 0, 0).getTime(),
        fromTime: new Date(2022, 1, 25, 15, 0, 0, 0).getTime(),
        toTime: new Date(2022, 1, 25, 21, 0, 0, 0).getTime(),
    },
];

export interface ShippingOption<Item = BaseShippingItem> {
    value: number;
    alias?: string;
    label: string;
    items: Item[];
}

export const sharedShippingOptions: ShippingOption[] = [
    {
        label: '5 вариантов',
        value: 1,
        items: baseShippingItems.map(({ fromDate, fromTime, toTime, ...option }) => option),
    },
    {
        label: '10 вар + дата',
        value: 2,
        items: baseShippingItems.map(({ fromTime, toTime, ...option }) => option),
    },
    {
        label: '10 вар + время',
        value: 3,
        items: baseShippingItems.map(({ ...option }) => option),
    },
    { label: 'Пустой ответ', value: 4, items: [] },
    { label: 'Нет ответа', value: 5, alias: 'no_response', items: [] },
];
