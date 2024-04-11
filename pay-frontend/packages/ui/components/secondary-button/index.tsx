import React from 'react';

import BigButton from '../ui/big-button';

interface SecondaryButtonProps {
    title: string;
    disabled?: boolean;
    onClick: () => void;
}

export default function SecondaryButton({ title, disabled = false, onClick }: SecondaryButtonProps): JSX.Element {
    return (
        <BigButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            type="white"
            title={title}
            disabled={disabled}
            onClick={onClick}
        >
            {title}
        </BigButton>
    );
}
