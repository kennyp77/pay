export interface BaseOrderItem {
    id: string;
    amount: string;
    type?: 'PICKUP' | 'SHIPPING' | 'DISCOUNT' | 'PROMOCODE';
    label?: string;
    quantity?: {
        count: string;
        label?: string;
    };
    // https://a.yandex-team.ru/arc/trunk/arcadia/billing/yandex_pay/docs/merchant-api.md#otpravka-chekov-v-fns-54-fz
    receipt?: {
        title?: string;
        tax: number;
        measure: number;
    };
}

export const baseOrderItems: Array<BaseOrderItem> = [
    {
        id: '0',
        label: 'Наручные часы Q&Q',
        amount: '625.72',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '1',
        label: 'Металлический ремешок для Apple Watch',
        amount: '434.39',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '2',
        label: 'Блокнот Moleskine Classic Large 130x210, 120 листов',
        amount: '1474.86',
        quantity: { count: '2' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '3',
        label: 'Беспроводные наушники GetLux Mini Ears PRO, черный',
        amount: '3363.39',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '4',
        label: 'Портативная акустика Xiaomi Mi Portable Bluetooth Speaker, 16 Вт, синий',
        amount: '3828.55',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '5',
        label: 'Смартфон Xiaomi Redmi 9C NFC 2/32 ГБ RU, синий',
        amount: '9523.29',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '6',
        label: '16.2" Ноутбук Apple Macbook Pro Late 2021 (3456×2234, Apple M1 Max, RAM 32 ГБ, SSD 1 ТБ, Apple graphics 32-core), MK1A3RU/A, серый космос',
        amount: '514990.00',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '7',
        label: 'Оптический привод Apple MacBook Air SuperDrive',
        amount: '6802.00',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '8',
        label: 'Беспроводные наушники Apple AirPods 3 RU, белый',
        amount: '16490.00',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '9',
        label: 'Беспроводная мышь Apple Magic Mouse 2',
        amount: '8090.00',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    {
        id: '10',
        label: 'Коврик Satechi Eco Leather Deskmate',
        amount: '546.22',
        quantity: { count: '1' },
        receipt: {
            tax: 1,
            measure: 0,
        },
    },
    { id: '11', label: '', amount: '999.39', quantity: { count: '1' } },
    { id: '12', label: 'Разрушитель сплита', amount: '4296.00', quantity: { count: '1' } },
];

export interface OrderOption<Item = BaseOrderItem> {
    label: string;
    value: number;
    items: Item[];
}

export const sumItemsAmount = (option: OrderOption): string => {
    return option.items.reduce((res, item) => res + Number(item.amount), 0).toFixed(2);
};

export const sharedOrderOptions: OrderOption[] = [
    { label: '1 тов. – %amount%', value: 1, items: baseOrderItems.slice(0, 1) },
    {
        label: '2 тов. – %amount%',
        value: 2,
        items: baseOrderItems.slice(1, 3),
    },
    {
        label: '5 тов. – %amount%',
        value: 3,
        items: baseOrderItems.slice(1, 6),
    },
    {
        label: '5 тов. – %amount%',
        value: 4,
        items: baseOrderItems.slice(5, 11),
    },
    {
        label: '3DS-challenge – %amount%',
        value: 5,
        items: [baseOrderItems[9]],
    },
    {
        label: '1 тов. – %amount%',
        value: 7,
        items: [baseOrderItems[11]],
    },
    {
        label: 'Split ошибка оплаты – %amount%',
        value: 6,
        items: [baseOrderItems[12]],
    },
].map((option) => ({
    ...option,
    label: option.label.replace('%amount%', sumItemsAmount(option)),
}));
