import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import { useSelector } from 'react-redux';

import { Block } from '../../../components/block';
import { LoaderBase } from '../../../components/loader-base';
import { Modal } from '../../../components/modal';
import { getPendingScreen } from '../../../store/app';

import './styles.scss';

export const cnLoaderScreen = cn('LoaderScreen');

export interface LoaderScreenProps extends IClassNameProps {}

const i18n = (v: string) => v;

const DEFAULT_MESSAGE = i18n('Загрузка');

export function LoaderScreen({ className }: LoaderScreenProps) {
    const pending = useSelector(getPendingScreen);

    // TODO сделать анимацию при скрытии
    if (!pending) {
        return null;
    }

    return (
        <Modal
            visible={Boolean(pending)}
            theme="normal"
            className={cnLoaderScreen({}, [className])}
            zIndexGroupLevel={1}
        >
            <Block bg="white" radius="xl" className={cnLoaderScreen('Block')}>
                <LoaderBase
                    message={pending.message || DEFAULT_MESSAGE}
                    description={pending.description}
                />
            </Block>
        </Modal>
    );
}
