import React, { FC } from 'react';
import { Modal } from 'components/modal';
import { Box } from 'components/box';
import { Button } from 'components/button';
import { Text } from 'components/text';

type QuotationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const QuotationModal: FC<QuotationModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal variant="default" theme="normal" visible={isOpen} onClose={onClose}>
      <Box bottom={32}>
        <Text
          variant="header_m"
          as="h2"
          bottom={20}
          align="center"
          right={18}
          left={18}
        >
          Коммерческие условия сервиса «Yandex Pay Checkout»
        </Text>
        <Text bottom={20} isContent={true}>
          <p>Российская Федерация, Москва</p>
          <p>
            Настоящий документ представляет собой предложение (оферту) Общества
            с ограниченной ответственностью «ЯНДЕКС» (далее — «Яндекс»)
            заключить Договор на оказание услуг «Yandex Pay Checkout» на
            изложенных ниже условиях.
          </p>
        </Text>
      </Box>
      <Button variant="red" view="action" width="max" onClick={onClose}>
        Закрыть
      </Button>
    </Modal>
  );
};
