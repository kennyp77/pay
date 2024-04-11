import React, { Component } from 'react';

import { logFatal } from '@trust/rum';

interface ErrorBoundaryProps {
    children: JSX.Element;
    onError?: JSX.Element;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(err: Error, errorInfo: React.ErrorInfo): void {
        logFatal(err, { type: 'render_error', ...errorInfo });
    }

    render(): JSX.Element {
        const { hasError } = this.state;
        const { children, onError } = this.props;

        if (hasError && onError) {
            return onError;
        }

        return children;
    }
}
