import { TextProps } from 'components/text';

export enum TableAlign {
  right = 'right',
  left = 'left',
  center = 'center',
}

export type TableProps = {
  data?: {
    id?: string;
    [k: string]: string | JSX.Element | undefined;
  }[];
  heading?: {
    title: string;
    align?: TableAlign;
    modifier?: TextProps;
    columnId?: string;
    isSortable?: boolean;
    appendix?: string;
  }[];
  mods?: {
    headingWeight?: TextProps['weight'];
    rowGap?: string;
  };
  onRowClick?: (id: string) => void;
  emptyDataBlock?: JSX.Element;
  className?: string;
};
