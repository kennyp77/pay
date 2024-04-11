import { FC } from 'react';
import { cn } from '@bem-react/classname';

import { Box } from 'components/box';
import { Button } from 'components/button';
import { Flex } from 'components/flex';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { Icon } from 'components/icon';

import { basePath } from 'const';
import './index.scss';

interface IInstallModuleBlock {
  installText: string;
  moduleText: string;
  moduleLink: string;
}

const cnInstallServiceModule = cn('InstallServiceModule');

export const InstallServiceModule: FC<IInstallModuleBlock> = ({
  installText,
  moduleText,
  moduleLink,
}) => {
  return (
    <>
      <Row bottom={16}>
        <Text>{installText}</Text>
      </Row>
      <Row bottom={40} align="center" justify="between">
        <Flex className={cnInstallServiceModule('Text')}>
          <Box className={cnInstallServiceModule('IconTile')}>
            <Icon
              className={cnInstallServiceModule('Icon')}
              url={`${basePath}/icons/add-module.svg`}
            />
          </Box>
          <Text left={16}>{moduleText}</Text>
        </Flex>
        <Button
          className={cnInstallServiceModule('Button')}
          type="link"
          url={moduleLink}
          variant="outlined"
          target="_blank"
        >
          Установить
        </Button>
      </Row>
    </>
  );
};
