import React, { FC } from 'react';
import { cn } from '@bem-react/classname';
import { Image } from '@yandex/ui/Image/desktop';

import { Button } from 'components/button';
import { Col } from 'components/col';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { basePath } from 'const';

const cnPaymentEmptyFilters = cn('PaymentEmptyFilters');

export const PaymentEmptyFilters: FC = () => (
  <Col className={cnPaymentEmptyFilters()} align="center" justify="center">
    <Row>
      <Image src={`${basePath}/payment-empty-img.png`} width="120px" alt="" />
    </Row>
    <Row top={24}>
      <Text align="center" variant="header_m">
        Платежей не нашлось
      </Text>
    </Row>
    <Row top={12}>
      <Text align="center">
        Попробуйте изменить
        <br />
        или{' '}
        <Button
          className={cnPaymentEmptyFilters('ButtonReset')}
          variant="as-text"
        >
          сбросить фильтр
        </Button>
      </Text>
    </Row>
  </Col>
);
