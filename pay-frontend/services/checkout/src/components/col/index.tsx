import React from 'react';

import { Row, RowProps } from '../row';

export interface ColProps extends Omit<RowProps, 'align' | 'justify'> {
    justify?: 'start' | 'center' | 'end';
    align?: 'start' | 'center' | 'end' | 'between';
}

export class Col extends React.PureComponent<ColProps & React.HTMLAttributes<HTMLDivElement>> {
    static Spacer = Row.Spacer;

    render() {
        const { justify, align, ...props } = this.props;

        return <Row {...props} direction="col" align={justify} justify={align} />;
    }
}
