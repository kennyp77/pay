import { SpacerProps } from 'components/spacers';
import { TableAlign } from 'components/table';
import { basePath } from 'const';

import { OrderStatuses } from 'types/payments';

export const paymentHeading = [
  {
    title: 'ID заказа',
    columnId: 'id',
    isSortable: true,
  },
  {
    title: 'Дата заказа',
    columnId: 'date',
    isSortable: true,
  },
  {
    title: 'Сумма',
    appendix: '₽',
    align: TableAlign.right,
    columnId: 'sum',
    isSortable: true,
  },
  {
    title: 'Статус',
    modifier: { left: 32 as SpacerProps['left'] },
    columnId: 'status',
  },
  {
    title: 'Почта',
    columnId: 'email',
    isSortable: true,
  },
  {
    title: 'Телефон',
    columnId: 'phone',
  },
];

export const paymentsData = [
  {
    id: '1234567890112',
    date: '19 мая 22, 01:24',
    sum: 96500.0,
    status: {
      state: OrderStatuses.Complete,
      description: 'Сплит',
      cardPath: 1334,
    },
    email: 'andreykarelin@yandex.ru',
    phone: '+79000000000',
  },
  {
    id: '1234567890113',
    date: '15 сент 22, 15:48',
    sum: 96500.0,
    status: {
      state: OrderStatuses.Return,
      description: 'Сплит',
      cardPath: 1334,
    },
    email: 'andreykarelin@yandex.ru',
    phone: '+79000000000',
  },
  {
    id: '1234567890114',
    date: '15 сент 22, 15:48',
    sum: 1500.0,
    status: {
      state: OrderStatuses.Declined,
      description: 'Сплит',
      cardPath: 1334,
    },
    email: 'andreykarelin@yandex.ru',
    phone: '+79000000000',
  },
  {
    id: '1234567890115',
    date: '15 сент 22, 15:48',
    sum: 100.0,
    status: {
      state: OrderStatuses.Complete,
      cardPath: 1334,
    },
    email: 'andreykarelin@yandex.ru',
    phone: '+79000000000',
  },
];

export const orderStatusesList = [
  {
    id: OrderStatuses.Complete,
    name: 'Оплачен',
    icon: `${basePath}/icons/status-complete.svg`,
  },
  {
    id: OrderStatuses.Declined,
    name: 'Отменен',
    icon: `${basePath}/icons/status-declined.svg`,
  },
  {
    id: OrderStatuses.Hold,
    name: 'В процессе',
    icon: `${basePath}/icons/status-hold.svg`,
  },
  {
    id: OrderStatuses.Return,
    name: 'Возвращен',
    icon: `${basePath}/icons/status-return.svg`,
  },
  {
    id: OrderStatuses.Error,
    name: 'Ошибка',
    icon: `${basePath}/icons/status-error.svg`,
  },
];
