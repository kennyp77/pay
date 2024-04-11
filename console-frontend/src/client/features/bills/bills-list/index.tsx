import React, { FC, useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '@bem-react/classname';
import { useToggle } from 'react-use';
import { useRouter } from 'next/router';

import { Table } from 'components/table';
import { Box } from 'components/box';
import { Button } from 'components/button';
import { Row } from 'components/row';
import { Text } from 'components/text';
import { Pagination } from 'components/pagination';
import ArrowRightIcon from 'public/icons/arrow-right.svg';
import LoadIcon from 'public/icons/load.svg';

import { Price } from 'features/payments/price';
import { Filters } from 'features/bills/filters';
import { OrderInfoModal } from 'features/payments/order-info-modal';

import { BillEmpty } from './bill-empty';
import { BillEmptyFilters } from './bill-empty-filters';
import { BillStatus } from './bill-status';

import { billHeading, billsData } from 'mocks/bills';
import { OrderStatuses } from 'types/bills';
import { BillDropdown } from '../bill-dropdown';

import './index.scss';

export type FiltersType = {
  date?: string;
  bills?: string[];
  headings?: string[];
};

type BillsListProps = unknown;

type ActiveColumnsProps = {
  id: string;
  name?: string;
}[];

const cnBillsList = cn('BillsList');

export const BillsList: FC<BillsListProps> = () => {
  // TODO: Убрать роутер
  // Это временное решение с роутером для того, чтобы показать верстку пустого блока
  const route = useRouter();
  const { empty, emptyFilters } = route.query;

  const [detailedModalOn, detailedModalToggle] = useToggle(false);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterObject, setFilterObject] = useState<FiltersType | null>(null);
  const [activeColumns, setActiveColumns] = useState<ActiveColumnsProps>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const BillDropdownOptionContent = useCallback(
    (text) => (
      <Row justify="between" align="center">
        <Text>
          {text},&nbsp;
          <Text color="secondary" as="span">
            PDF
          </Text>
        </Text>
        <LoadIcon className={cnBillsList('LoadIcon')} />
      </Row>
    ),
    [],
  );

  const handleChangeColumns = useCallback((values: string[]) => {
    const newValues = values.map((value) => {
      return {
        id: value,
        name: billHeading.find((item) => item.columnId === value)?.title,
      };
    });
    setActiveColumns(newValues);
  }, []);

  useEffect(() => {
    const columnsList: ActiveColumnsProps = [];
    billHeading.forEach((item) => {
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

  const BillPaymentButton = useCallback(
    () => (
      <Button variant="default" size="m">
        К оплате
        <ArrowRightIcon />
      </Button>
    ),
    [],
  );

  const BillDownloadButton = useCallback(
    () => (
      <BillDropdown
        buttonText="Скачать"
        options={[
          {
            content: BillDropdownOptionContent('Скачать акт'),
            value: 'Скачать акт',
          },
          {
            content: BillDropdownOptionContent('Скачать счет-фактуру'),
            value: 'Скачать счет-фактуру',
          },
        ]}
        hasDropdownIcon
      />
    ),
    [BillDropdownOptionContent],
  );

  const data = useMemo(() => {
    return billsData.map((bill) => {
      return {
        period: bill.period,
        exhibited: bill.exhibited,
        status: <BillStatus status={bill.status.state} />,
        sum: <Price value={bill.sum} />,
        link:
          bill.status.state !== OrderStatuses.Complete ? (
            <BillPaymentButton />
          ) : (
            <BillDownloadButton />
          ),
      };
    });
  }, [BillDownloadButton, BillPaymentButton]);

  const handleShowMoreRows = useCallback(() => {
    // TODO: показать еще 100, появится вместе с API
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

    const head = billHeading.filter((item) => {
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
              className={cnBillsList('Table')}
              data={!emptyFilters ? tableBody : undefined}
              heading={tableHeading}
              mods={{ headingWeight: 500 }}
              onRowClick={handleRowClick}
              emptyDataBlock={
                <Row justify="center" top={32}>
                  <BillEmptyFilters />
                </Row>
              }
            />
            {!emptyFilters ? (
              <Row top={32} justify="between">
                <Button
                  variant="outlined"
                  view="pseudo"
                  size="s"
                  onClick={handleShowMoreRows}
                >
                  Показать еще 100
                </Button>
                <Pagination
                  totalCount={143}
                  currentPage={currentPage}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              </Row>
            ) : null}
          </Box>
        </React.Fragment>
      ) : (
        <Box align="center" top={32}>
          <BillEmpty />
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
