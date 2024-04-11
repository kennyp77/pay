import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useToggle } from 'react-use';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';
import { useRouter } from 'next/router';
import { Formik, Form } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import { ButtonNext } from '../button-next';
import { SubmitError } from '../../../components/submit-error';
import { FormInput } from 'components/form-input';
import { FormCheckbox } from 'components/form-checkbox';
import { PartnersSuggest } from 'features/registration/partners-suggest';
import { GeoSuggest } from 'features/registration/geo-suggest';
import { OrganizationCard } from 'features/registration/organization-card';
import { Row } from 'components/row';
import { Col } from 'components/col';
import { Button } from 'components/button';
import { Text } from 'components/text';
import { Image } from '@yandex/ui/Image/desktop';

import { registrationFirstStepValidationSchema } from 'helpers/validation';
import { registrationFirstStepFields } from 'helpers/fields';

import { removeUrlProtocol } from 'helpers/utils';

import { OfferModal } from 'features/global/offer-modal';
import { QuotationModal } from './quotation-modal';

import { setPartnerDataRequest } from 'store/partner-data/actions';
import {
  fetchPartnerSubmitRequest,
  patchPartnerSubmitRequest,
} from 'store/partner-submit/actions';

import { getPartnerDataSelector } from 'store/partner-data/selectors';
import {
  getPartnerSubmitSelector,
  getSubmitErrorSelector,
  getProviderSubmitSelector,
} from 'store/partner-submit/selectors';

import { PartnerSuggestProps, PartnerDataProps } from 'types/partners-type';
import { GeoSuggestProps } from 'types/geo-type';

import {
  buttonNextStepText,
  buttonContinueText,
  initialValues,
  maxCaptchaTries,
  FormFirstStepValues,
} from './const';

import { basePath, routes } from 'const';

import { FormikSetValuesType } from 'components/form';

import './index.scss';

const cnTextinput = cn('Textinput');

interface IRegistrationFormFirstStepProps extends IClassNameProps {
  className?: string;
  onSuccess?: () => void;
}

export const RegistrationFormFirstStep: FC<
  React.PropsWithChildren<
    IRegistrationFormFirstStepProps & React.HTMLAttributes<HTMLElement>
  >
> = () => {
  const [isLoading, toggleIsLoading] = useToggle(false);
  const [isChecked, toggleIsChecked] = useToggle(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [companySelected, setCompanySelected] = useState(false);
  const [errorOnSuggest, setErrorOnSuggest] = useState<boolean>(false);
  const [isNewCompany, setIsNewCompany] = useState<boolean>(false);
  const [isCaptcha, setIsCaptcha] = useState(false);
  const [captchaIncrement, setCaptchaIncrement] = useState<number>(0);

  const [buttonText, setButtonText] = useState(buttonContinueText);
  const [offerIsVisible, setOfferIsVisible] = useState<boolean>(false);
  const [quotationIsVisible, setQuotationIsVisible] = useState<boolean>(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const partnerData = useSelector(getPartnerDataSelector);

  const partnerSubmit = useSelector(getPartnerSubmitSelector);
  const submitError = useSelector(getSubmitErrorSelector);
  const submitProvider = useSelector(getProviderSubmitSelector);
  const [isSameAddress, setIsSameAddress] = useState<boolean>(
    partnerData
      ? partnerData.address === partnerData.correspondence_address
      : false,
  );
  const [addressText, setAddressText] = useState<string>('');

  useEffect(() => {
    if (partnerData) {
      toggleIsChecked(partnerData.terms);
    }
  }, [partnerData, toggleIsChecked]);

  useEffect(() => {
    if (
      (partnerSubmit?.partner_id && partnerSubmit.merchant_id) ||
      submitProvider
    ) {
      setIsRegistered(true);
    }
  }, [partnerSubmit, submitProvider]);

  useEffect(() => {
    if (partnerData) {
      initialValues.email = partnerData.email;
      initialValues.phone = partnerData.phone;
      initialValues.site = partnerData.site;
      initialValues.kpp = partnerData.kpp;
      initialValues.ogrn = partnerData.ogrn;
      initialValues.name = partnerData.name;
      initialValues.director = partnerData.leader_name;
      initialValues.address = partnerData.address;
      initialValues.correspondence_address = partnerData.correspondence_address;
      initialValues.company_title = partnerData.full_name;
      initialValues.inn = partnerData.inn;
      initialValues.company_title_or_inn = partnerData.inn;
      initialValues.terms = partnerData.terms;

      if (partnerData.is_new_inn) {
        setIsNewCompany(partnerData.is_new_inn);
      }

      if (
        partnerData.kpp &&
        partnerData.ogrn &&
        partnerData.name &&
        partnerData.leader_name &&
        partnerData.address &&
        partnerData.full_name
      ) {
        setCompanySelected(true);
      }
    }
  }, [partnerData]);

  useEffect(() => {
    if (captchaIncrement >= maxCaptchaTries) {
      setIsCaptcha(true);
      setButtonText(buttonContinueText);
    } else if (companySelected) {
      setIsCaptcha(false);
      setButtonText(buttonNextStepText);
    } else if (!companySelected) {
      setIsCaptcha(false);
      setButtonText(buttonContinueText);
    }
  }, [captchaIncrement, companySelected]);

  const handleEdit = useCallback(
    (
      values: FormFirstStepValues,
      setValues: FormikSetValuesType<FormFirstStepValues>,
      item?: PartnerDataProps,
    ) => {
      if (!isEditing) {
        setIsEditing(true);
      }

      setValues({
        ...values,
        inn: item?.inn || partnerData?.inn,
        company_title_or_inn: item?.inn || partnerData?.inn,
        name: item?.name || partnerData?.name,
        company_title: item?.full_name || partnerData?.full_name,
        ogrn: item?.ogrn || partnerData?.ogrn,
        kpp: item?.kpp || partnerData?.kpp,
        address: item?.address || partnerData?.address,
        director: item?.leader_name || partnerData?.leader_name,
        terms: item?.terms || partnerData?.terms,
      });
    },
    [partnerData, isEditing],
  );

  const selectCompany = useCallback(
    (
      values: FormFirstStepValues,
      setValues: FormikSetValuesType<FormFirstStepValues>,
      isNew: boolean,
      inn?: PartnerSuggestProps['inn'],
      item?: PartnerDataProps,
    ) => {
      if (!isNew) {
        setButtonText(buttonNextStepText);
        setCompanySelected(true);
        setCaptchaIncrement(captchaIncrement + 1);
        setIsNewCompany(false);
      } else {
        setIsNewCompany(true);
      }

      if (item?.address) {
        setAddressText(item.address);
      }

      if (isEditing) {
        if (!isNew) {
          // выбор из саджеста при редактировании
          handleEdit(values, setValues, item);
        } else {
          // если была ошибка, то при onBlur обнуляем
          setValues({
            ...values,
            name: '',
            company_title: '',
            ogrn: '',
            kpp: '',
            address: '',
            director: '',
            inn: inn || partnerData?.inn,
            terms: initialValues.terms,
          });
        }
      } else {
        // выбор из саджеста
        setValues({
          ...values,
          inn: inn || partnerData?.inn,
          name: '',
          company_title: '',
          ogrn: '',
          kpp: '',
          address: '',
          director: '',
        });
      }
      setErrorOnSuggest(isNew);
    },
    [isEditing, captchaIncrement, handleEdit, partnerData?.inn],
  );

  const selectAddress = useCallback(
    (
      values: FormFirstStepValues,
      setValues: FormikSetValuesType<FormFirstStepValues>,
      fieldName,
      address?: GeoSuggestProps['text'],
    ) => {
      setValues({
        ...values,
        [fieldName]:
          address ||
          (partnerData && partnerData[fieldName as keyof typeof partnerData]),
      });
      fieldName === 'address' &&
        setAddressText(address || partnerData?.address || '');
    },
    [partnerData],
  );

  const handleNext = useCallback(
    (errors, values) => {
      if (isCaptcha) {
        setCaptchaIncrement(0);
      } else {
        if (errorOnSuggest) {
          setIsEditing(true);
          setButtonText(buttonNextStepText);
          setCompanySelected(true);
          setErrorOnSuggest(false);
        }
        if (isEditing) {
          setErrorOnSuggest(false);
        }

        if (!errors.length && companySelected && isEditing) {
          dispatch(
            setPartnerDataRequest({
              ...values,
              inn: values.inn,
              name: values.name,
              full_name: values.company_title,
              ogrn: values.ogrn,
              kpp: values.kpp,
              address: values.address,
              same_address: values.same_address,
              correspondence_address: values.correspondence_address,
              leader_name: values.director,
              site: values.site,
              phone: values.phone,
              email: values.email,
              terms: false,
              is_new_inn: isNewCompany,
            }),
          );
        }
      }
    },
    [
      isCaptcha,
      errorOnSuggest,
      isEditing,
      companySelected,
      dispatch,
      isNewCompany,
    ],
  );

  const onSubmitCallback = useCallback(
    (response, values, isPatch = false) => {
      if (!errorOnSuggest && partnerData) {
        dispatch(
          setPartnerDataRequest({
            ...partnerData,
            ...(!isPatch
              ? {
                  ...{
                    site: values.site,
                    email: values.email,
                    phone: values.phone,
                    terms: values.terms,
                    is_new_inn: isNewCompany,
                  },
                }
              : {
                  ...{
                    email: response.registration_data.contact.email,
                    phone: response.registration_data.contact.phone,
                  },
                }),
          }),
        );

        if (!errorOnSuggest && partnerData && response) {
          router.push({ pathname: routes.registration.stepTwo }).then(() => {
            toggleIsLoading(false);
          });
        } else {
          toggleIsLoading(false);
        }
      }
    },
    [
      dispatch,
      errorOnSuggest,
      isNewCompany,
      partnerData,
      router,
      toggleIsLoading,
    ],
  );

  const onSubmit = useCallback(
    (values, { setSubmitting }) => {
      toggleIsLoading(true);

      if (isRegistered && partnerSubmit) {
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
            (response) => onSubmitCallback(response, values, true),
          ),
        );
      } else {
        dispatch(
          fetchPartnerSubmitRequest(
            {
              name: partnerData?.name || '',
              registration_data: {
                contact: {
                  phone: values.phone,
                  email: values.email,
                },
                tax_ref_number: partnerData?.inn || '',
                ogrn: partnerData?.ogrn || '',
                kpp: partnerData?.kpp || '',
                legal_address: partnerData?.address || '',
                postal_address: addressText,
                ceo_name: partnerData?.full_name || '',
                full_company_name: partnerData?.full_name || '',
              },
            },
            (response) => onSubmitCallback(response, values),
          ),
        );
      }
      setSubmitting(false);
    },
    [
      toggleIsLoading,
      isRegistered,
      partnerSubmit,
      dispatch,
      onSubmitCallback,
      partnerData,
      addressText,
    ],
  );

  const disableNext = useCallback(
    (isValid: boolean, values: FormFirstStepValues) => {
      return (
        !isValid ||
        (!errorOnSuggest && !isValid && !isCaptcha) ||
        (companySelected && !isChecked && !isCaptcha) ||
        (isCaptcha && !values.captcha)
      );
    },
    [errorOnSuggest, isChecked, companySelected, isCaptcha],
  );

  const checkboxLabelText = useMemo(
    () => (
      <span>
        Принимаю условия{' '}
        <Button variant="as-text" onClick={() => setOfferIsVisible(true)}>
          оферты
        </Button>
        {/* TODO: Отключено перед первым выпуском в прод. Позже вернуть обратно
        {' '}
        и{' '}
        <Button variant="as-text" onClick={() => setQuotationIsVisible(true)}>
          коммерческие условия сервиса
        </Button> */}
      </span>
    ),
    [],
  );

  const isSameAddressText = useMemo(
    () => (
      <span>
        {isEditing
          ? 'Совпадает с адресом для корреспонденции'
          : 'Адрес для корреспонденции совпадает с юридическим'}
      </span>
    ),
    [isEditing],
  );

  const checkSameAddress = useCallback(
    (values, setValues: FormikSetValuesType<FormFirstStepValues>) => {
      const checkedSameAddress = !isSameAddress;
      setValues({
        ...values,
        correspondence_address: checkedSameAddress
          ? addressText || partnerData?.address
          : '',
      });
      setIsSameAddress(checkedSameAddress);
    },
    [addressText, partnerData?.address, isSameAddress],
  );

  return (
    <>
      <Formik
        initialValues={initialValues}
        validateOnMount={true}
        onSubmit={onSubmit}
        validationSchema={registrationFirstStepValidationSchema(isEditing)}
        enableReinitialize={true}
      >
        {(formik) => {
          const { errors, values, touched, setValues, isValid } = formik;

          return (
            <Form>
              <Text variant="header_m" as="h2" bottom={20}>
                Укажите ваши контакты
              </Text>
              <FormInput
                {...registrationFirstStepFields.email}
                bottom={20}
                value={values.email}
              />
              <FormInput {...registrationFirstStepFields.phone} bottom={20} />
              <Text variant="header_m" as="h2" bottom={20}>
                Ваша организация (резидент РФ)
              </Text>
              <FormInput
                {...registrationFirstStepFields.site}
                className={cnTextinput('url-format')}
                value={values.site && removeUrlProtocol(values.site)}
                bottom={20}
                disabled={isRegistered && partnerData?.site !== ''}
              />
              <PartnersSuggest
                touched={touched.company_title_or_inn}
                error={errors.company_title_or_inn}
                selectItem={(isNew, inn, item) =>
                  selectCompany(values, setValues, Boolean(isNew), inn, item)
                }
                isEditing={isEditing}
                disabled={isRegistered}
              />
              {isCaptcha ? (
                <Row justify="between" gap={24} bottom={40}>
                  <Col grow>
                    <FormInput
                      {...registrationFirstStepFields.captcha}
                      bottom={20}
                    />
                  </Col>
                  <Image
                    src={`${basePath}/static/captcha.png`}
                    alt=""
                    width={238}
                  />
                </Row>
              ) : (
                <>
                  {companySelected && partnerData && !isEditing ? (
                    <OrganizationCard
                      {...partnerData}
                      handleEdit={() => handleEdit(values, setValues)}
                      isEditing={!isRegistered}
                    />
                  ) : null}
                  {isEditing ? (
                    <>
                      <FormInput
                        {...registrationFirstStepFields.company_title}
                        bottom={20}
                        value={values.company_title}
                      />
                      <FormInput
                        {...registrationFirstStepFields.name}
                        bottom={20}
                        value={values.name}
                      />
                      <FormInput
                        {...registrationFirstStepFields.ogrn}
                        bottom={20}
                        disabled={!isNewCompany}
                        value={values.ogrn}
                      />
                      <FormInput
                        {...registrationFirstStepFields.kpp}
                        bottom={20}
                        value={values.kpp}
                      />
                      <FormInput
                        {...registrationFirstStepFields.director}
                        bottom={20}
                        value={values.director}
                      />
                      <GeoSuggest
                        selectItem={(address) =>
                          selectAddress(values, setValues, 'address', address)
                        }
                        addressText={values.address}
                        fieldName="address"
                      />
                    </>
                  ) : null}
                  {companySelected && (
                    <>
                      <FormCheckbox
                        {...registrationFirstStepFields.same_address}
                        setChecked={() => checkSameAddress(values, setValues)}
                        checked={isSameAddress}
                        label={isSameAddressText}
                        bottom={20}
                        disabled={isRegistered}
                      />
                      {!isSameAddress ? (
                        <GeoSuggest
                          {...registrationFirstStepFields.correspondence_address}
                          selectItem={(correspondence_address) =>
                            selectAddress(
                              values,
                              setValues,
                              'correspondence_address',
                              correspondence_address,
                            )
                          }
                          addressText={values.correspondence_address}
                        />
                      ) : null}
                      <FormCheckbox
                        {...registrationFirstStepFields.terms}
                        setChecked={() => toggleIsChecked(!isChecked)}
                        checked={values.terms ? true : isChecked}
                        label={checkboxLabelText}
                        bottom={20}
                      />
                    </>
                  )}
                </>
              )}
              {!partnerSubmit && partnerData && submitError ? (
                <SubmitError />
              ) : null}
              <ButtonNext
                type={
                  (!errorOnSuggest || companySelected) && !isCaptcha
                    ? 'submit'
                    : 'link'
                }
                disabled={disableNext(isValid, values)}
                onClick={() => handleNext(errors, values)}
                withIconNext={companySelected && !isCaptcha}
                progress={isLoading}
              >
                {buttonText}
              </ButtonNext>
            </Form>
          );
        }}
      </Formik>
      <OfferModal
        isOpen={offerIsVisible}
        onClose={() => setOfferIsVisible(false)}
      />

      {/* TODO: Отключено перед первым выпуском в прод. Позже вернуть обратно
      <QuotationModal
        isOpen={quotationIsVisible}
        onClose={() => setQuotationIsVisible(false)}
      />
        */}
    </>
  );
};

export type RegistrationFormProps = ExtractProps<
  typeof RegistrationFormFirstStep
>;
