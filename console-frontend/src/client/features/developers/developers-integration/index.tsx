import React from 'react';
import { cn } from '@bem-react/classname';
import { useToggle } from 'react-use';
import { useSelector } from 'react-redux';

import { Image } from '@yandex/ui/Image/desktop';

import { Block } from 'components/block';
import { Box } from 'components/box';
import { Col } from 'components/col';
import { Link } from 'components/link';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { SupportModal } from 'components/support-modal';

import { basePath } from 'const';
import { getProviderSubmitSelector } from 'store/partner-submit/selectors';

import './index.scss';

const cnDevelopersIntegration = cn('DevelopersIntegration');

export const DevelopersIntegration = () => {
  const [supportModalOn, supportModalToggle] = useToggle(false);

  const provider = useSelector(getProviderSubmitSelector);

  if (!provider) {
    return null;
  }

  return (
    <Block shadow radius={24} bg="white" bottom={24}>
      <Row align="stretch" justify="center">
        <Box className={cnDevelopersIntegration()}>
          <Row justify="between">
            <Col>
              <Text variant="header_m" as="h2" bottom={20}>
                Интеграция с&nbsp;платежным провайдером:{' '}
                {provider.psp_external_id.charAt(0).toUpperCase() +
                  provider.psp_external_id.slice(1)}
              </Text>
              <Text color="secondary" as="p" size={14} bottom={20}>
                Если вам нужно внести изменения в интеграцию или сменить
                платежного провайдера, обратитесь в{' '}
                <Link onClick={() => supportModalToggle(true)} pseudo>
                  <Text weight={700}>службу поддержки</Text>
                </Link>
              </Text>
            </Col>
            <Col>
              <Image
                className={cnDevelopersIntegration('Logo')}
                src={`${basePath}/provider-logo-${provider.psp_external_id}.svg`}
                alt=""
              />
            </Col>
          </Row>
        </Box>
      </Row>
      <SupportModal
        visible={supportModalOn}
        onClose={() => supportModalToggle(false)}
      />
    </Block>
  );
};
