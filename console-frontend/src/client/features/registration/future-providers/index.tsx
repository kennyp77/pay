import React, { FC } from 'react';
import { cn } from '@bem-react/classname';
import { Box } from 'components/box';
import { Text } from 'components/text';

import { FutureProviderCard } from './future-provider-card';

import { providers } from 'mocks/providers';

type FutureProvidersProps = unknown;

const cnFutureProviders = cn('FutureProviders');

export const FutureProviders: FC<FutureProvidersProps> = () => {
  return (
    <Box as="article" className={cnFutureProviders()} bottom={40}>
      <Text as="p" bottom={20}>
        Чтобы подключить Yandex Pay нужно быть клиентом одного наших из
        эквайров-партнеров. Подключите второй эквайринг, чтобы использовать
        Yandex Pay — это просто!{' '}
      </Text>
      {providers.future_providers_list.map((provider, index) => (
        <FutureProviderCard
          key={index}
          {...provider}
          bankList={provider.banks_list}
        />
      ))}
    </Box>
  );
};
