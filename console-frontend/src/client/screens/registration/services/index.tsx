import { NextPage } from 'next';
import { useCallback } from 'react';
import { cn } from '@bem-react/classname';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import { AlertModal } from 'components/alert-modal';
import { Flex } from 'components/flex';
import { Col } from 'components/col';
import { RegistrationBgImage } from 'features/registration/registration-bg-image';
import { RegistrationForm } from 'features/registration/registration-form';
import { StepVals } from 'types/steps-type';
import {
  getPartnerSubmitSelector,
  getPartnerCheckingSelector,
} from 'store/partner-submit/selectors';

import { basePath, routes } from 'const';

import '../index.scss';

export const cnRegistrationPage = cn('Registration');

export const RegistrationThirdPage: NextPage = () => {
  const router = useRouter();
  const partnerSubmit = useSelector(getPartnerSubmitSelector);
  const partnerChecking = useSelector(getPartnerCheckingSelector);

  const handleModalAction = useCallback(() => {
    router.push(routes.registration.stepOne);
  }, [router]);

  return (
    <main>
      <AlertModal
        buttonText="Зарегистрироваться"
        isVisible={partnerChecking && !partnerSubmit?.partner_id}
        text={'Нужно пройти регистрацию'}
        onClose={handleModalAction}
        icon={`${basePath}/icons/alert-error.svg`}
      />
      <Flex className={cnRegistrationPage()}>
        <Col className={cnRegistrationPage('LeftSide')} justify="center">
          <RegistrationForm stepVal={StepVals.Third} />
        </Col>
        <Col className={cnRegistrationPage('RightSide')}>
          <RegistrationBgImage />
        </Col>
      </Flex>
    </main>
  );
};
