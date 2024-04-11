import React from 'react';

import { withBemMod } from '@bem-react/core-fork';
import { Link as RouterDomLink } from 'react-router-dom';

import { ILinkProps, cnLink } from '../base';

interface LinkWithHrefProps {
    href?: string;
    linkType?: 'external';
}

export const withHref = withBemMod<LinkWithHrefProps, ILinkProps>(
    cnLink(),
    { href: '*' },
    (WrappedComponent) => {
        return ({ href, linkType, ...props }) => {
            if (!href) {
                return <WrappedComponent {...props} />;
            }

            if (linkType === 'external') {
                return <WrappedComponent {...props} href={href} />;
            }

            return (
                <RouterDomLink to={href}>
                    <WrappedComponent {...props} />
                </RouterDomLink>
            );
        };
    },
);
