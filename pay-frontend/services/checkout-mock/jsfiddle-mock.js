function onYaPayLoad() {
    const YaPay = window.YaPay;

    const statusNode = document.querySelector('#pyment_status');

    // Сформировать данные платежа.
    var paymentData = {
        env: YaPay.PaymentEnv.Sandbox,
        version: 2,
        countryCode: YaPay.CountryCode.Ru,
        currencyCode: YaPay.CurrencyCode.Rub,
        merchant: {
            id: 'c1069d7a-0e0d-4251-9ba0-aa763a13b4f9',
            name: 'local-merchant',
            url: 'tele2.ru',
            // id: '37466cc6-48bd-47b1-8c3a-1f0fc65d7e89',
            // name: 'test-merchant-name',
            // url: 'https://test-merchant-url.ru',
        },
        order: {
            id: 'test-order-id',
            total: { label: 'Итого', amount: '23989.00' },
            items: [
                { label: 'Умная колонка Яндекс Станция Макс YNDX-0008 Gray', amount: '19999.00' },
                {
                    label: 'Умная колонка Яндекс Станция.Лайт YNDX-00025, ультрафиолет',
                    amount: '3990.00',
                },
            ],
        },
        paymentMethods: [
            {
                type: YaPay.PaymentMethodType.Card,
                gateway: 'yandex-trust',
                gateway_merchant_id: 'yandex-market',
                // gateway: 'payture',
                // gatewayMerchantId: 'test-gateway-merchant-id',
                allowedAuthMethods: [YaPay.AllowedAuthMethod.PanOnly],
                allowedCardNetworks: [
                    YaPay.AllowedCardNetwork.Visa,
                    YaPay.AllowedCardNetwork.Mastercard,
                    YaPay.AllowedCardNetwork.Mir,
                    YaPay.AllowedCardNetwork.Maestro,
                    YaPay.AllowedCardNetwork.VisaElectron,
                ],
            },
        ],

        // Указать необходимые данные которые нужно получить
        // (чекаут включается при запросе shippingContact или shippingTypes полей)
        requiredFields: {
            // Контакт плательщика
            billingContact: {
                email: true,
            },
            // Контакт получателя
            shippingContact: {
                name: true,
                email: true,
                phone: true,
            },
            // Доставка одим из вариантов
            shippingTypes: {
                direct: true,
                pickup: true,
            },
        },
    };

    // Создать платеж.
    YaPay.createPayment(paymentData)
        .then(function (payment) {
            // Создать экземпляр кнопки.
            var container = document.querySelector('#button_container');
            var button = YaPay.Button.create({
                type: YaPay.ButtonType.Pay,
                theme: YaPay.ButtonTheme.Black,
                width: YaPay.ButtonWidth.Max,
            });

            // Смонтировать кнопку в DOM.
            button.mount(container);

            // Подписаться на событие click.
            button.on(YaPay.ButtonEventType.Click, function onPaymentButtonClick() {
                // Запустить оплату после клика на кнопку.
                payment.checkout();
            });

            // Подписаться на событие setup.
            payment.on(YaPay.PaymentEventType.Setup, function onPaymentChange(event) {
                // Передаем данные для инициализации формы
                getSetupData(event).then((setupData) => {
                    payment.setup(setupData);
                });
            });

            // Подписаться на событие change.
            payment.on(YaPay.PaymentEventType.Change, function onPaymentChange(event) {
                // Обновляем платеж
                getNextPaymentData(event).then((updateData) => {
                    payment.update(updateData);
                });
            });

            // Подписаться на событие process.
            payment.on(YaPay.PaymentEventType.Process, function onPaymentProcess(event) {
                payment.complete(YaPay.CompleteReason.Success);

                if (statusNode) {
                    // Получить платежный токен.
                    statusNode.innerText = JSON.stringify(event, null, 2);
                }
            });
        })
        .catch(function (err) {
            console.log(err);
            // Если использовалась кастомная кнопка Yandex Pay, то скрываем ее.
        });

    function getSetupData(event) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Если мы знаем где находится пользователь,
                //   то тут можно заранее подготовить и отдать точки самовывоза
                if (event.pickupPoints) {
                    resolve({
                        pickupPoints: exampleSetupPickupPoints(),
                    });
                }
            }, 500);
        });
    }

    function getNextPaymentData(event) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Пользователь выбрал адрес доставки
                // Нужно передать доступные варианты доставки
                // Если вариантов нет, можно передать пустой массив,
                //   и тогда доставка будет оплачиваться отдельно по согласованию
                if (event.shippingAddress) {
                    resolve({
                        shippingOptions: exampleShippingOptions(event.shippingAddress),
                    });
                }

                // Пользователь выбрал вариант доставки
                // Добавляем ее в корзину и обновляем ее на форме
                if (event.shippingOption) {
                    resolve({
                        order: exampleOrderWithDirectShipping(event.shippingOption),
                    });
                }

                // Пользователь указал город и улицу (без дома!)
                // Нужно передать доступные пункты самовывоза
                if (event.pickupBounds) {
                    resolve({
                        pickupPoints: examplePickupPoints(event.pickupBounds),
                    });
                }

                // Пользователь выбрал пункт самовы
                // Обновляем корзину
                if (event.pickupPoint) {
                    resolve({
                        order: exampleOrderWithPickup(event.pickupPoint),
                    });
                }
            }, 500);
        });
    }

    function exampleShippingOptions(shippingAddress) {
        // Вараинты доставки вычисляются относительно адреса получателя
        return getShippingOptions();
    }

    function exampleOrderWithDirectShipping(shippingOption) {
        const { order } = paymentData;

        return {
            ...order,
            items: [
                ...order.items,
                {
                    type: 'SHIPPING',
                    label: shippingOption.label,
                    amount: shippingOption.amount,
                },
            ],
            total: {
                ...order.total,
                amount: amountSum(order.total.amount, shippingOption.amount),
            },
        };
    }

    function exampleSetupPickupPoints() {
        return getPickupPoints().slice(0, 1);
    }

    function examplePickupPoints(pickupBounds) {
        // Отдаем пункты самовывоза для указанной области
        return getPickupPoints().filter(
            (point) =>
                point.coordinates.latitude >= pickupBounds.ne.latitude &&
                point.coordinates.latitude <= pickupBounds.sw.latitude &&
                point.coordinates.longitude >= pickupBounds.ne.longitude &&
                point.coordinates.longitude <= pickupBounds.sw.longitude,
        );
    }

    function exampleOrderWithPickup(pickupPoint) {
        const { order } = paymentData;

        return {
            ...order,
            items: [
                ...order.items,
                {
                    type: 'PICKUP',
                    label: 'Доставка до пункта самовывоза',
                    amount: pickupPoint.amount,
                },
            ],
            total: {
                ...order.total,
                amount: amountSum(order.total.amount, pickupPoint.amount),
            },
        };
    }

    function getShippingOptions() {
        return [
            {
                id: 'COURIER-1',
                provider: 'COURIER',
                label: 'Курьером',
                amount: '100',
                date: toUnixTs(new Date('2021-12-20')),
            },
            {
                id: 'COURIER-2',
                provider: 'COURIER',
                label: 'Курьером',
                amount: '350',
                date: toUnixTs(new Date('2021-12-19')),
                time: {
                    from: toUnixTs(new Date('2021-12-19T09:00:00')),
                    to: toUnixTs(new Date('2021-12-19T15:00:00')),
                },
            },
            {
                id: 'COURIER-3',
                provider: 'COURIER',
                label: 'Курьером',
                amount: '350',
                date: toUnixTs(new Date('2021-12-19')),
                time: {
                    from: toUnixTs(new Date('2021-12-19T15:00:00')),
                    to: toUnixTs(new Date('2021-12-19T21:00:00')),
                },
            },
            {
                id: 'CDEK-1',
                provider: 'CDEK',
                label: 'Курьером СДЭК',
                amount: '400',
                date: toUnixTs(new Date('2021-12-15')),
            },
            {
                id: 'CDEK-2',
                provider: 'CDEK',
                label: 'Курьером СДЭК',
                amount: '600',
                date: toUnixTs(new Date('2021-12-10')),
                time: {
                    from: toUnixTs(new Date('2021-12-10T10:00:00')),
                    to: toUnixTs(new Date('2021-12-10T14:00:00')),
                },
            },
            {
                id: 'CDEK-3',
                provider: 'CDEK',
                label: 'Курьером СДЭК',
                amount: '600',
                date: toUnixTs(new Date('2021-12-10')),
                time: {
                    from: toUnixTs(new Date('2021-12-10T14:00:00')),
                    to: toUnixTs(new Date('2021-12-10T18:00:00')),
                },
            },
            {
                id: 'CDEK-4',
                provider: 'CDEK',
                label: 'Курьером СДЭК',
                amount: '600',
                date: toUnixTs(new Date('2021-12-10')),
                time: {
                    from: toUnixTs(new Date('2021-12-10T18:00:00')),
                    to: toUnixTs(new Date('2021-12-10T22:00:00')),
                },
            },
        ];
    }

    function getPickupPoints() {
        return [
            {
                id: 'msk-1',
                label: 'БЦ Красная Роза',
                provider: 'pickpoint',
                address: 'Москва, ул. Льва Толстого, 16',
                coordinates: {
                    latitude: 55.733974,
                    longitude: 37.587093,
                },
                date: toUnixTs(new Date('2025-01-01')),
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
                label: 'БЦ Аврора',
                address: 'Москва, Садовническая набережная, 79',
                coordinates: {
                    latitude: 55.734511,
                    longitude: 37.641845,
                },
                date: toUnixTs(new Date('2025-01-01')),
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
                label: 'МФК Око',
                address: 'Москва, 1-й Красногвардейский пр., 21, стр. 1',
                coordinates: {
                    latitude: 55.750028,
                    longitude: 37.534406,
                },
                date: toUnixTs(new Date('2025-01-01')),
                storagePeriod: 5,
                amount: '500.00',
                info: {
                    contacts: ['+7 (495) 410-68-22'],
                },
            },
            {
                id: 'sp-1',
                label: 'БЦ Бенуа',
                provider: 'pickpoint',
                address: 'Санкт-Петербург, Пискарёвский проспект, 2к2Щ',
                coordinates: {
                    latitude: 59.959007,
                    longitude: 30.406277,
                },
                date: toUnixTs(new Date('2024-12-31')),
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
    }

    function amountSum(amountA, amountB) {
        return (Number(amountA) + Number(amountB)).toFixed(2);
    }

    function toUnixTs(date) {
        return (date.getTime() * 0.001) | 0;
    }
}
