import React, { ReactNode } from 'react';

import { Fullscreen } from '../fullscreen';

interface FullscreenLayoutProps {
    children: ReactNode;
    fixed?: boolean;
}

export function FullscreenLayout({ children, fixed }: FullscreenLayoutProps) {
    return (
        <Fullscreen bg="white" fullHeight fixed={fixed}>
            {children}
        </Fullscreen>
    );
}
