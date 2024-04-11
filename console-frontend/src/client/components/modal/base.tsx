export { cnModal } from '@yandex/ui/Modal/desktop';
export type { IModalProps } from '@yandex/ui/Modal/desktop';

export interface ModalVariantProps {
  variant?: 'default' | 'cross-outside' | 'no-cross';
  contentPadding?: number;
  additionalBlock?: () => JSX.Element;
}

export interface ModalSizeProps {
  size?: 'small';
}
