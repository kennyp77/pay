import React, { FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from 'components/button';
import { Col } from 'components/col';
import { Row } from 'components/row';
import { Text } from 'components/text';

const cnBillEmptyFilters = cn('BillEmptyFilters');

export const BillEmptyFilters: FC = () => (
  <Col className={cnBillEmptyFilters()} align="center" justify="center">
    <Row top={24}>
      <Text align="center" variant="header_m">
        Текст
      </Text>
    </Row>
    <Row top={12}>
      <Text align="center">
        Попробуйте изменить
        <br />
        или{' '}
        <Button className={cnBillEmptyFilters('ButtonReset')} variant="as-text">
          сбросить фильтр
        </Button>
      </Text>
    </Row>
  </Col>
);
