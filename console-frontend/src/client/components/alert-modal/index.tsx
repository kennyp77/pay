import React, { FC } from 'react';
import { cn } from '@bem-react/classname';

import { Modal } from 'components/modal';
import { Text } from 'components/text';
import { Button } from 'components/button';
import { Block } from 'components/block';
import { Row } from 'components/row';
import { Col } from 'components/col';
import { Icon } from 'components/icon';

import './index.scss';

type AlertModalProps = {
  text?: string;
  icon?: string;
  buttonText: string;
  onClose?: () => void;
  isVisible: boolean;
};

const cnAlertModal = cn('AlertModal');

export const AlertModal: FC<AlertModalProps> = ({
  text,
  icon,
  buttonText,
  onClose,
  isVisible,
}) => {
  return (
    <Modal
      className={cnAlertModal()}
      variant="default"
      theme="normal"
      visible={isVisible}
      contentPadding={0}
      onClose={onClose}
    >
      <Row className={cnAlertModal('Inner')} align="stretch" justify="center">
        <Col align="center" grow>
          <Row align="center" grow>
            <Col align="center" justify="center" grow>
              <Icon url={icon} size={52} />
              <Text
                as="h2"
                className={cnAlertModal('Title')}
                bottom={4}
                variant="header_m"
                top={16}
              >
                Произошла ошибка
              </Text>
              <Text align="center" left={16} right={16}>
                {text}
              </Text>
            </Col>
          </Row>
          <Block className={cnAlertModal('Footer')} shadow padding={24}>
            <Row justify="center">
              <Button variant="red" view="action" onClick={onClose}>
                {buttonText}
              </Button>
            </Row>
          </Block>
        </Col>
      </Row>
    </Modal>
  );
};
