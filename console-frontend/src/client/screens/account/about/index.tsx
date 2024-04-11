import { NextPage } from 'next';

import { Layout } from 'components/layout';
import { Text } from 'components/text';
import { AboutEnableAccount } from 'features/about/about-enable-account';
import { AboutContactsForm } from 'features/about/about-contacts-form';
import { AboutOrganizationForm } from 'features/about/about-organization-form';
import { AboutDeleteAccount } from 'features/about/about-delete-account';

export const AboutMainPage: NextPage = () => {
  return (
    <Layout>
      <Text variant="header_l" weight={700} as="h1" top={20} bottom={20}>
        Информация о магазине
      </Text>
      <AboutEnableAccount />
      <AboutContactsForm />
      <AboutOrganizationForm />
      <AboutDeleteAccount />
    </Layout>
  );
};
