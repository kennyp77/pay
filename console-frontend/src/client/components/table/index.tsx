import React, { FC, useState, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Text } from 'components/text';
import { Icon } from 'components/icon';
import { Box } from 'components/box';

import { TableProps } from './base';

import { basePath } from 'const';
import './index.scss';

const cnTable = cn('Table');

export const Table: FC<TableProps> = ({
  data,
  heading,
  mods,
  onRowClick,
  emptyDataBlock,
  className,
}) => {
  const [activeSortableColumn, setActiveSortableColumn] = useState<{
    id: string;
    isAsc: boolean;
  } | null>(null);

  const handleSort = useCallback(
    (col?: string) => {
      if (col) {
        setActiveSortableColumn({
          id: col,
          isAsc: true,
        });

        if (activeSortableColumn && activeSortableColumn.id === col) {
          setActiveSortableColumn({
            ...activeSortableColumn,
            isAsc: !activeSortableColumn.isAsc,
          });
        }
      }
    },
    [activeSortableColumn],
  );

  return (
    <table className={cnTable(null, [className])}>
      <thead>
        <tr
          className={cnTable('Row', {
            BeforeHoverRows: Boolean(onRowClick),
          })}
        >
          {heading
            ? heading.map((column, column_index) => (
                <th
                  key={column_index}
                  className={cnTable('Col', {
                    Heading: true,
                    Align: column.align,
                    Is_sortable: column.isSortable,
                  })}
                >
                  <Box
                    type="flex"
                    className={cnTable('HeadingBox')}
                    onClick={() =>
                      column.isSortable
                        ? handleSort(column.columnId || undefined)
                        : {}
                    }
                  >
                    <Text
                      color="secondary"
                      weight={mods?.headingWeight ? mods.headingWeight : 500}
                      size={14}
                      {...column.modifier}
                    >
                      {column.title}
                      {column.appendix ? `, ${column.appendix}` : null}
                    </Text>
                    {column.isSortable ? (
                      <Icon
                        url={`${basePath}/icons/list.svg`}
                        size={12}
                        className={cnTable('Icon', {
                          IsActive:
                            column.columnId === activeSortableColumn?.id,
                          Reverse: activeSortableColumn?.isAsc,
                        })}
                      />
                    ) : null}
                  </Box>
                </th>
              ))
            : null}
        </tr>
      </thead>
      <tbody>
        {data ? (
          data.map((row, row_index) => (
            <tr
              key={row_index}
              className={cnTable('Row', {
                Hovered: Boolean(onRowClick),
              })}
              onClick={() => onRowClick && row.id && onRowClick(row.id)}
            >
              {Object.values(row).map((column, column_index) => (
                <td
                  key={column_index}
                  className={cnTable('Col', {
                    Align:
                      heading && heading[Number(column_index)]
                        ? heading[Number(column_index)].align
                        : undefined,
                  })}
                  style={
                    mods?.rowGap
                      ? {
                          paddingTop: mods.rowGap,
                          paddingBottom: mods.rowGap,
                        }
                      : undefined
                  }
                >
                  {column}
                </td>
              ))}
            </tr>
          ))
        ) : emptyDataBlock ? (
          <tr>
            <td colSpan={heading?.length}>{emptyDataBlock}</td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
};

export { TableAlign } from './base';
