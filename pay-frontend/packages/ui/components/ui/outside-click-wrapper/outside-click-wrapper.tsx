import React from 'react';

import { IClassNameProps } from '@bem-react/core';
import { withOutsideClick } from '@yandex-lego/components/withOutsideClick';

interface OutsideClickWrapperProps extends IClassNameProps {
    targetRef: React.RefObject<HTMLDivElement>;
    visible?: boolean;

    onOutsideClick?(event: React.MouseEvent): void;
}

function WrapperBase({ visible, targetRef, onOutsideClick, ...props }: OutsideClickWrapperProps) {
    return <div ref={targetRef} {...props} />;
}

export const OutsideClickWrapper = withOutsideClick(WrapperBase);
