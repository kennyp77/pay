import React from 'react';
import { cn } from '@bem-react/classname';
import { useToggle } from 'react-use';

import { Block } from 'components/block';
import { Row } from 'components/row';
import { Col } from 'components/col';
import { Modal } from 'components/modal';
import { Text } from 'components/text';
import { Button } from 'components/button';

import DisableIcon from 'public/icons/disable.svg';

import './index.scss';

const cnAboutDeleteAccount = cn('AboutDeleteAccount');

export const AboutDeleteAccount = () => {
  const [popupVisibility, togglePopupVisibility] = useToggle(false);

  return (
    <Block shadow radius={24} bg="white" bottom={24}>
      <Row justify="between" gap={48} className={cnAboutDeleteAccount()}>
        <Col>
          <Text variant="header_m" as="h2" bottom={20}>
            Отключить Yandex Pay Checkout
          </Text>
          <Text as="p">
            При отключении сервиса, вы не сможете принимать заказы через Yandex
            Pay Checkout, кнопка оформления заказа пропадет с вашего сайта
          </Text>
        </Col>
        <Col>
          <Button
            variant="red"
            view="action"
            onClick={() => togglePopupVisibility(true)}
          >
            Отключить...
          </Button>
        </Col>
      </Row>
      <Modal
        variant="default"
        theme="normal"
        size="small"
        visible={popupVisibility}
        onClose={() => togglePopupVisibility(false)}
      >
        <Text
          variant="header_m"
          as="h2"
          bottom={20}
          align="center"
          right={56}
          left={56}
        >
          Отключение Yandex Pay Checkout
        </Text>
        <Text as="p" bottom={20}>
          Нам очень жаль, что вы приняли решение покинуть наш сервис. После
          удаления аккаунта договор с Яндексом будет прекращен.
        </Text>
        <Row direction="col" gap={20}>
          <Button
            variant="default"
            size="l"
            onClick={() => togglePopupVisibility(false)}
          >
            Оставить
          </Button>
          <Button variant="outlined" view="pseudo">
            <DisableIcon className={cnAboutDeleteAccount('disable-icon')} />
            Отключить
          </Button>
        </Row>
      </Modal>
    </Block>
  );
};
