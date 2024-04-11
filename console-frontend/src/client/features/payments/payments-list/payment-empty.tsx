import React, { FC } from 'react';
import { cn } from '@bem-react/classname';
import { Image } from '@yandex/ui/Image/desktop';

import { Col } from 'components/col';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { basePath } from 'const';

const cnPaymentEmpty = cn('PaymentEmpty');

export const PaymentEmpty: FC = () => (
  <Col className={cnPaymentEmpty()} align="center" justify="center">
    <Row>
      <Image src={`${basePath}/payment-empty-img.png`} width="120px" alt="" />
    </Row>
    <Row top={24}>
      <Text align="center" variant="header_m">
        Платежей пока нет
      </Text>
    </Row>
    <Row top={12}>
      <Text align="center">
        Скоро покупатели начнут делать покупки у вас на сайте, а мы покажем их
        платежи здесь
      </Text>
    </Row>
  </Col>
);
