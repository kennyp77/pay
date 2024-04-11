import React from 'react';

import { cn } from '@bem-react/classname';
import BigButton from '@trust/ui/components/ui/big-button';
import Icon from '@trust/ui/components/ui/icon';

import { Modal } from '../modal';

import './styles.scss';

const cnModalContainer = cn('ModalContainer');

interface ModalProps {
    visible: boolean;
    onAgree: () => void;
    onClose: () => void;
    header: JSX.Element | string;
    content: JSX.Element;
}

export function ModalContainer({
    header,
    content,
    visible,
    onAgree,
    onClose,
}: ModalProps): JSX.Element {
    return (
        <Modal theme="normal" visible={visible} onClose={onClose} autoFocus={false}>
            <div className={cnModalContainer()}>
                <div className={cnModalContainer('Header')}>
                    <div className={cnModalContainer('HeaderText')}>{header}</div>
                    <Icon
                        onClick={onClose}
                        className={cnModalContainer('HeaderClose')}
                        glyph="close"
                    />
                </div>

                <div className={cnModalContainer('Content')}>{content}</div>

                <div className={cnModalContainer('Divider')} />

                <div className={cnModalContainer('Footer')}>
                    <BigButton className={cnModalContainer('Button')} onClick={onAgree}>
                        Согласен
                    </BigButton>
                </div>
            </div>
        </Modal>
    );
}
