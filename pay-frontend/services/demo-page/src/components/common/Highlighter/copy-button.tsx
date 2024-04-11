import React, { useCallback, useState } from 'react';

import { Copy } from './svg/copy';
import { CopyFilled } from './svg/copy-filled';

interface CopyButtonProps {
    textToCopy: string;
    className: string;
}

export function CopyButton({ textToCopy, className }: CopyButtonProps): JSX.Element {
    const [timer, setTimer] = useState<NodeJS.Timeout>();
    const [clicked, setClicked] = useState(false);

    const onClick = useCallback(() => {
        if (timer) {
            clearTimeout(timer);
        }
        const nextTimer = setTimeout(() => setClicked(false), 1000);

        setClicked(true);
        setTimer(nextTimer);
        navigator.clipboard.writeText(textToCopy);
    }, [timer, textToCopy]);

    return (
        <button type="button" onClick={onClick} className={className}>
            {clicked && <CopyFilled />}
            {!clicked && <Copy />}
        </button>
    );
}
