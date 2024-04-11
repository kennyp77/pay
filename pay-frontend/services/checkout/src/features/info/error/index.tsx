import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';
import { useSelector } from 'react-redux';

import { Block } from '../../../components/block';
import { ErrorBase } from '../../../components/error-base';
import { Modal } from '../../../components/modal';
import { getErrorScreen } from '../../../store/app';

import './styles.scss';

export const cnErrorScreen = cn('ErrorScreen');

export interface ErrorScreenProps extends IClassNameProps {}

export function ErrorScreen({ className }: ErrorScreenProps): JSX.Element {
    const error = useSelector(getErrorScreen);

    // TODO сделать анимацию при скрытии
    if (!error) {
        return null;
    }

    return (
        <React.Fragment>
            <Modal
                visible={Boolean(error)}
                theme="normal"
                className={cnErrorScreen({}, [className])}
                zIndexGroupLevel={1}
            >
                <Block bg="white" radius="xl" className={cnErrorScreen('Block')}>
                    <ErrorBase {...error} />
                </Block>
            </Modal>
        </React.Fragment>
    );
}
