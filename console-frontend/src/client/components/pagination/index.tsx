import { FC, useCallback, useMemo } from 'react';
import { IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';

import { Button } from 'components/button';
import { Col } from 'components/col';
import { Row } from 'components/row';
import { Icon } from 'components/icon';

import { usePagination, DOTS } from 'client/hooks/usePagination';

import { basePath } from 'const';
import './index.scss';

const cnPagination = cn('Pagination');

export interface PaginationProps extends IClassNameProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  pageSize?: number;
  siblingCount?: number;
}

// TODO: компонент пагинации, в первых MVP не используется (потом может появиться)

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalCount,
  onPageChange,
  pageSize = 10,
  siblingCount = 2,
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  const lastPage = useMemo(
    () => (paginationRange ? paginationRange[paginationRange.length - 1] : 1),
    [paginationRange],
  );

  const IconPrev = useCallback(
    (className: string) => (
      <Icon
        className={cnPagination('IconPrev', [className])}
        size={36}
        url={`${basePath}/icons/arrow-right.svg`}
      />
    ),
    [],
  );

  const IconNext = useCallback(
    (className: string) => (
      <Icon
        className={className}
        size={36}
        url={`${basePath}/icons/arrow-right.svg`}
      />
    ),
    [],
  );

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  return (
    <Row className={cnPagination()} align="center" gap={4}>
      {/* Left navigation */}
      <Col>
        <Button
          className={cnPagination('Button')}
          view="pseudo"
          size="m"
          disabled={currentPage === 1}
          onClick={onPrevious}
          icon={IconPrev}
        />
      </Col>
      {/* Pages */}
      {paginationRange
        ? paginationRange.map((page, index) => (
            <Col key={index}>
              {page === DOTS ? (
                <Button
                  className={cnPagination('Button', ['Separator'])}
                  view="clear"
                  size="m"
                  as="span"
                >
                  ...
                </Button>
              ) : (
                <Button
                  className={cnPagination('Button')}
                  view={page === currentPage ? 'default' : 'clear'}
                  size="m"
                  onClick={() => onPageChange && onPageChange(Number(page))}
                >
                  {page}
                </Button>
              )}
            </Col>
          ))
        : null}
      {/* Right navigation */}
      <Col>
        <Button
          className={cnPagination('Button')}
          view="pseudo"
          size="m"
          disabled={currentPage === lastPage}
          onClick={onNext}
          icon={IconNext}
        />
      </Col>
    </Row>
  );
};
