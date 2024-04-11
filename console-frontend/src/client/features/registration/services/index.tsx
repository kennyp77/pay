import React, { FC, useCallback, useMemo, useState, useEffect } from 'react';
import { cn } from '@bem-react/classname';
import chunk from 'lodash.chunk';
import { useSelector } from 'react-redux';

import { Box } from 'components/box';
import { Col } from 'components/col';
import { Row } from 'components/row';
import { ProviderCard } from '../provider-card';

import { services } from 'mocks/services';
import { ServiceProps } from 'types/services-type';

import { getPartnerDataSelector } from 'store/partner-data/selectors';

import './index.scss';

interface IServicesProps {
  onSelect?: (service: ServiceProps) => void;
}

const maxCountInRow = 3;

const cnServices = cn('Services');

export const Services: FC<IServicesProps> = ({ onSelect }) => {
  const { services_list: servicesList } = services;
  const [selectedService, setSelectedService] = useState<ServiceProps | null>(
    null,
  );

  const partnerData = useSelector(getPartnerDataSelector);

  useEffect(() => {
    if (partnerData) {
      const serviceFromStore = servicesList.find(
        (service) => service.name === partnerData.service,
      );

      if (serviceFromStore) {
        setSelectedService(serviceFromStore);
      }
    }
  }, [partnerData, servicesList]);

  const rows = useMemo(
    () => chunk(servicesList, maxCountInRow),
    [servicesList],
  );

  const oneAnotherInRow = useCallback(
    (row: ServiceProps[]) => row.length === 1 && row[0].is_another,
    [],
  );

  const handleClick = useCallback(
    (service: ServiceProps) => {
      setSelectedService(service);
      if (onSelect) {
        onSelect(service);
      }
    },
    [onSelect],
  );

  return (
    <Box>
      {/* Список сервисов CMS */}
      <Col className={cnServices()} gap={12}>
        {rows.map((row, rowKey) => (
          <Row
            key={rowKey}
            className={cnServices('Row')}
            justify="between"
            gap={12}
          >
            {row.map((service, serviceKey, currentRow) => (
              <ProviderCard
                key={serviceKey}
                logo={service.logo_url}
                name={
                  oneAnotherInRow(currentRow) ? service.name_long : service.name
                }
                checked={service === selectedService}
                small={oneAnotherInRow(currentRow)}
                onClick={() => handleClick(service)}
              />
            ))}
          </Row>
        ))}
      </Col>
    </Box>
  );
};
