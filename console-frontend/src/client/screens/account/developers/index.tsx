import { NextPage } from 'next';

import { Layout } from 'components/layout';
import { Text } from 'components/text';
import { DevelopersMerchantId } from 'features/developers/developers-merchant-id';
import { DevelopersApiKeys } from 'features/developers/developers-api-keys';
import { DevelopersIntegration } from 'features/developers/developers-integration';

export const DevelopersPage: NextPage = () => {
  return (
    <Layout>
      <Text variant="header_l" weight={700} as="h1" top={20} bottom={20}>
        Разработчикам
      </Text>
      <DevelopersMerchantId />
      <DevelopersIntegration />
      <DevelopersApiKeys />
    </Layout>
  );
};
