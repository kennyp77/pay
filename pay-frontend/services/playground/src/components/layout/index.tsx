import * as React from 'react';

import { classnames } from '@bem-react/classnames';

interface LayoutProps {
    header: React.ReactNode;
    main: React.ReactNode;
    children: React.ReactNode;
    needColumns?: boolean;
}

export const Layout: React.FC<LayoutProps> = function Layout({
    header,
    main,
    children,
    needColumns = true,
}) {
    let asideClassnameTokens = needColumns
        ? [
              'gap-2',
              'mt-2',
              'columns-1',
              'sm:columns-2',
              // 'md:columns-3',
              'lg:columns-3',
              'xl:columns-4',
          ]
        : ['flex', 'flex-col', 'gap-2'];

    return (
        <div className={classnames('m-2')}>
            <header className={classnames('w-full')}>{header}</header>
            <main className={classnames('w-full', 'mt-2')}>{main}</main>
            <aside className={classnames(...asideClassnameTokens)}>{children}</aside>
        </div>
    );
};

export const LayoutCell: React.FC = function LayoutCell({ children }) {
    return <div className={classnames('inline-block', 'w-full', 'mb-2')}>{children}</div>;
};
