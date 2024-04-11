import React, { FC } from 'react';
import { cn } from '@bem-react/classname';

import { Text } from 'components/text';
import { Block } from 'components/block';
import { Row } from 'components/row';
import { Col } from 'components/col';
import { Button } from 'components/button';

import { PartnerSuggestProps } from 'types/partners-type';
import { toTextMask, toOgrnMask } from 'helpers/utils';

import './index.scss';

interface IOrganizationCardProps extends PartnerSuggestProps {
  handleEdit: () => void;
  isEditing?: boolean;
}

export const OrganizationCard: FC<IOrganizationCardProps> = ({
  name,
  inn,
  ogrn,
  kpp,
  address,
  full_name,
  leader_name,
  handleEdit,
  isEditing = true,
}) => {
  return (
    <Block
      padding={24}
      top={20}
      bottom={20}
      radius={16}
      bg="grey"
      className={cn('Organization-Card')()}
    >
      <Text variant="header_m" as="h2" top={0} bottom={16}>
        {name}
      </Text>
      <Row bottom={16}>
        <Col>
          <Text variant="label">Полное наименование</Text>
          <Text>{full_name}</Text>
        </Col>
      </Row>
      <Row gap={16}>
        <Col bottom={16}>
          <Text variant="label">ИНН</Text>
          <Text>{toTextMask(inn, 4)}</Text>
        </Col>
        <Col bottom={16}>
          <Text variant="label">ОГРН/ОГРНИП</Text>
          <Text>{toOgrnMask(ogrn)}</Text>
        </Col>
        {kpp ? (
          <Col bottom={16}>
            <Text variant="label">КПП</Text>
            <Text>{toTextMask(kpp)}</Text>
          </Col>
        ) : null}
      </Row>
      <Row bottom={16}>
        <Col>
          <Text variant="label">Юридический адрес</Text>
          <Text>{address}</Text>
        </Col>
      </Row>
      <Row bottom={16}>
        <Col>
          <Text variant="label">Директор</Text>
          <Text>{leader_name}</Text>
        </Col>
      </Row>
      {isEditing ? (
        <Button variant="cleared" onClick={() => handleEdit()}>
          Редактировать
        </Button>
      ) : null}
    </Block>
  );
};
