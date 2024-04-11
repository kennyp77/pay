import { compose, ExtractProps } from '@bem-react/core';

import {
  Select as SelectDesktop,
  cnSelect,
  withWidthMax,
} from '@yandex/ui/Select/desktop';
import { withRegistry, Registry } from '@bem-react/di';

import { withTogglable } from '@yandex/ui/withTogglable';

import {
  Button as ButtonDesktop,
  withSizeM as withButtonSizeM,
  withViewDefault as withButtonViewDefault,
} from '@yandex/ui/Button/desktop';

import {
  Menu as MenuDesktop,
  withSizeM as withMenuSizeM,
  withViewDefault as withMenuViewDefault,
} from '@yandex/ui/Menu/desktop';

import {
  Popup as PopupDesktop,
  withViewDefault as withPopupViewDefault,
  withTargetAnchor,
} from '@yandex/ui/Popup/desktop';

import { Icon } from 'components/icon';

import { withVariantOutlined } from './_variant/outlined';
import { basePath } from 'const';

const selectRegistry = new Registry({ id: cnSelect() });

const Button = compose(withButtonSizeM, withButtonViewDefault)(ButtonDesktop);
const Menu = compose(withMenuSizeM, withMenuViewDefault)(MenuDesktop);
const Popup = compose(withPopupViewDefault, withTargetAnchor)(PopupDesktop);

const IconDesktop = () => {
  return (
    <Icon
      className={cnSelect('Icon')}
      url={`${basePath}/icons/select-box.svg`}
    />
  );
};

selectRegistry
  .set('Trigger', Button)
  .set('Popup', Popup)
  .set('Menu', Menu)
  .set('Icon', IconDesktop);

export const Select = compose(
  withTogglable,
  withRegistry(selectRegistry),
  withWidthMax,
  withVariantOutlined,
)(SelectDesktop);

export type SelectProps = ExtractProps<typeof Select>;
