import React, { FC, useEffect, useCallback } from 'react';
import { cn } from '@bem-react/classname';
import { useDispatch, useSelector } from 'react-redux';

import { Block } from 'components/block';
import { Row } from 'components/row';
import { Box } from 'components/box';
import { Text } from 'components/text';
import { Form } from 'components/form';
import { FormInput } from 'components/form-input';
import { Button } from 'components/button';

import { aboutContactsValidationSchema } from 'helpers/validation';
import { getPartnerSubmitSelector } from 'store/partner-submit/selectors';
import { getPartnerDataSelector } from 'store/partner-data/selectors';
import { setPartnerDataRequest } from 'store/partner-data/actions';
import { patchPartnerSubmitRequest } from 'store/partner-submit/actions';

import { initialValues, aboutContactsFormFields } from './const';

import './index.scss';

const cnAboutContactsForm = cn('AboutContactsForm');

export const AboutContactsForm: FC = () => {
  const dispatch = useDispatch();
  const partnerData = useSelector(getPartnerDataSelector);
  const partnerSubmit = useSelector(getPartnerSubmitSelector);

  useEffect(() => {
    if (partnerData) {
      initialValues.email = partnerData.email;
      initialValues.phone = partnerData.phone;
    }
  }, [partnerData]);

  const saveData = useCallback(
    (values) => {
      if (partnerSubmit) {
        dispatch(
          patchPartnerSubmitRequest(
            {
              value: {
                name: partnerSubmit?.name || '',
                registration_data: {
                  contact: {
                    phone: values.phone,
                    email: values.email,
                  },
                },
              },
              partnerID: partnerSubmit.partner_id,
            },
            (response) => {
              if (partnerData) {
                dispatch(
                  setPartnerDataRequest({
                    ...partnerData,
                    email: response.registration_data.contact.email,
                    phone: response.registration_data.contact.phone,
                  }),
                );
              }
            },
          ),
        );
      }
    },
    [dispatch, partnerData, partnerSubmit],
  );

  return (
    <Block shadow radius={24} bg="white" bottom={24}>
      <Row align="stretch" justify="center">
        <Box className={cnAboutContactsForm()}>
          <Form
            initialValues={initialValues}
            enableReinitialize={true}
            onSubmit={saveData}
            validationSchema={aboutContactsValidationSchema}
          >
            {(values, form) => {
              const { errors } = form;

              return (
                <React.Fragment>
                  <Text variant="header_m" as="h2" bottom={20}>
                    Ваши контакты
                  </Text>
                  <FormInput
                    {...aboutContactsFormFields.email}
                    bottom={20}
                    value={values.email}
                  />
                  <FormInput
                    {...aboutContactsFormFields.phone}
                    bottom={20}
                    value={values.phone}
                  />
                  <Button
                    variant="default"
                    size="l"
                    type="submit"
                    disabled={Object.keys(errors).length !== 0}
                  >
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
