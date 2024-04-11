import React, { FC, useState, useMemo, useCallback, useEffect } from 'react';
import { useToggle } from 'react-use';
import { useRouter } from 'next/router';

import { Table } from 'components/table';
import { Box } from 'components/box';
import { Button } from 'components/button';
import { Row } from 'components/row';

import { Price } from 'features/payments/price';
import { Filters } from 'features/payments/filters';
import { OrderInfoModal } from 'features/payments/order-info-modal';
import { DateRangeISOString } from 'features/global/filters/filter-calendar';

import { PaymentEmpty } from './payment-empty';
import { PaymentEmptyFilters } from './payment-empty-filters';
import { PaymentStatus } from './payment-status';

import { paymentHeading, paymentsData } from 'mocks/payments';

import './index.scss';

export type FiltersType = {
  date?: string;
  dateRange?: DateRangeISOString;
  search?: string;
  payments?: string[];
  headings?: string[];
};

type PaymentsListProps = unknown;

type ActiveColumnsProps = {
  id: string;
  name?: string;
}[];

export const PaymentsList: FC<PaymentsListProps> = () => {
  // TODO: Убрать роутер
  // Это временное решение с роутером для того, чтобы показать верстку пустого блока
  const route = useRouter();
  const { empty, emptyFilters } = route.query;

  const [detailedModalOn, detailedModalToggle] = useToggle(false);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterObject, setFilterObject] = useState<FiltersType | null>(null);
  const [activeColumns, setActiveColumns] = useState<ActiveColumnsProps>([]);

  const handleChangeColumns = useCallback((values: string[]) => {
    const newValues = values.map((value) => {
      return {
        id: value,
        name: paymentHeading.find((item) => item.columnId === value)?.title,
      };
    });
    setActiveColumns(newValues);
  }, []);

  useEffect(() => {
    const columnsList: ActiveColumnsProps = [];
    paymentHeading.forEach((item) => {
      columnsList.push({
        id: item.columnId,
        name: item.title,
      });
    });
    setActiveColumns(columnsList);
  }, []);

  // TODO: как появится api,  сделать оставшуюся фильтрацию
  useEffect(() => {
    if (filterObject?.headings) {
      handleChangeColumns(filterObject?.headings);
    }
  }, [filterObject?.headings, handleChangeColumns]);

  const handleRowClick = useCallback(
    (id: string) => {
      setActiveId(id);
      detailedModalToggle(true);
    },
    [detailedModalToggle],
  );

  const handleShowMoreRows = useCallback(() => {
    // TODO: показать еще 100, появится вместе с API
  }, []);

  const data = useMemo(() => {
    return paymentsData.map((payment) => {
      return {
        id: payment.id,
        date: payment.date,
        sum: <Price value={payment.sum} />,
        status: (
          <PaymentStatus
            status={payment.status.state}
            cardPath={payment.status.cardPath}
            description={payment.status.description}
          />
        ),
        email: payment.email,
        phone: payment.phone,
      };
    });
  }, []);

  const [tableBody, tableHeading] = useMemo(() => {
    const body = data.map((item) => {
      const filteredObject = Object.entries(item).filter(([key]) => {
        if (!activeColumns.length) {
          return activeColumns;
        }
        return activeColumns.some((column) => column.id === key);
      });

      return Object.fromEntries(filteredObject);
    });

    const head = paymentHeading.filter((item) => {
      if (!activeColumns.length) {
        return activeColumns;
      }
      const filteredObject = activeColumns.some((column) => {
        return item.columnId === column.id;
      });

      return filteredObject;
    });

    return [body, head];
  }, [activeColumns, data]);

  return (
    <>
      {!empty ? (
        <React.Fragment>
          <Filters
            setFilter={(newFilter) =>
              setFilterObject({ ...filterObject, ...newFilter })
            }
          />
          <Box align="start">
            <Table
              data={!emptyFilters ? tableBody : undefined}
              heading={tableHeading}
              mods={{ headingWeight: 500 }}
              onRowClick={handleRowClick}
              emptyDataBlock={
                <Row justify="center" top={32}>
                  <PaymentEmptyFilters />
                </Row>
              }
            />
            {!emptyFilters ? (
              <Row top={32}>
                <Button
                  variant="outlined"
                  view="pseudo"
                  size="s"
                  onClick={handleShowMoreRows}
                >
                  Показать еще 100
                </Button>
              </Row>
            ) : null}
          </Box>
        </React.Fragment>
      ) : (
        <Box align="center" top={32}>
          <PaymentEmpty />
        </Box>
      )}

      <OrderInfoModal
        id={activeId}
        isOpen={detailedModalOn && Boolean(activeId)}
        onClose={() => detailedModalToggle(false)}
      />
    </>
  );
};
