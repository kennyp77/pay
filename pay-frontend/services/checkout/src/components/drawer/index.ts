import { ExtractProps, compose } from '@bem-react/core';
import { Drawer as BaseDrawer } from '@yandex-lego/components/Drawer/touch-phone/bundle';
import { withZIndex } from '@yandex-lego/components/withZIndex';

export const Drawer = compose(withZIndex)(BaseDrawer);

export type DrawerProps = ExtractProps<typeof Drawer>;
