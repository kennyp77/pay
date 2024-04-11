export const registrationFirstStepFields = {
  email: {
    fieldName: 'email',
    label: 'Эл. почта для связи',
    tooltipText:
      'Пожалуйста, укажите реальную почту, чтобы мы смогли отправить вам необходимые документы',
  },
  phone: {
    fieldName: 'phone',
    label: 'Телефон для связи',
    tooltipText:
      'Пожалуйста, укажите реальный телефон, чтобы мы смогли с вами связаться',
    mask: '+7?999999999',
    maskDefaultValue: '+7',
    contentVariant: 'mask',
  },
  site: {
    fieldName: 'site',
    label: 'Сайт',
  },
  company_title_or_inn: {
    label: 'ИНН или название компании',
    placeholder: 'ИНН или название компании',
    fieldName: 'company_title_or_inn',
  },
  name: {
    fieldName: 'name',
    label: 'Сокращенное наименование компании',
    placeholder: 'Сокращенное наименование компании',
  },
  company_title: {
    fieldName: 'company_title',
    label: 'Полное наименование компании',
    placeholder: 'Полное наименование компании',
  },
  ogrn: {
    fieldName: 'ogrn',
    label: 'ОГРН/ОГРНИП',
    placeholder: 'ОГРН/ОГРНИП',
    mask: '999 9999 9999 9999',
    contentVariant: 'mask',
  },
  kpp: {
    fieldName: 'kpp',
    label: 'КПП',
    placeholder: 'КПП',
    mask: '999 999 999',
    contentVariant: 'mask',
  },
  address: {
    fieldName: 'address',
    label: 'Юридический адрес',
    placeholder: 'Юридический адрес',
  },
  same_address: {
    fieldName: 'same_address',
  },
  correspondence_address: {
    fieldName: 'correspondence_address',
    label: 'Адрес для корреспонденции',
  },
  director: {
    fieldName: 'director',
    label: 'ФИО директора',
    placeholder: 'ФИО директора',
  },
  inn: {
    fieldName: 'inn',
    label: 'ИНН',
    placeholder: 'ИНН',
    mask: '9999 9999 9999',
  },
  captcha: {
    fieldName: 'captcha',
    label: 'Введите код с картинки',
  },
  terms: {
    fieldName: 'terms',
    tooltipText: 'Примите условия',
  },
};

export const registrationThirdStepFields = {
  anotherService: {
    fieldName: 'anotherService',
    label: 'Ваша CMS',
  },
};

export const providerApplicationFields = {
  name: {
    fieldName: 'name',
    label: 'Ваше имя',
    placeholder: 'Ваше имя',
  },
  monthly_turnover: {
    fieldName: 'monthly_turnover',
    label: 'Среднемесячный оборот компании',
    defaultValue: '0 – 9 999 ₽',
    options: [
      { value: '0 – 9 999 ₽', content: '0 – 9 999 ₽' },
      { value: '10 000 - 99 999 ₽', content: '10 000 - 99 999 ₽' },
      { value: '100 000 – 999 999 ₽', content: '100 000 – 999 999 ₽' },
      {
        value: '1 000 000 ₽ — 4 999 999 ₽',
        content: '1 000 000 ₽ — 4 999 999 ₽',
      },
      { value: '5 000 000 — 9 999 999 ₽', content: '5 000 000 — 9 999 999 ₽' },
      { value: 'больше 10 000 000 ₽', content: 'больше 10 000 000 ₽' },
    ],
  },
  average_bill: {
    fieldName: 'average_bill',
    label: 'Средний чек',
    defaultValue: '0 – 999 ₽',
    options: [
      { value: '0 – 999 ₽', content: '0 – 999 ₽' },
      { value: '1 000 – 1 999 ₽', content: '1 000 – 1 999 ₽' },
      { value: '2 000 ₽ — 2 999 ₽', content: '2 000 ₽ — 2 999 ₽' },
      { value: '3 000 — 3 999 ₽', content: '3 000 — 3 999 ₽' },
      { value: 'больше 4 000 ₽', content: 'больше 4 000 ₽' },
    ],
  },
  phone: {
    fieldName: 'phone',
    label: 'Телефон для связи',
    mask: '+7?999999999',
    maskDefaultValue: '+7',
    contentVariant: 'mask',
  },
  email: {
    fieldName: 'email',
    label: 'Почта для связи',
  },
};
