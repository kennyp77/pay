import React from 'react';

import { cn } from '@bem-react/classname';

import { isTouchTemplate } from '../../helpers/app';
import { Block } from '../block';
import { Box } from '../box';
import { Button } from '../button';
import { Modal } from '../modal';
import { Text } from '../text';

import './styles.scss';

export const cnRemove = cn('Remove');

export interface RemoveProps {
    subject: string;
    onCancel?: Sys.CallbackFn0;
    onConfirm: Sys.CallbackFn0;
    cancelText?: string;
    confirmText?: string;
    visible?: boolean;
    progress?: boolean;
}

const i18n = (v: string) => v;

export function ConfirmModal({
    subject,
    onCancel,
    onConfirm,
    progress,
    cancelText = 'Отмена',
    confirmText = 'Удалить',
    visible = true,
}: RemoveProps) {
    return (
        <Modal
            theme="normal"
            visible={visible}
            contentVerticalAlign={isTouchTemplate() ? 'bottom' : 'middle'}
            className={cnRemove()}
            zIndexGroupLevel={1}
        >
            <Block bg="white" radius="m" className={cnRemove('Block')}>
                <Box all="l">
                    <Text align="center" variant="header-m" top="2xs" bottom="xl">
                        {subject}
                    </Text>

                    <Box bottom="m">
                        <Button
                            onClick={onCancel}
                            type="submit"
                            view="default"
                            size="l"
                            pin="round-m"
                            width="max"
                        >
                            {i18n(cancelText)}
                        </Button>
                    </Box>

                    <Button
                        onClick={onConfirm}
                        type="submit"
                        view="action"
                        size="l"
                        pin="round-m"
                        width="max"
                        progress={progress}
                    >
                        {i18n(confirmText)}
                    </Button>
                </Box>
            </Block>
        </Modal>
    );
}
