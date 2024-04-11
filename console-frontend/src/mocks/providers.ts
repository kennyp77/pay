import { ProvidersIDs } from 'types/providers-type';

export const providers = {
  providers_list: [
    {
      id: ProvidersIDs.PAYTURE,
      name: 'Payture',
      logo_url: '/provider-logo-payture.svg',
      info_text:
        "<p>Вы можете найти реквизиты в письме от Payture с темой письма «Тестовый доступ» или запросить их повторно у своего менеджера в Payture, написав на почту <a href='mailto: business@payture.com'>business@payture.com</a>.</p>",
      fields: [
        {
          label: 'Идентификатор продавца',
          placeholder: '',
          name: 'key',
          type: 'text',
        },
        {
          label: 'API-ключ для авторизации',
          placeholder: '',
          name: 'gateway_merchant_id',
          type: 'text',
        },
        {
          label: 'Пароль для API',
          placeholder: '',
          name: 'password',
          type: 'text',
        },
      ],
    },
    {
      id: ProvidersIDs.UNITELLER,
      name: 'Uniteller',
      logo_url: '/provider-logo-uniteller.svg',
      info_text:
        "<p>Вы можете найти реквизиты в письме от Uniteller с темой письма «Тестовый доступ» или запросить их повторно у своего менеджера в Uniteller, написав на почту <a href='mailto: business@Uniteller.com'>business@Uniteller.com</a>.</p>",
      fields: [
        {
          label: 'UPID',
          placeholder: '',
          name: 'login',
          type: 'text',
        },
        {
          label: 'API-ключ для авторизации',
          placeholder: '',
          name: 'gateway_merchant_id',
          type: 'text',
        },
        {
          label: 'Пароль для API',
          placeholder: '',
          name: 'password',
          type: 'text',
        },
      ],
    },
    // {
    //   id: 'alfa-bank',
    //   name: 'Альфа-банк',
    //   logo_url: '/provider-logo-alfa.svg',
    //   info_text:
    //     `<p>Вы можете найти реквизиты в письме от Альфа-банк с темой письма «Тестовый доступ»
    //или запросить их повторно у своего менеджера в Альфа-банк, написав на нашу почту.</p>`,
    //   fields: [
    //     {
    //       label: 'Идентификатор продавца',
    //       placeholder: '',
    //       name: 'alpha_id_1',
    //       type: 'text',
    //     },
    //     {
    //       label: 'Пароль для API',
    //       placeholder: '',
    //       name: 'alpha_id_2',
    //       type: 'text',
    //     },
    //   ],
    // },
  ],
  future_providers_list: [
    {
      name: 'Payture',
      logo_url: '/static/feature-providers/provider-logo-payture.svg',
      info_text:
        'Пару строк продающего текста о провайдере. И еще одно предложение от которого невозможно отказаться',
      link: 'https://payture.com/',
      warning_text:
        "<p>Подключаем провайдера РБС. Это займет 1-2 дня.<br/>О результате сообщим на <a href=''>yndx-andreykarelin@yandex.ru</a></p>",
      is_soon: false,
      commission: 2,
      banks_list: [
        {
          title: 'ВТБ',
          logo_url: '/static/banks-list/vtb.svg',
        },
        {
          title: 'Сбербанк',
          logo_url: '/static/banks-list/sber.svg',
        },
        {
          title: 'Открытие',
          logo_url: '/static/banks-list/otkritye.svg',
        },
        {
          title: 'PSB',
          logo_url: '/static/banks-list/psb.svg',
        },
        {
          title: 'Тинькофф',
          logo_url: '/static/banks-list/tinkoff.svg',
        },
        {
          title: 'Qiwi',
          logo_url: '/static/banks-list/qiwi.svg',
        },
      ],
    },
    {
      name: 'Uniteller',
      logo_url: '/static/feature-providers/provider-logo-uniteller.svg',
      info_text:
        '<p>Самые востребованные платежные инструменты, высокая конверсия. Кастомные решения, доступ к техподдержке 24/7</p>',
      link: 'https://www.uniteller.ru/',
      warning_text:
        "<p>Подключаем провайдера РБС. Это займет 1-2 дня.<br/>О результате сообщим на <a href=''>yndx-andreykarelin@yandex.ru</a></p>",
      is_soon: false,
      commission: 2,
      banks_list: [
        {
          title: 'Альфа-банк',
          logo_url: '/static/banks-list/alfa.svg',
        },

        {
          title: 'Сбербанк',
          logo_url: '/static/banks-list/sber.svg',
        },
        {
          title: 'ВТБ',
          logo_url: '/static/banks-list/vtb.svg',
        },
        {
          title: 'Газпром',
          logo_url: '/static/banks-list/gazprom.svg',
        },
        {
          title: 'Русский стандарт',
          logo_url: '/static/banks-list/russtandart.svg',
        },
        {
          title: 'Акбарс',
          logo_url: '/static/banks-list/akbars.svg',
        },
        {
          title: 'Промсвязьбанк',
          logo_url: '/static/banks-list/spb.svg',
        },
        {
          title: 'МТС',
          logo_url: '/static/banks-list/mts.svg',
        },
        {
          title: 'ЮниКредит Банк',
          logo_url: '/static/banks-list/ucs.svg',
        },
        {
          title: 'Промсвязьбанк',
          logo_url: '/static/banks-list/psb.svg',
        },
        {
          title: 'РНКБ',
          logo_url: '/static/banks-list/rnkb.svg',
        },
        {
          title: 'Почта Банк',
          logo_url: '/static/banks-list/pochtabank.svg',
        },
      ],
    },
    // {
    //   name: 'Payonline',
    //   logo_url: '/static/feature-providers/provider-logo2.png',
    //   info_text:
    //     '<p>Пару строк продающего текста о провайдере. И еще одно предложение от которого невозможно отказаться</p>',
    //   link: 'http://google.com',
    //   warning_text:
    //     `<p>Подключаем провайдера РБС. Это займет 1-2 дня.<br/>
    // О результате сообщим на <a href=''>yndx-andreykarelin@yandex.ru</a></p>`,
    //   is_soon: false,
    //   commission: 2,
    // },
    // {
    //   name: 'РБС',
    //   logo_url: '/static/feature-providers/provider-logo3.svg',
    //   info_text:
    //     '<p>Пару строк продающего текста о провайдере. И еще одно предложение от которого невозможно отказаться</p>',
    //   warning_text:
    //     `<p>Подключаем провайдера РБС. Это займет 1-2 дня.<br/>
    // О результате сообщим на <a href=''>yndx-andreykarelin@yandex.ru</a></p>`,
    //   is_soon: false,
    //   commission: 2,
    // },
  ],
};
