export interface BasePickupPoint {
    id: string;
    title: string;
    provider?: string;
    address: string;
    deliveryDate?: number;
    storagePeriod?: number;
    amount?: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    info?: {
        schedule?: Array<{
            label: string;
            timeFrom: string;
            timeTo: string;
        }>;
        contacts?: string[];
        description?: string;
        tripDescription?: string;
    };
}

const pickPoints: BasePickupPoint[] = [
    {
        id: 'msk-1',
        title: 'БЦ Красная Роза',
        provider: 'pickpoint',
        address: 'Москва, ул. Льва Толстого, 16',
        coordinates: {
            latitude: 55.733974,
            longitude: 37.587093,
        },
        deliveryDate: new Date('2025-01-01').getTime(),
        storagePeriod: 5,
        amount: '100.00',
        info: {
            schedule: [
                {
                    label: 'пн-пт',
                    timeFrom: '09:00',
                    timeTo: '21:00',
                },
                {
                    label: 'сб',
                    timeFrom: '09:00',
                    timeTo: '18:00',
                },
            ],
            contacts: ['8 (800) 222-80-00'],
            tripDescription: 'Постамат в пятом подъезде, на первом этаже',
        },
    },
    {
        id: 'msk-2',
        title: 'БЦ Аврора',
        address: 'Москва, Садовническая набережная, 79',
        coordinates: {
            latitude: 55.734511,
            longitude: 37.641845,
        },
        deliveryDate: new Date('2025-01-02').getTime(),
        amount: '300.00',
        info: {
            schedule: [
                {
                    label: 'пн-пт',
                    timeFrom: '09:00',
                    timeTo: '21:00',
                },
            ],
            contacts: ['8 (800) 250-96-39', '+7 (495) 739-70-00', '+7 (495) 974-35-81'],
        },
    },
    {
        id: 'msk-3',
        title: 'МФК Око',
        address: 'Москва, 1-й Красногвардейский пр., 21, стр. 1',
        coordinates: {
            latitude: 55.750028,
            longitude: 37.534406,
        },
        deliveryDate: new Date('2025-01-03').getTime(),
        storagePeriod: 5,
        amount: '500.00',
        info: {
            contacts: ['+7 (495) 410-68-22'],
        },
    },
    {
        id: 'sp-1',
        title: 'БЦ Бенуа',
        provider: 'pickpoint',
        address: 'Санкт-Петербург, Пискарёвский проспект, 2к2Щ',
        coordinates: {
            latitude: 59.959007,
            longitude: 30.406277,
        },
        deliveryDate: new Date('2024-12-31').getTime(),
        storagePeriod: 3,
        amount: '99.00',
        info: {
            schedule: [
                {
                    label: 'пн-пт',
                    timeFrom: '09:00',
                    timeTo: '21:00',
                },
                {
                    label: 'сб',
                    timeFrom: '09:00',
                    timeTo: '18:00',
                },
            ],
            contacts: ['8 (800) 250-96-39', '+7 (812) 633-36-00'],
            tripDescription: 'Постамат в третьем этаже, напротив ресепшена',
        },
    },
];

export default pickPoints;
