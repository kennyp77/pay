import * as React from 'react';

import { classnames } from '@bem-react/classnames';
import { NavLink } from 'react-router-dom';

import { Path } from 'router/paths';

export function Header() {
    const links = [
        ['Classic', Path.classic],
        ['Classic Bolt', Path.classicBolt],
        ['Checkout', Path.checkout],
        ['Checkout Bolt', Path.checkoutBolt],
        ['Buttons', Path.buttons],
    ];

    return (
        <div className={classnames('flex', 'pb-2')}>
            <img
                className={classnames('object-contain', 'dark:invert')}
                src="https://yastatic.net/q/logoaas/v2/Яндекс%20PAY.svg?size=24&circle=black&first=white"
                alt="Яндекс PAY"
            />
            <nav className={classnames('flex', 'ml-8', 'gap-2')}>
                {links.map(([title, path], idx) => (
                    <NavLink
                        key={`${path}${idx}`}
                        to={path}
                        exact
                        className={classnames(
                            'py-1.5',
                            'px-3',
                            'flex',
                            'rounded-lg',
                            'bg-blue-gray-100',
                            'dark:bg-blue-gray-1900',
                            'text-body-long-m',
                            'font-medium',
                        )}
                        activeClassName={classnames('bg-white', 'dark:bg-blue-gray-1800')}
                    >
                        {title}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
