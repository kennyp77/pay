import React, { FC } from 'react';
import { cn } from '@bem-react/classname';

import { Row } from 'components/row';
import { Col } from 'components/col';
import { Button } from 'components/button';
import { Icon } from 'components/icon';
import { UserPic } from 'components/user-pic';

import NotificationIcon from 'public/icons/notification.svg';
import QuestionIcon from 'public/icons/question.svg';

import './index.scss';

const cnHeader = cn('Header');

export const Header: FC = () => {
  return (
    <Row className={cnHeader()} justify="end" align="center">
      <Col>
        <Button variant="cleared-with-effects" className={cnHeader('Button')}>
          <Icon className={cnHeader('Icon')}>
            <NotificationIcon />
          </Icon>
        </Button>
      </Col>
      <Col>
        <Button variant="cleared-with-effects" className={cnHeader('Button')}>
          <Icon className={cnHeader('Icon')}>
            <QuestionIcon />
          </Icon>
        </Button>
      </Col>
      <Col left={12}>
        <UserPic size="s" />
      </Col>
    </Row>
  );
};
