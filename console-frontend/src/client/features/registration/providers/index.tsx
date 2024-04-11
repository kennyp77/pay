import React, { FC, useCallback, useMemo, useState, useEffect } from 'react';
import { cn } from '@bem-react/classname';
import chunk from 'lodash.chunk';
import { useSelector } from 'react-redux';

import { Box } from 'components/box';
import { Col } from 'components/col';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { FormInput } from 'components/form-input';
import { ProviderCard } from '../provider-card';
import { SecureLabel } from '../secure-label';

import { ProviderProps } from 'types/providers-type';
import { providers } from 'mocks/providers';

import { getPartnerDataSelector } from 'store/partner-data/selectors';
import { getProviderSubmitSelector } from 'store/partner-submit/selectors';
import { useFormikContext } from 'formik';

import './index.scss';

interface IProvidersProps {
  select?: (provider: ProviderProps) => void;
  providerIsSelected?: () => void;
}

const minCountInRow = 2;
const maxCountInRow = 3;

const cnProviders = cn('Providers');

export const Providers: FC<IProvidersProps> = ({
  select,
  providerIsSelected,
}) => {
  const { providers_list: providersList } = providers;
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderProps | null>(null);

  const [selectedProviderFields, setSelectedProviderFields] = useState<
    ProviderProps['fields']
  >([]);

  const { setValues } = useFormikContext();
  const partnerData = useSelector(getPartnerDataSelector);
  const providerData = useSelector(getProviderSubmitSelector);

  useEffect(() => {
    if (providerIsSelected && selectedProvider) {
      providerIsSelected();
    }
  }, [selectedProvider, providerIsSelected]);

  useEffect(() => {
    if (partnerData) {
      const providerFromStore = providersList.find(
        (provider) => provider.id === partnerData.provider?.id,
      );

      if (providerFromStore) {
        setSelectedProvider(providerFromStore);
      }
    }
  }, [partnerData, providersList]);

  useEffect(() => {
    if (selectedProvider) {
      if (partnerData?.provider?.creds) {
        const parsedCreds = JSON.parse(partnerData.provider.creds);
        const fieldsWithCreds = selectedProvider.fields.map((field) => ({
          ...field,
          value: parsedCreds[field.name],
        }));
        setSelectedProviderFields(fieldsWithCreds);
        if (select) {
          select(selectedProvider);
        }
        const newValues: { [key: string]: string } = {};
        fieldsWithCreds.forEach((field) => {
          newValues[field.name] = field.value;
        });

        setTimeout(() => {
          setValues(newValues);
          // hook with setTimeOut for working in safari
        }, 100);
      } else {
        setSelectedProviderFields(selectedProvider.fields);
      }
    }
  }, [partnerData, selectedProvider, select, setValues]);

  const rows = useMemo(
    () =>
      chunk(
        providersList,
        providersList && providersList.length === 4
          ? minCountInRow
          : maxCountInRow,
      ),
    [providersList],
  );

  const selectProvider = useCallback(
    (provider: ProviderProps) => {
      setSelectedProvider(provider);
      if (select) {
        select(provider);
      }
    },
    [select],
  );

  const isSecureField = useCallback(() => {
    if (selectedProvider) {
      if (partnerData?.provider) {
        return (
          Boolean(partnerData.provider.creds) &&
          partnerData.provider.id === selectedProvider.id
        );
      } else if (providerData) {
        return providerData.psp_external_id === selectedProvider.id;
      }
    }
    return false;
  }, [partnerData, providerData, selectedProvider]);

  return (
    <Box>
      {/* Список провайдеров */}
      <Col className={cnProviders()} bottom={40} gap={12}>
        {rows.map((row, rowKey) => (
          <Row
            key={rowKey}
            className={cnProviders('Row')}
            justify="between"
            gap={12}
          >
            {row.map((provider, providerKey) => (
              <ProviderCard
                key={providerKey}
                logo={provider.logo_url}
                name={provider.name}
                checked={provider === selectedProvider}
                onClick={() => selectProvider(provider)}
              />
            ))}
          </Row>
        ))}
      </Col>
      {/* Реквизиты */}
      {selectedProvider ? (
        <Box bottom={40}>
          <Row align="center" justify="between" bottom={20}>
            <Text variant="header_m" as="h2">
              Реквизиты
            </Text>
            <SecureLabel />
          </Row>
          <Row bottom={20}>
            <Text
              isContent
              dangerouslySetInnerHTML={{ __html: selectedProvider.info_text }}
            />
          </Row>
          {selectedProviderFields.map((field, key) => (
            <FormInput
              key={key}
              bottom={20}
              placeholder={field.placeholder}
              label={field.label}
              fieldName={field.name}
              type={isSecureField() ? 'password' : field.type}
              disabled={isSecureField()}
              view="material"
              variant="outlined"
              value={isSecureField() ? 'secure' : ''}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
};
