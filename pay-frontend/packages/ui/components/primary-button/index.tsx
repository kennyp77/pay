import React from 'react';

import BigButton from '../ui/big-button';

interface PrimaryButtonProps {
    title: string;
    disabled?: boolean;
    onClick: () => void;
}

export default function PrimaryButton({ title, disabled = false, onClick }: PrimaryButtonProps): JSX.Element {
    return (
        <BigButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            type="red"
            title={title}
            disabled={disabled}
            onClick={onClick}
        >
            {title}
        </BigButton>
    );
}
