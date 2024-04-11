import React, { FC, useCallback, useMemo, useState, useEffect } from 'react';
import { useToggle } from 'react-use';
import { useRouter } from 'next/router';
import { ExtractProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';
import { useDispatch, useSelector } from 'react-redux';

import { SubmitError } from 'components/submit-error';
import { useFormikContext, FormikValues, FormikErrors } from 'formik';

import { Box } from 'components/box';
import { ProviderProps } from 'types/providers-type';
import { Button } from 'components/button';
import { ButtonNext } from '../button-next';
import { Form } from 'components/form';
import { Col } from 'components/col';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { Providers } from '../providers';
import { Alerts } from './alerts';
import { FutureProviders } from 'features/registration/future-providers';

import { setPartnerDataRequest } from 'store/partner-data/actions';
import { getPartnerDataSelector } from 'store/partner-data/selectors';
import { getProviderSubmitSelector } from 'store/partner-submit/selectors';

import {
  getPartnerSubmitSelector,
  getSubmitErrorSelector,
  getProviderApplicationSelector,
} from 'store/partner-submit/selectors';
import { ProviderApplicationState } from 'types/providers-type';

import { fetchProviderSubmitRequest } from 'store/partner-submit/actions';

import { registrationSecondStepValidationSchema } from 'helpers/validation';
import { routes } from 'const';

import './index.scss';

const cnRegistrationFormSecondStep = cn('RegistrationFormSecondStep');

export const RegistrationFormSecondStep: FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const partnerData = useSelector(getPartnerDataSelector);

  const partnerSubmit = useSelector(getPartnerSubmitSelector);
  const submitError = useSelector(getSubmitErrorSelector);
  const providerApplication = useSelector(getProviderApplicationSelector);
  const providerData = useSelector(getProviderSubmitSelector);

  const [isLoading, toggleIsLoading] = useToggle(false);
  const [openFutureProviders, toggleOpenFutureProviders] = useToggle(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderProps | null>(null);

  useEffect(() => {
    if (openFutureProviders) {
      setSelectedProvider(null);
    }
  }, [openFutureProviders]);

  const onSubmit = useCallback(
    (values: FormikValues, { setSubmitting }) => {
      if (providerData) {
        router.push({ pathname: routes.registration.stepThree });
      } else {
        if (partnerSubmit?.merchant_id && selectedProvider) {
          setSubmitting(false);
          toggleIsLoading(true);

          dispatch(
            fetchProviderSubmitRequest(
              partnerSubmit.merchant_id,
              {
                psp_external_id: selectedProvider.id,
                creds: JSON.stringify(values),
              },
              () => {
                router
                  .push({ pathname: routes.registration.stepThree })
                  .then(() => {
                    toggleIsLoading(false);
                  });
              },
              () => toggleIsLoading(false),
            ),
          );
          if (partnerData) {
            // FIXME: зачем тут?
            dispatch(
              setPartnerDataRequest({
                ...partnerData,
                provider: {
                  id: selectedProvider.id,
                  creds: JSON.stringify(values),
                },
              }),
            );
          }
        }
      }
    },
    [
      providerData,
      router,
      partnerSubmit,
      selectedProvider,
      toggleIsLoading,
      dispatch,
      partnerData,
    ],
  );

  const onBack = useCallback(() => {
    router.push(routes.registration.stepOne);
  }, [router]);

  const initialValues = useMemo(() => {
    const newValues: FormikValues = {};
    if (!selectedProvider) {
      return newValues;
    }
    selectedProvider?.fields.forEach((field) => {
      if (!newValues[field.name]) {
        newValues[field.name] = '';
      }
    });
    return newValues;
  }, [selectedProvider]);

  const disableNext = useCallback(
    (errors: FormikErrors<FormikValues>) => {
      if (providerData) {
        return false;
      } else {
        return (
          (!selectedProvider &&
            providerApplication?.state !==
              ProviderApplicationState.SUCCESSED) ||
          Object.keys(errors).length > 0
        );
      }
    },
    [selectedProvider, providerApplication, providerData],
  );

  const ButtonNextHandleErrors = () => {
    const { errors } = useFormikContext();

    return (
      <ButtonNext
        progress={isLoading}
        disabled={disableNext(errors)}
        withIconNext={true}
      >
        К выбору системы CMS
      </ButtonNext>
    );
  };

  return (
    <Form
      initialValues={initialValues}
      validateOnMount={true}
      enableReinitialize={true}
      onSubmit={onSubmit}
      validationSchema={registrationSecondStepValidationSchema}
    >
      <Box bottom={32}>
        <Alerts
          state={providerApplication?.state}
          providerName={providerApplication?.name}
        />
      </Box>
      <Row justify="between" align="center" bottom={20} gap={12} wrap="wrap">
        <Text variant="header_m" as="h2">
          Ваш платежный провайдер
        </Text>
        <Button
          className={cnRegistrationFormSecondStep('toggleProvidersBtn')}
          variant="as-text"
          size="s"
          onClick={() => toggleOpenFutureProviders()}
        >
          {openFutureProviders
            ? 'Выбрать из списка'
            : 'У меня другой провайдер'}
        </Button>
      </Row>
      {!openFutureProviders ? (
        <Providers select={(provider) => setSelectedProvider(provider)} />
      ) : (
        <FutureProviders />
      )}
      {submitError ? <SubmitError /> : null}
      <Row className={cnRegistrationFormSecondStep('Buttons')}>
        <Col className={cnRegistrationFormSecondStep('Buttons', ['Back'])}>
          <Button variant="outlined" view="pseudo" width="max" onClick={onBack}>
            Назад
          </Button>
        </Col>
        <Col className={cnRegistrationFormSecondStep('Buttons', ['Next'])}>
          <ButtonNextHandleErrors />
        </Col>
      </Row>
    </Form>
  );
};

export type RegistrationFormSecondStepProps = ExtractProps<
  typeof RegistrationFormSecondStep
>;
