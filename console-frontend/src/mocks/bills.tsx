import { SpacerProps } from 'components/spacers';
import { TableAlign } from 'components/table';

import { OrderStatuses } from 'types/bills';

export const billHeading = [
  {
    title: 'Период',
    columnId: 'period',
    align: TableAlign.left,
    isSortable: true,
  },
  {
    title: 'Выставлен',
    columnId: 'exhibited',
    isSortable: true,
  },
  {
    title: 'Статус',
    modifier: { left: 32 as SpacerProps['left'] },
    columnId: 'status',
  },
  {
    title: 'Сумма',
    appendix: '₽',
    align: TableAlign.right,
    columnId: 'sum',
    isSortable: true,
  },
  {
    title: '',
    columnId: 'link',
    align: TableAlign.right,
  },
];

export const billsData = [
  {
    period: '1 июн — 30 июн 22',
    exhibited: '1 июл 22, 15:48',
    status: {
      state: OrderStatuses.Complete,
      description: 'Сплит',
      cardPath: 1334,
    },
    sum: 900500.0,
  },
  {
    period: '1 июн — 30 июн 22',
    exhibited: '1 июл 22, 15:48',
    status: {
      state: OrderStatuses.Error,
      description: 'Сплит',
      cardPath: 1334,
    },
    sum: 900500.0,
  },
  {
    period: '1 июн — 30 июн 22',
    exhibited: '1 июл 22, 15:48',
    status: {
      state: OrderStatuses.Error,
      description: 'Сплит',
      cardPath: 1334,
    },
    sum: 900500.0,
  },
  {
    period: '1 июн — 30 июн 22',
    exhibited: '1 июл 22, 15:48',
    status: {
      state: OrderStatuses.Complete,
      description: 'Сплит',
      cardPath: 1334,
    },
    sum: 900500.0,
  },
  {
    period: '1 июн — 30 июн 22',
    exhibited: '1 июл 22, 15:48',
    status: {
      state: OrderStatuses.Hold,
      description: 'Сплит',
      cardPath: 1334,
    },
    sum: 900500.0,
  },
];

export const orderStatusesList = [
  {
    id: OrderStatuses.Complete,
    name: 'Оплачен',
    icon: '/icons/status-complete.svg',
  },
  {
    id: OrderStatuses.Error,
    name: 'Задолженность',
    icon: '/icons/status-error.svg',
  },
  {
    id: OrderStatuses.Hold,
    name: 'На оплату',
    icon: '/icons/status-hold.svg',
  },
];
