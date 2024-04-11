import { useMemo } from 'react';
import range from 'lodash.range';

type SeparatorType = '...';

export const DOTS: SeparatorType = '...';

const minLeftItemsCount = 3;
const minRightItemsCount = minLeftItemsCount;
const centerItemsCount = 5;

export const usePagination = ({
  totalCount,
  pageSize,
  currentPage,
  siblingCount = 2,
}: {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  siblingCount: number;
}) => {
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize);

    const totalPageNumbers = siblingCount + centerItemsCount;

    /*
      1. Если количество страниц меньше чем количество страниц, которое показываем (сепараторов нет)
    */
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount + 1);
    }

    /*
      Вычисление индексов левого и правого соседа выбранной страницы
    */
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount + 1,
    );

    /*
      Вычисление отображения левого и правого сепараторов
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    /*
      2. Если нет сепаратора слева и есть сепаратор справа
    */
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = minLeftItemsCount + 2 * siblingCount;
      const leftRange = range(1, leftItemCount + 1);

      return [...leftRange, DOTS, totalPageCount];
    }

    /*
      3. Если нет сепаратора справа и есть сепаратор слева
    */
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = minRightItemsCount + 2 * siblingCount;
      const rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount + 1,
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    /*
    	4. Если есть сепаратор слева и есть сепаратор справа
    */
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex + 1);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
  }, [totalCount, pageSize, siblingCount, currentPage]);

  return paginationRange;
};
