import React, { FC } from 'react';
import { cn } from '@bem-react/classname';

import { Col } from 'components/col';
import { Row } from 'components/row';
import { Text } from 'components/text';

const cnBillEmpty = cn('BillEmpty');

export const BillEmpty: FC = () => (
  <Col className={cnBillEmpty()} align="center" justify="center">
    <Row top={24}>
      <Text align="center" variant="header_m">
        Текст
      </Text>
    </Row>
  </Col>
);
