import React, { FC } from 'react';

import { Modal } from 'components/modal';

type SupportModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const SupportModal: FC<SupportModalProps> = ({ visible, onClose }) => {
  return (
    <Modal variant="default" theme="normal" visible={visible} onClose={onClose}>
      <iframe
        src="https://forms.yandex.ru/u/6241752e3ec7ff80f54eaa96?iframe=1"
        name="ya-form-6241752e3ec7ff80f54eaa96"
        width="500"
        height="650"
        frameBorder="0"
      />
    </Modal>
  );
};
