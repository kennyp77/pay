/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useRef, useEffect } from 'react';

import { block } from 'bem-cn';

import { CopyButton } from './copy-button';
import './index.css';

require('highlight.js/styles/github.css');

const hljs = require('highlight.js/lib/core');

hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'));

const b = block('highlighter');

interface HlProps {
    lang: string;
    code: string;
    className?: string;
}

export function Highlighter({ lang, code, className }: HlProps): JSX.Element {
    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = hljs.highlight(code, { language: lang }).value;
        }
    }, [lang, code]);

    return (
        <div className={b.mix(className)}>
            <CopyButton textToCopy={code} className={b('copy')} />
            <pre>
                <code ref={ref} />
            </pre>
        </div>
    );
}
