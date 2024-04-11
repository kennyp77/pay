import { NextPage } from 'next';
import { cn } from '@bem-react/classname';

import { Flex } from 'components/flex';
import { Col } from 'components/col';
import { RegistrationBgImage } from 'features/registration/registration-bg-image';
import { RegistrationForm } from 'features/registration/registration-form';

import './index.scss';

export const cnRegistrationPage = cn('Registration');

export const RegistrationPage: NextPage = () => {
  return (
    <main>
      <Flex className={cnRegistrationPage()}>
        <Col className={cnRegistrationPage('LeftSide')} justify="center">
          <RegistrationForm />
        </Col>
        <Col className={cnRegistrationPage('RightSide')}>
          <RegistrationBgImage />
        </Col>
      </Flex>
    </main>
  );
};
