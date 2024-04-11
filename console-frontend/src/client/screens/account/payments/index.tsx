import { NextPage } from 'next';

import { Layout } from 'components/layout';
import { Text } from 'components/text';
import { PaymentsList } from 'features/payments/payments-list';

export const AccountPaymentsPage: NextPage = () => {
  return (
    <Layout>
      <Text variant="header_xl" as="h1" bottom={32}>
        Платежи
      </Text>
      <PaymentsList />
    </Layout>
  );
};
