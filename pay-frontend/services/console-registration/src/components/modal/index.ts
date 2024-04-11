import { ExtractProps, compose } from '@bem-react/core';
import { Modal as ModalDesktop, withThemeNormal } from '@yandex-lego/components/Modal/desktop';
import { withZIndex } from '@yandex-lego/components/withZIndex';

import './override.scss';

// Композиция из различных модификаторов
export const Modal = compose(withThemeNormal, withZIndex)(ModalDesktop);

export type ModalProps = ExtractProps<typeof Modal>;
