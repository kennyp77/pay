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
    cancel?: Sys.CallbackFn0;
    cancelText?: string;
    action: Sys.CallbackFn0;
    actionText?: string;
    visible?: boolean;
}

const i18n = (v: string) => v;

export function Remove({
    subject,
    cancel,
    cancelText = 'Отмена',
    action,
    actionText = 'Удалить',
    visible,
}: RemoveProps) {
    return (
        <Modal
            theme="normal"
            visible={visible}
            contentVerticalAlign={isTouchTemplate() ? 'bottom' : 'middle'}
            className={cnRemove()}
        >
            <Block bg="white" radius="m" className={cnRemove('Block')}>
                <Box all="l">
                    <Text align="center" variant="header-m" top="2xs" bottom="xl">
                        {i18n(`Вы действительно хотите удалить ${subject}?`)}
                    </Text>

                    <Box bottom="m">
                        <Button
                            onClick={cancel}
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
                        onClick={action}
                        type="submit"
                        view="action"
                        size="l"
                        pin="round-m"
                        width="max"
                    >
                        {i18n(actionText)}
                    </Button>
                </Box>
            </Block>
        </Modal>
    );
}
