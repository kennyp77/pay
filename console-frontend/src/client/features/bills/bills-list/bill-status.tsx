import React, { FC, useMemo } from 'react';

import { Text } from 'components/text';
import { Icon } from 'components/icon';
import { Row } from 'components/row';
import { Col } from 'components/col';

import { OrderStatuses } from 'types/bills';
import { orderStatusesList } from 'mocks/bills';

type BillStatusProps = {
  status: OrderStatuses;
};

export const BillStatus: FC<BillStatusProps> = ({ status }) => {
  const currentStatus = useMemo(
    () => orderStatusesList.find((s) => s.id === status),
    [status],
  );

  return (
    <Row align="center">
      <Col right={12}>
        <Icon size={20} url={currentStatus?.icon} />
      </Col>
      <Col>
        <Text>{currentStatus?.name}</Text>
      </Col>
    </Row>
  );
};
