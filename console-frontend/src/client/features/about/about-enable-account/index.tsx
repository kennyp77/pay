import React from 'react';
import { cn } from '@bem-react/classname';
import { useToggle } from 'react-use';

import { Block } from 'components/block';
import { Row } from 'components/row';
import { Col } from 'components/col';
import { Text } from 'components/text';
import { Button } from 'components/button';

import { OfferModal } from 'features/global/offer-modal';

import './index.scss';

const cnAboutEnableAccount = cn('AboutEnableAccount');

export const AboutEnableAccount = () => {
  const [popupVisibility, togglePopupVisibility] = useToggle(false);

  return (
    <Block shadow radius={24} bg="white" bottom={24}>
      <Row justify="between" gap={48} className={cnAboutEnableAccount()}>
        <Col>
          <Text variant="header_m" as="h2" bottom={20}>
            Включить Yandex Pay Checkout
          </Text>
          <Text as="p">
            Сейчас Yandex Pay Checkout для вашего магазина выключен. Включите,
            чтобы продолжить принимать заказы с наилучшей конверсией
          </Text>
        </Col>
        <Col>
          <Button
            variant="default"
            size="l"
            onClick={() => togglePopupVisibility(true)}
          >
            Включить
          </Button>
        </Col>
      </Row>
      <OfferModal
        isOpen={popupVisibility}
        onClose={() => togglePopupVisibility(false)}
      />
    </Block>
  );
};
