import React, { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'react-use';
import { useSelector } from 'react-redux';
import { cn } from '@bem-react/classname';
import { Block } from 'components/block';
import { Row } from 'components/row';
import { Box } from 'components/box';
import { Text } from 'components/text';
import { Form, FormikSetValuesType } from 'components/form';
import { FormInput } from 'components/form-input';
import { FormCheckbox } from 'components/form-checkbox';
import { FormTumbler } from 'components/form-tumbler';
import { Button } from 'components/button';
import { Modal } from 'components/modal';
import { SupportModal } from 'components/support-modal';

import { GeoSuggest } from 'features/registration/geo-suggest';

import { getPartnerDataSelector } from 'store/partner-data/selectors';
import { aboutOrganizationValidationSchema } from 'helpers/validation';
import {
  initialValues,
  aboutOrganizationFormFields,
  AboutOrganizationFormValues,
} from './const';

import './index.scss';

import { GeoSuggestProps } from 'types/geo-type';

const cnAboutOrganizationForm = cn('AboutOrganizationForm');

export const AboutOrganizationForm = () => {
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [isReceivingOriginals, setIsReceivingOriginals] = useState(false);
  const [modalVisibility, toggleModalVisibility] = useToggle(false);
  const [supportModalOn, supportModalToggle] = useToggle(false);
  const partnerData = useSelector(getPartnerDataSelector);

  const selectAddress = useCallback(
    (
      values: AboutOrganizationFormValues,
      setValues: FormikSetValuesType<AboutOrganizationFormValues>,
      fieldName,
      address?: GeoSuggestProps['text'],
    ) => {
      setValues({
        ...values,
        [fieldName]:
          address ||
          (partnerData && partnerData[fieldName as keyof typeof partnerData]),
      });
    },
    [partnerData],
  );

  const onSubmit = () => {
    console.log('submit');
  };

  const isSameAddressText = useMemo(
    () => (
      <span className={cnAboutOrganizationForm('checkbox-text')}>
        Совпадает с адресом для корреспонденции
      </span>
    ),
    [],
  );

  const papersText = useMemo(
    () => (
      <span className={cnAboutOrganizationForm('checkbox-text')}>
        Получать бумажные оригиналы документов
      </span>
    ),
    [],
  );

  const papersAgreeHandler = useCallback(() => {
    setIsReceivingOriginals(true);
    toggleModalVisibility(false);
  }, [toggleModalVisibility]);

  return (
    <Block shadow radius={24} bg="white" bottom={24}>
      <Row align="stretch" justify="center">
        <Box className={cnAboutOrganizationForm()}>
          <Form
            initialValues={initialValues}
            enableReinitialize={true}
            onSubmit={onSubmit}
            validationSchema={aboutOrganizationValidationSchema}
          >
            {(values, form) => {
              const { setValues, errors } = form;

              return (
                <React.Fragment>
                  <Text variant="header_m" as="h2" bottom={20}>
                    Ваша организация
                  </Text>
                  <Text as="p" color="secondary" bottom={20}>
                    Если какие-то данные указаны неверно и вы хотите их
                    изменить, пожалуйста, напишите в{' '}
                    <Button
                      onClick={() => supportModalToggle(true)}
                      variant="as-link"
                    >
                      службу поддержки
                    </Button>
                    .
                  </Text>
                  <FormInput
                    {...aboutOrganizationFormFields.site}
                    bottom={20}
                    value={values.site || partnerData?.site}
                    disabled={true}
                  />
                  <FormInput
                    {...aboutOrganizationFormFields.inn}
                    bottom={20}
                    value={values.inn || partnerData?.inn}
                    disabled={true}
                  />
                  <FormInput
                    {...aboutOrganizationFormFields.company_title}
                    bottom={20}
                    value={values.company_title || partnerData?.full_name}
                    disabled={true}
                  />
                  <FormInput
                    {...aboutOrganizationFormFields.company_title_short}
                    bottom={20}
                    value={values.company_title_short || partnerData?.name}
                    disabled={true}
                  />
                  <FormInput
                    {...aboutOrganizationFormFields.ogrn}
                    bottom={20}
                    value={values.ogrn || partnerData?.ogrn}
                    disabled={true}
                  />
                  <FormInput
                    {...aboutOrganizationFormFields.director}
                    bottom={20}
                    value={values.director || partnerData?.leader_name}
                    disabled={true}
                  />
                  <GeoSuggest
                    selectItem={(address) =>
                      selectAddress(values, setValues, 'address', address)
                    }
                    addressText={values.address || partnerData?.address}
                    fieldName="address"
                    label="Адрес регистрации компании"
                    disabled={true}
                  />
                  <FormCheckbox
                    {...aboutOrganizationFormFields.same_address}
                    setChecked={() => setIsSameAddress(!isSameAddress)}
                    checked={values.same_address ? true : isSameAddress}
                    label={isSameAddressText}
                    bottom={20}
                  />
                  {!isSameAddress && (
                    <GeoSuggest
                      {...aboutOrganizationFormFields.correspondence_address}
                      selectItem={(correspondence_address) =>
                        selectAddress(
                          values,
                          setValues,
                          'correspondence_address',
                          correspondence_address,
                        )
                      }
                      addressText={
                        values.correspondence_address ||
                        partnerData?.correspondence_address
                      }
                    />
                  )}
                  <FormTumbler
                    {...aboutOrganizationFormFields.papers}
                    setChecked={() =>
                      !isReceivingOriginals
                        ? toggleModalVisibility(true)
                        : setIsReceivingOriginals(false)
                    }
                    checked={isReceivingOriginals}
                    labelAfter={papersText}
                    bottom={20}
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
      <SupportModal
        visible={supportModalOn}
        onClose={() => supportModalToggle(false)}
      />
      <Modal
        variant="default"
        theme="normal"
        size="small"
        visible={modalVisibility}
        onClose={() => toggleModalVisibility(false)}
      >
        <Text
          variant="header_m"
          as="h2"
          bottom={20}
          align="center"
          right={56}
          left={56}
        >
          Бумажные оригиналы документов
        </Text>
        <Text as="p" bottom={20}>
          Обратите внимание, что электронные версии документов полностью
          соответствуют бумажным оригиналам. Для своевременного составления
          бухгалтерской отчетности вы можете использовать номер, сумму и дату
          акта из электронной копии. Заказанные электронные копии вы получите на
          электронную почту в течение одного дня.
        </Text>
        <Text as="p" bottom={50}>
          Бумажные оригиналы документов будут отправлены Почтой России (?).
        </Text>
        <Row direction="col" gap={20}>
          <Button variant="default" size="l" onClick={papersAgreeHandler}>
            Получать бумажные оригиналы
          </Button>
          <Button
            variant="outlined"
            view="pseudo"
            onClick={() => toggleModalVisibility(false)}
          >
            Назад
          </Button>
        </Row>
      </Modal>
    </Block>
  );
};
