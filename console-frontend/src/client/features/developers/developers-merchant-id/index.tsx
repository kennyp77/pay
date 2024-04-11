import React from 'react';
import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';

import { Block } from 'components/block';
import { Row } from 'components/row';
import { Box } from 'components/box';
import { Text } from 'components/text';
import { TextinputClipboard } from 'components/text-input-clipboard';

import { getPartnerSubmitSelector } from 'store/partner-submit/selectors';

import './index.scss';

const cnDevelopersMerchantId = cn('DevelopersMerchantId');

export const DevelopersMerchantId = () => {
  const partnerSubmit = useSelector(getPartnerSubmitSelector);

  return (
    <Block shadow radius={24} bg="white" bottom={24}>
      <Row align="stretch" justify="center">
        <Box className={cnDevelopersMerchantId()}>
          <Text variant="header_m" as="h2" bottom={20}>
            Merchant ID
          </Text>
          <Text color="secondary" as="p" size={14} bottom={20}>
            Если требуется, впишите этот параметр в настройках вашей CMS для
            того, чтобы Yandex Pay Checkout заработал.
          </Text>
          {partnerSubmit ? (
            <TextinputClipboard value={partnerSubmit.merchant_id} />
          ) : null}
        </Box>
      </Row>
    </Block>
  );
};
