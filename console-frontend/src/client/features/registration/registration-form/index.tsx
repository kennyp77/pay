import React, { FC, useMemo } from 'react';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';
import { Image } from '@yandex/ui/Image/desktop';

import { Block } from 'components/block';
import { Box } from 'components/box';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { UserPic } from 'components/user-pic';
import { RegistrationSteps } from '../registration-steps';
import { RegistrationFormFirstStep } from '../registration-form-first-step';
import { RegistrationFormSecondStep } from '../registration-form-second-step';
import { RegistrationFormThirdStep } from '../registration-form-third-step';

import { useCheckPartner } from 'client/hooks/useCheckPartner';

import { Step, StepVals } from 'types/steps-type';

import { basePath } from 'const';
import './index.scss';

const cnRegistrationForm = cn('RegistrationForm');

interface IRegistrationFormProps extends IClassNameProps {
  className?: string;
  stepVal?: StepVals;
}

const RegistrationFormHead: FC<IClassNameProps> = () => {
  useCheckPartner();

  return (
    <>
      <Row className={cnRegistrationForm('header')} justify="between">
        <Image src={`${basePath}/logo-red.svg`} alt="ya-pay" height="36px" />
        <UserPic size="s" />
      </Row>
      <Row top={40}>
        <Text variant="header_l">Регистрация</Text>
      </Row>
    </>
  );
};

const steps: Step[] = [
  {
    value: StepVals.First,
    title: 'О компании',
    href: '/registration',
  },
  {
    value: StepVals.Second,
    title: 'Провайдер платежей',
    href: '/registration/providers',
  },
  {
    value: StepVals.Third,
    title: 'Система CMS',
    href: '/providers',
  },
];

export const RegistrationForm: FC<
  React.PropsWithChildren<
    IRegistrationFormProps & React.HTMLAttributes<HTMLElement>
  >
> = ({ className, stepVal = StepVals.First, ...props }) => {
  const currentStep = useMemo(
    () => steps.find((step: Step) => step.value === stepVal),
    [stepVal],
  );

  return (
    <Block className={cnRegistrationForm(null, [className])} {...props}>
      <RegistrationFormHead />
      <RegistrationSteps top={32} steps={steps} currentStep={currentStep} />
      <Box top={32}>
        {currentStep && currentStep.value === StepVals.First ? (
          <RegistrationFormFirstStep />
        ) : null}
        {currentStep && currentStep.value === StepVals.Second ? (
          <RegistrationFormSecondStep />
        ) : null}
        {currentStep && currentStep.value === StepVals.Third ? (
          <RegistrationFormThirdStep />
        ) : null}
      </Box>
    </Block>
  );
};

export type RegistrationFormProps = ExtractProps<typeof RegistrationForm>;
