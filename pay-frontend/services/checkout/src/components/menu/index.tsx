import { compose, composeU, ExtractProps } from '@bem-react/core';
import {
    Menu as MenuBase,
    withViewDefault,
    withWidthAuto,
    withWidthMax,
    withSizeS,
    withSizeM,
    ItemSimple,
    ChangeEvent,
} from '@yandex-lego/components/Menu/desktop';

import './override.scss';

export const Menu = compose(
    withViewDefault,
    composeU(withSizeS, withSizeM),
    composeU(withWidthAuto, withWidthMax),
)(MenuBase);
export type MenuProps = ExtractProps<typeof Menu>;
export type MenuItem = ItemSimple;
export type MenuChangeEvent<T = any> = ChangeEvent<T>;
