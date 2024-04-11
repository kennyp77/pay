import React from 'react';
import { cn } from '@bem-react/classname';
import { Block } from 'components/block';
import { Row } from 'components/row';
import { Box } from 'components/box';
import { Text } from 'components/text';
import { Form } from 'components/form';
import { FormInput } from 'components/form-input';
import { Button } from 'components/button';
import { aboutAdditionalContactsValidationSchema } from 'helpers/validation';

import { initialValues, aboutAdditionalContactsFormFields } from './const';

import './index.scss';

const cnAboutContactsForm = cn('AboutContactsForm');

export const AboutAdditionalContactsForm = () => {
  const onSubmit = () => {
    console.log('submit');
  };

  return (
    <Block shadow radius={24} bg="white" bottom={24}>
      <Row align="stretch" justify="center">
        <Box className={cnAboutContactsForm()}>
          <Form
            initialValues={initialValues}
            enableReinitialize={true}
            onSubmit={onSubmit}
            validationSchema={aboutAdditionalContactsValidationSchema}
          >
            {(form) => {
              return (
                <React.Fragment>
                  <Text variant="header_m" as="h2" bottom={20}>
                    Дополнительные контакты
                  </Text>
                  <Text color="secondary" as="p" bottom={20}>
                    Вы можете указать свои или контакты вашего заместителя на
                    случай, если мы не сможем связаться по основным контактам.
                  </Text>
                  <FormInput
                    {...aboutAdditionalContactsFormFields.name}
                    bottom={20}
                    value={form.name}
                  />
                  <FormInput
                    {...aboutAdditionalContactsFormFields.email}
                    bottom={20}
                    value={form.email}
                  />
                  <FormInput
                    {...aboutAdditionalContactsFormFields.phone}
                    bottom={20}
                    value={form.phone}
                  />
                  <Button variant="default" size="l">
                    Сохранить
                  </Button>
                </React.Fragment>
              );
            }}
          </Form>
        </Box>
      </Row>
    </Block>
  );
};
