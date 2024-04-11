import React, { FC } from 'react';

import { Text } from 'components/text';

export const SubmitError: FC = () => (
  <Text top={40} bottom={40} as="div" color="error" align="center">
    Что-то пошло не так. Попробуйте повторить попытку
  </Text>
);
