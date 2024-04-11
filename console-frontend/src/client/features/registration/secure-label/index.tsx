import { FC } from 'react';
import { cn } from '@bem-react/classname';

import { Icon } from 'components/icon';

import { Box } from 'components/box';
import { Flex } from 'components/flex';
import { Text } from 'components/text';

import { basePath } from 'const';
import './index.scss';

const cnSecureLabel = cn('SecureLabel');

export const SecureLabel: FC = () => {
  return (
    <Flex className={cnSecureLabel()}>
      <Text
        right={8}
        className={cnSecureLabel('Text')}
        align="right"
        size={12}
        color="tertiary"
      >
        Надежно храним ваши данные
      </Text>
      <Box className={cnSecureLabel('Icon')}>
        <Icon size={16} url={`${basePath}/locked-icon.svg`} />
      </Box>
    </Flex>
  );
};
