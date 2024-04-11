import React, { FC, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ExtractProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';
import { useToggle } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';

import { Box } from 'components/box';
import { Button } from 'components/button';
import { ButtonNext } from '../button-next';
import { Col } from 'components/col';
import { Form } from 'components/form';
import { Icon } from 'components/icon';
import { Link } from 'components/link';
import { Row } from 'components/row';
import { Services } from '../services';
import { ServicesSuggest } from '../services-suggest';
import { Text } from 'components/text';
import { InstallServiceModule } from '../services-install-module';

import { setPartnerDataRequest } from 'store/partner-data/actions';
import { getPartnerDataSelector } from 'store/partner-data/selectors';
import { getPartnerSubmitSelector } from 'store/partner-submit/selectors';

import { ServiceProps } from 'types/services-type';

import { routes, queryParams, basePath } from 'const';
import { services } from 'mocks/services';

import './index.scss';

interface FormThirdStepValues {
  service?: string;
  anotherService?: string;
}

const cnRegistrationFormThirdStep = cn('RegistrationFormThirdStep');

export const RegistrationFormThirdStep: FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const partnerData = useSelector(getPartnerDataSelector);
  const partnerSubmit = useSelector(getPartnerSubmitSelector);

  const [selectedService, setSelectedService] = useState<ServiceProps | null>(
    null,
  );
  const [sendAnotherService, toggleSendAnotherService] = useToggle(false);
  const [isSending, toggleIsSending] = useToggle(false);

  const isAnotherService = useCallback((service: ServiceProps) => {
    return service?.is_another;
  }, []);

  useEffect(() => {
    if (partnerData && partnerData.service) {
      const serviceFromStore = services.services_list.find(
        (service) => service.name === partnerData.service,
      );

      if (serviceFromStore) {
        setSelectedService(serviceFromStore);
      }
    }
  }, [partnerData]);

  const onSubmit = useCallback(
    (values: FormThirdStepValues, { setSubmitting }) => {
      toggleIsSending(true);
      // пример успешного запроса (пока нет апи)
      setTimeout(() => {
        setSubmitting(false);
      }, 400);
      setTimeout(() => {
        toggleIsSending(false);
      }, 3000);
    },
    [toggleIsSending],
  );

  const onBack = useCallback(() => {
    router.push({
      pathname: routes.registration.stepTwo,
      query: partnerSubmit
        ? { [queryParams.partnerId]: partnerSubmit.partner_id }
        : null,
    });
  }, [partnerSubmit, router]);

  const onBackAnother = useCallback(() => {
    toggleSendAnotherService(false);
  }, [toggleSendAnotherService]);

  const onSend = useCallback(() => {
    if (partnerData) {
      dispatch(
        setPartnerDataRequest({
          ...partnerData,
          service: selectedService?.name,
        }),
      );

      router.push({ pathname: routes.account.about });
    }
  }, [dispatch, partnerData, selectedService?.name, router]);

  const onSendAnother = useCallback(
    (anotherService: FormThirdStepValues['anotherService']) => {
      if (partnerData) {
        dispatch(
          setPartnerDataRequest(
            {
              ...partnerData,
              service_name: anotherService,
            },
            () => {
              toggleSendAnotherService(true);
            },
          ),
        );
      }
    },
    [partnerData, dispatch, toggleSendAnotherService],
  );

  const initialValues: FormThirdStepValues = {
    anotherService: '',
  };

  return (
    <Form initialValues={initialValues} onSubmit={onSubmit}>
      {(form) => {
        const { anotherService } = form;

        return (
          <React.Fragment>
            <Row bottom={20} gap={12}>
              <Text variant="header_m" as="h2">
                Осталось скачать модуль для CMS
              </Text>
            </Row>

            {/* service-select */}
            <Row bottom={40} gap={12}>
              <Services onSelect={(service) => setSelectedService(service)} />
            </Row>

            {/* selected CMS  */}
            {selectedService && !isAnotherService(selectedService) ? (
              <Box bottom={40}>
                <InstallServiceModule
                  installText={selectedService.install_text || ''}
                  moduleText={selectedService.install_module?.name || ''}
                  moduleLink={selectedService.install_module?.link || ''}
                />
              </Box>
            ) : null}

            {/* selected another CMS */}
            {selectedService && isAnotherService(selectedService) ? (
              <Box bottom={40}>
                {!sendAnotherService ? (
                  <React.Fragment>
                    <Row bottom={20}>
                      <Text weight={500}>
                        К сожалению, пока мы поддерживаем только интеграцию
                        через Битрикс
                      </Text>
                    </Row>
                    <Row bottom={16}>
                      <Text>
                        Расскажите, через какую CMS вы работаете, чтобы мы
                        реализовали возможность интеграции через вашу CMS&nbsp;в
                        ближайшем будущем
                      </Text>
                    </Row>
                    <ServicesSuggest />
                  </React.Fragment>
                ) : (
                  <Col justify="center" gap={16}>
                    <Row>
                      <Icon size={52} url={`${basePath}/icons/checked.svg`} />
                    </Row>
                    <Row>
                      <Text variant="header_m">Спасибо, записали</Text>
                    </Row>
                    <Row>
                      <Text align="center" color="secondary">
                        Как только начнем работать&nbsp;с{' '}
                        <Text weight={500}>{anotherService}</Text>, напишем
                        вам&nbsp;на{' '}
                        <Link href={`mailto: ${partnerData?.email}`}>
                          <Text weight={500}>{partnerData?.email}</Text>
                        </Link>
                      </Text>
                    </Row>
                  </Col>
                )}
              </Box>
            ) : (
              <Row bottom={40}>
                <Text color="tertiary">
                  Если вы уже устанавливали модуль ранее, завершите регистрацию,
                  нажав кнопку «Вход в личный кабинет»
                </Text>
              </Row>
            )}

            <Row
              className={cnRegistrationFormThirdStep('Buttons')}
              justify="between"
            >
              <Col className={cnRegistrationFormThirdStep('Buttons', ['Back'])}>
                <Button
                  variant="outlined"
                  view="pseudo"
                  width="max"
                  onClick={sendAnotherService ? onBackAnother : onBack}
                >
                  Назад
                </Button>
              </Col>
              {selectedService &&
              (!sendAnotherService || !isAnotherService(selectedService)) ? (
                <Col
                  className={cnRegistrationFormThirdStep('Buttons', ['Next'])}
                >
                  <ButtonNext
                    progress={isSending}
                    width="max"
                    disabled={
                      isAnotherService(selectedService)
                        ? !anotherService
                        : false
                    }
                    onClick={
                      isAnotherService(selectedService)
                        ? () => onSendAnother(anotherService)
                        : onSend
                    }
                  >
                    {isAnotherService(selectedService)
                      ? 'Оставить заявку'
                      : 'Вход в личный кабинет'}
                  </ButtonNext>
                </Col>
              ) : (
                <Col
                  className={cnRegistrationFormThirdStep('Buttons', ['Next'])}
                >
                  <Button
                    width="max"
                    type="link"
                    variant="red"
                    url={`${basePath}${routes.account.about}`}
                  >
                    Вход в личный кабинет
                  </Button>
                </Col>
              )}
            </Row>
          </React.Fragment>
        );
      }}
    </Form>
  );
};

export type RegistrationFormThirdStepProps = ExtractProps<
  typeof RegistrationFormThirdStep
>;
