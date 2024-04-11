import { NextPage } from 'next';
import { Wrapper } from '@yandex/ui/MessageBox/MessageBox';
import { cn } from '@bem-react/classname';

import { Layout } from 'components/layout';
import { Text } from 'components/text';
import { MessageBox } from 'components/message-box';
import { Button } from 'components/button';
import { Box } from 'components/box';
import { Col } from 'components/col';
import { Divider } from 'components/divider';
import { Row } from 'components/row';
import { Block } from 'components/block';
import { Price } from 'features/payments/price';

import PauseIcon from 'public/icons/pause.svg';

import './index.scss';
import { BillsList } from 'features/bills/bills-list';

const billData = {
  dates: '1 янв — 31 янв 2022',
  price: 96500,
  productsList: [
    {
      title: 'Комиссия Yandex Pay Checkout',
      price: 12500,
    },
    {
      title: 'Комиссия Яндекс Доставки',
      price: 8000,
    },
    {
      title: 'Комиссия Яндекс Сплита',
      price: 3000,
    },
  ],
};

const cnAccountBillsPage = cn('AccountBills');

const supportButton = () => (
  <Button variant="message-box-white">Погасить задолженность</Button>
);

export const AccountBillsPage: NextPage = () => {
  return (
    <Layout>
      <Text variant="header_xl" as="h1" bottom={32}>
        Счета и оплата
      </Text>
      <Row bottom={32}>
        <MessageBox view="default" variant="critical">
          <Wrapper leading={<PauseIcon />} trailing={supportButton()}>
            <b>Возникла задолженность.</b> Сейчас возникла задолженность по
            оплате сервиса. Пожалуйста, погасите задолженность в кратчайшие
            сроки, чтобы продолжить принимать заказы через Yandex Pay
          </Wrapper>
        </MessageBox>
      </Row>
      <Block shadow radius={24} padding={32} bottom={32} bg="white">
        <Text variant="header_m">{billData.dates}</Text>
        <Box top={16} bottom={12}>
          {billData.productsList.map((product, key) => (
            <Row
              key={key}
              className={cnAccountBillsPage('Product')}
              justify="between"
            >
              <Col>{product.title}</Col>
              <Price currencyVisible value={product.price} />
            </Row>
          ))}
        </Box>

        <Divider />

        <Row
          className={cnAccountBillsPage('Product')}
          top={12}
          justify="between"
        >
          <Col>
            <Text weight={500}>Итого</Text>
          </Col>
          <Price currencyVisible weight={500} value={billData.price} />
        </Row>
      </Block>
      <Block shadow radius={24} padding={32} bg="white">
        <BillsList />
      </Block>
    </Layout>
  );
};
