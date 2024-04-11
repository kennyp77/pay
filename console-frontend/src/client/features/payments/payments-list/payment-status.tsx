import React, { FC, useMemo } from 'react';

import { Text } from 'components/text';
import { Icon } from 'components/icon';
import { Row } from 'components/row';
import { Col } from 'components/col';

import { OrderStatuses } from 'types/payments';
import { orderStatusesList } from 'mocks/payments';

type PaymentStatusProps = {
  status: OrderStatuses;
  cardPath: number;
  description?: string;
};

export const PaymentStatus: FC<PaymentStatusProps> = ({
  status,
  cardPath,
  description,
}) => {
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
        <Text variant="label">
          {`${description ? description : ''} • ${cardPath}`}
        </Text>
      </Col>
    </Row>
  );
};
