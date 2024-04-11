import * as React from 'react';

import { classnames } from '@bem-react/classnames';

interface RowProps {
    children: React.ReactNode;
}

export const Row: React.FC<RowProps> = function Row({ children }) {
    return (
        <div className={classnames('flex', 'flex-row', 'flex-wrap', 'gap-2', 'mb-2')}>
            {children}
        </div>
    );
};
