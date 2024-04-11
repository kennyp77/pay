import React, { FC, useCallback, useMemo } from 'react';
import { cn } from '@bem-react/classname';

import { Block } from 'components/block';
import { Box } from 'components/box';
import { Col } from 'components/col';
import { Divider } from 'components/divider';
import { Modal } from 'components/modal';
import { Row } from 'components/row';
import { Table, TableAlign } from 'components/table';
import { Text } from 'components/text';
import { Price } from 'features/payments/price';
import { Icon } from 'components/icon';

import { orderStatusesList } from 'mocks/payments';
import { OrderStatuses } from 'types/payments';

import StatusCompleteIcon from 'public/icons/status-complete-secondary.svg';

import './index.scss';
import { Flex } from 'components/flex';

// TODO: вместо константы будут данные из стора
const orderData = {
  id: '123456789102',
  datetime: '21 дек 2020, 12:33',
  price: 96500,
  status: OrderStatuses.Return,
  commision: 2,
  events: [
    {
      datetime: '11 янв 2022 12:03',
      status: 'Возвращен',
    },
    {
      datetime: '11 янв 2021 12:03',
      status: 'В процессе',
    },
    {
      datetime: '11 янв 2020 12:03',
      status: 'Оплачен',
    },
  ],
  productsServicesList: [
    {
      name: 'Сумка на пояс Heritage All Over Print',
      count: '1',
      price: 12500,
    },
    {
      name: "Кроссовки Shane O'Neill",
      count: '3',
      price: 28000,
    },
  ],
};

type OrderInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  id: string | null;
};

const cnOrderInfoModal = cn('OrderInfoModal');

export const OrderInfoModal: FC<OrderInfoModalProps> = ({
  isOpen,
  onClose,
  id,
}) => {
  const currentOrderStatus = useMemo(
    () => orderStatusesList.find((status) => status.id === orderData.status),
    [],
  );

  const productsServicesData = useMemo(
    () =>
      orderData.productsServicesList.map((item) => ({
        ...item,
        price: <Price value={item.price} />,
      })),
    [],
  );

  const additionalBlock = useCallback(
    () => (
      <Block padding={32}>
        <Flex direction="column">
          <Table
            heading={[
              {
                title: 'Товары и услуги',
              },
              {
                title: 'Кол-во',
                align: TableAlign.right,
              },
              {
                title: 'Цена, ₽',
                align: TableAlign.right,
              },
            ]}
            data={productsServicesData}
            mods={{ headingWeight: 400, rowGap: 'var(--offset-8)' }}
          />
        </Flex>
        <Divider />
        <Row justify="between" top={12}>
          <Text>Итого</Text>
          <Price value={orderData.price} />
        </Row>
      </Block>
    ),
    [productsServicesData],
  );

  return (
    <Modal
      variant="cross-outside"
      theme="normal"
      visible={isOpen}
      onClose={onClose}
      additionalBlock={additionalBlock}
    >
      <Block className={cnOrderInfoModal()} radius={24}>
        {/* order info start */}
        <Block
          className={cnOrderInfoModal('Info')}
          padding={32}
          radius={16}
          bg="white"
        >
          <Row justify="between">
            <Text variant="header_l">
              <Price currencyVisible weight={700} value={orderData.price} />
            </Text>
            <Row gap={12}>
              <Text>{currentOrderStatus?.name}</Text>
              <Icon size={20} url={currentOrderStatus?.icon} />
            </Row>
          </Row>
          <Col gap={14} top={24}>
            <Row justify="between">
              <Text color="secondary">ID заказа</Text>
              <Text>{id}</Text>
            </Row>
            <Row justify="between">
              <Text color="secondary">Дата и время заказа</Text>
              <Text>{orderData.datetime}</Text>
            </Row>
          </Col>
        </Block>
        {/* order info end */}

        {/* order events start */}
        <Box>
          {orderData.events.map((item, key) => (
            <Row
              key={key}
              className={cnOrderInfoModal('Event')}
              align="center"
              gap={32}
            >
              <Text className={cnOrderInfoModal('EventDate')} color="secondary">
                {item.datetime}
              </Text>
              <Row className={cnOrderInfoModal('EventStatus')} gap={12}>
                <Icon size={20}>
                  <StatusCompleteIcon />
                </Icon>
                <Text>{item.status}</Text>
              </Row>
            </Row>
          ))}
        </Box>
        {/* order events end */}
      </Block>
    </Modal>
  );
};
