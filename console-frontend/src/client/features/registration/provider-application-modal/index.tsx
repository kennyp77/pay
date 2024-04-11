import React, { FC, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';

import { Image } from '@yandex/ui/Image/desktop';
import { Modal } from 'components/modal';
import { Row } from 'components/row';
import { Button } from 'components/button';
import { Text } from 'components/text';
import { FormInput } from 'components/form-input';
import { FormSelect } from 'components/form-select';

import { fetchProviderApplicationSubmitRequest } from 'store/partner-submit/actions';
import { getPartnerDataSelector } from 'store/partner-data/selectors';
import { setPartnerDataRequest } from 'store/partner-data/actions';
import { getPartnerSubmitSelector } from 'store/partner-submit/selectors';

import { providerApplicationValidationSchema } from 'helpers/validation';
import { providerApplicationFields } from 'helpers/fields';
import { basePath } from 'const';

type ProviderApplicationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  infoText: string;
  providerName: string;
};

interface FormProviderApplicationValues {
  name?: string;
  monthly_turnover?: string;
  average_bill?: string;
  email?: string;
  phone?: string;
}

const initialValues: FormProviderApplicationValues = {
  name: '',
  monthly_turnover: '',
  average_bill: '',
  email: '',
  phone: '',
};

export const ProviderApplicationModal: FC<ProviderApplicationModalProps> = ({
  providerName,
  image,
  isOpen,
  infoText,
  onClose,
}) => {
  const [formIsSubmitted, setFormIsSubmitted] = useState(false);
  const partnerData = useSelector(getPartnerDataSelector);
  const partnerSubmit = useSelector(getPartnerSubmitSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (partnerData) {
      initialValues.email = partnerData.email;
      initialValues.phone = partnerData.phone;
      initialValues.name = partnerData.leader_name;
    }
  }, [partnerData]);

  const onSubmit = useCallback(
    (values, { setSubmitting }) => {
      if (partnerSubmit?.merchant_id) {
        dispatch(
          fetchProviderApplicationSubmitRequest(
            partnerSubmit.merchant_id,
            providerName,
            values,
          ),
        );
        if (partnerData) {
          dispatch(
            setPartnerDataRequest({
              ...partnerData,
              email: values.email,
              phone: values.phone,
              leader_name: values.name,
            }),
          );
        }
        setFormIsSubmitted(true);
        setSubmitting(false);
      }
    },
    [dispatch, partnerData, partnerSubmit, providerName],
  );

  return (
    <Modal
      variant="default"
      size="small"
      theme="normal"
      visible={isOpen}
      onClose={onClose}
    >
      {!formIsSubmitted ? (
        <>
          <Row justify="center" bottom={20} top={56}>
            <Image
              src={`${basePath}${image}`}
              alt={providerName}
              height="var(--size-48)"
            />
          </Row>
          <Row justify="center" bottom={20}>
            <Text
              align="center"
              dangerouslySetInnerHTML={{ __html: infoText }}
            />
          </Row>

          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={providerApplicationValidationSchema}
          >
            {(formik) => {
              const { errors } = formik;

              return (
                <Form>
                  <FormInput {...providerApplicationFields.name} bottom={28} />
                  <FormSelect
                    {...providerApplicationFields.monthly_turnover}
                    bottom={28}
                    label="Среднемесячный оборот компании"
                    hint="Фактический или прогнозный"
                  />
                  <FormSelect
                    {...providerApplicationFields.average_bill}
                    bottom={20}
                    label="Средний чек"
                  />
                  <FormInput {...providerApplicationFields.email} bottom={28} />
                  <FormInput {...providerApplicationFields.phone} bottom={28} />
                  <Button
                    variant="red"
                    view="action"
                    width="max"
                    type="submit"
                    disabled={Object.keys(errors).length !== 0}
                  >
                    Отправить заявку на подключение
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </>
      ) : (
        <>
          <Text as="p" align="center" top={40} bottom={40}>
            Подключаем провайдера {providerName}. Это займет 1-2 дня.
            <br />О результате сообщим на <a href="">{partnerData?.email}</a>
          </Text>
          <Button variant="red" view="action" width="max" onClick={onClose}>
            Закрыть
          </Button>
        </>
      )}
    </Modal>
  );
};
