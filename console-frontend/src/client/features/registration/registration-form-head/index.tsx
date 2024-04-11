import React, { FC } from 'react';
import { IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';
import { Image } from '@yandex/ui/Image/desktop';

import { Row } from 'components/row';
import { Text } from 'components/text';
import { UserPic } from 'components/user-pic';
import { basePath } from 'const';

const cnRegistrationForm = cn('RegistrationForm');

export const RegistrationFormHead: FC<IClassNameProps> = () => {
  return (
    <React.Fragment>
      <Row className={cnRegistrationForm('header')} justify="between">
        <Image src={`${basePath}/logo.svg`} alt="ya-pay" height="36px" />
        <UserPic size="s" />
      </Row>
      <Row top={40}>
        <Text variant="header_l">Регистрация</Text>
      </Row>
    </React.Fragment>
  );
};
