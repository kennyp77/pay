import {
  IWithGlyphTypeCheckProps,
  IWithGlyphTypeCrossProps,
} from '@yandex/ui/Icon';

export { cnIcon } from '@yandex/ui/Icon/desktop';
export type { IIconProps } from '@yandex/ui/Icon/desktop';

export interface CustomIconProps {
  glyph?: IWithGlyphTypeCheckProps['glyph'] | IWithGlyphTypeCrossProps['glyph'];
}
