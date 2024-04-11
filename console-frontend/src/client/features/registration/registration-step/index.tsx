import React, { FC } from 'react';
import ParsedUrlQuery from 'next/router';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';

import { Col } from 'components/col';
import { Text } from 'components/text';
import Link from 'next/link';

import './index.scss';

const cnRegistrationStep = cn('RegistrationStep');

interface IRegistrationStepProps extends IClassNameProps {
  active?: boolean;
  complete?: boolean;
  title?: string;
  href: string;
  query?: typeof ParsedUrlQuery['query'];
}

const StepInner: FC<{ title: IRegistrationStepProps['title'] }> = ({
  title,
}) => (
  <>
    <div className={cnRegistrationStep('Bar')} />
    <Text className={cnRegistrationStep('Text')} top={8} as="div" size={14}>
      {title}
    </Text>
  </>
);

export const RegistrationStep: FC<
  React.PropsWithChildren<IRegistrationStepProps>
> = ({ active, complete, title, href, query }) => {
  return (
    <Col className={cnRegistrationStep({ active, complete })}>
      {!active && complete ? (
        <Link
          href={{
            pathname: href,
            query: query,
          }}
          passHref
        >
          <a className={cnRegistrationStep('Link')}>
            <StepInner title={title} />
          </a>
        </Link>
      ) : (
        <StepInner title={title} />
      )}
    </Col>
  );
};

export type RegistrationStepProps = ExtractProps<typeof RegistrationStep>;
