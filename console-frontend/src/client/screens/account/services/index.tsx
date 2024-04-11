import { NextPage } from 'next';
import { cn } from '@bem-react/classname';
import { Image } from '@yandex/ui/Image/desktop';

import { Layout } from 'components/layout';
import { Block } from 'components/block';
import { Row } from 'components/row';
import { Col } from 'components/col';
import { Text } from 'components/text';
import { Button } from 'components/button';

import MoreIcon from 'public/icons/more.svg';
import PlusFilledIcon from 'public/icons/plus-filled.svg';
import CheckoutIcon from 'public/icons/checkout.svg';
import CheckoutPercentIcon from 'public/icons/checkout-percent.svg';
import CheckoutTimeIcon from 'public/icons/checkout-time.svg';

import { basePath } from 'const';
import './index.scss';

export const cnAccountServicesPage = cn('AccountServices');

export const AccountServicesPage: NextPage = () => {
  return (
    <Layout>
      <Text as="h1" variant="header_xl" weight={700} bottom={20}>
        Сервисы
      </Text>
      <Block
        shadow
        radius={24}
        bg="white"
        bottom={24}
        className={cnAccountServicesPage('Block')}
      >
        <Row>
          <Col right={16}>
            <CheckoutIcon className={cnAccountServicesPage('BlockMainImage')} />
          </Col>
          <Col>
            <Row align="center" bottom={12}>
              <Text as="h2" variant="header_l" weight={700} right={12}>
                Yandex Pay Checkout
              </Text>
              <Text
                as="div"
                size={14}
                weight={500}
                className={cnAccountServicesPage('CheckoutMessage')}
              >
                Подключено
              </Text>
            </Row>
            <Text color="secondary" bottom={24} as="p">
              По нашим данным, рассрочка на товары может увеличить средний чек в
              5 раз и в некоторых категориях принести до +10% продаж.
            </Text>
            <Row align="center" bottom={32}>
              <Row align="center" right={16}>
                <CheckoutPercentIcon
                  className={cnAccountServicesPage('CheckoutIcon')}
                />
                <Text as="p" left={16}>
                  Комиссия <b>2%</b> с каждого успешного платежа
                </Text>
              </Row>
              <Row align="center">
                <CheckoutTimeIcon
                  className={cnAccountServicesPage('CheckoutIcon')}
                />
                <Text as="p" left={16}>
                  Пробный период заканчивается через <b>57 дней</b>
                </Text>
              </Row>
            </Row>
            <Row>
              <Button variant="outlined" view="pseudo" size="m">
                Оферта
              </Button>
              <Button variant="outlined" size="m">
                Подробнее о сервисе
                <MoreIcon
                  className={cnAccountServicesPage('ButtonIconRight')}
                />
              </Button>
            </Row>
          </Col>
          <Col>
            <Image
              className={cnAccountServicesPage('CheckoutPhone')}
              src={`${basePath}/static/feature-services/checkout-phone.png`}
              src2x={`${basePath}/static/feature-services/checkout-phone-2x.png`}
              alt="Yandex Pay Checkout"
            />
          </Col>
        </Row>
      </Block>
      <Row>
        <Block
          shadow
          radius={24}
          bg="white"
          right={24}
          className={cnAccountServicesPage('Block')}
        >
          <Row>
            <Col right={16}>
              <Image
                className={cnAccountServicesPage('BlockMainImage')}
                src={`${basePath}/static/feature-services/delivery.png`}
                alt="Доставка"
              />
            </Col>
            <Col>
              <Row align="center" bottom={12}>
                <Text as="h2" variant="header_l" weight={700}>
                  Доставка
                </Text>
              </Row>
              <Text color="secondary" bottom={24} as="p">
                Подключите Яндекс Доставку, чтобы отправлять покупки в любую
                точку России своим покупателям
              </Text>
              <Row>
                <Button variant="filled-grey" size="m">
                  <PlusFilledIcon
                    right={10}
                    className={cnAccountServicesPage('ButtonIconLeft')}
                  />
                  Подключить
                </Button>
                <Button variant="outlined" size="m">
                  Подробнее
                  <MoreIcon
                    className={cnAccountServicesPage('ButtonIconRight')}
                  />
                </Button>
              </Row>
            </Col>
          </Row>
        </Block>
        <Block
          shadow
          radius={24}
          bg="white"
          className={cnAccountServicesPage('Block')}
        >
          <Row>
            <Col right={16}>
              <Image
                className={cnAccountServicesPage('BlockMainImage')}
                src={`${basePath}/static/feature-services/installment.png`}
                alt="Рассрочка"
              />
            </Col>
            <Col>
              <Row align="center" bottom={12}>
                <Text as="h2" variant="header_l" weight={700}>
                  Рассрочка
                </Text>
              </Row>
              <Text color="secondary" bottom={24} as="p">
                Подключите Яндекс Доставку, чтобы отправлять покупки в любую
                точку России своим покупателям
              </Text>
              <Row>
                <Button variant="filled-grey" size="m">
                  <PlusFilledIcon
                    className={cnAccountServicesPage('ButtonIconLeft')}
                  />
                  Подключить
                </Button>
                <Button variant="outlined" size="m">
                  Подробнее
                  <MoreIcon
                    className={cnAccountServicesPage('ButtonIconRight')}
                  />
                </Button>
              </Row>
            </Col>
          </Row>
        </Block>
      </Row>
    </Layout>
  );
};
