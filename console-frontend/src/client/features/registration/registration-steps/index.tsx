import React, { FC } from 'react';
import { useRouter } from 'next/router';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';

import { Row, RowProps } from 'components/row';
import { RegistrationStep } from '../registration-step';

import { Step, StepVals } from 'types/steps-type';

const cnRegistrationSteps = cn('RegistrationSteps');

import './index.scss';

interface IRegistrationStepsProps extends IClassNameProps, RowProps {
  className?: string;
  steps: Step[];
  currentStep?: Step;
}

export const RegistrationSteps: FC<
  React.PropsWithChildren<
    IRegistrationStepsProps & React.HTMLAttributes<HTMLElement>
  >
> = ({ className, steps, currentStep, ...props }) => {
  const { query } = useRouter();

  return (
    <Row
      className={cnRegistrationSteps(null, [className])}
      gap={8}
      justify="center"
      {...props}
    >
      {steps.map((step) => (
        <RegistrationStep
          key={step.value}
          active={currentStep?.value === step.value}
          complete={currentStep ? step.value < currentStep.value : false}
          title={step?.title}
          href={step.href}
          query={step.value !== StepVals.First ? query : undefined}
        />
      ))}
    </Row>
  );
};

export type RegistrationStepsProps = ExtractProps<typeof RegistrationSteps>;
