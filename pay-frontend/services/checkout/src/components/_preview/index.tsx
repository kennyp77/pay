/* eslint-disable */

import React from 'react';
import { cn } from '@bem-react/classname';
import isArray from '@tinkoff/utils/is/array';
import isObject from '@tinkoff/utils/is/plainObject';
import isBoolean from '@tinkoff/utils/is/boolean';
import isUndefined from '@tinkoff/utils/is/undefined';
import toPairs from '@tinkoff/utils/object/toPairs';

import './styles.scss';

type PropName = string;
type PropVariant =
    | { type: 'info'; required: boolean; comment: string }
    | { type: 'list'; required: boolean; values: string[] }
    | { type: 'boolean'; required: boolean; value: any };
type PropsList = Array<[PropName, PropVariant]>;
type PropActive = Record<PropName, any>;

interface PreviewProps {
    title: string;
    component: React.ComponentType<any>;
    dynamicProps: Record<string, any>;
    staticProps?: Record<string, any>;
    canvas?: React.ComponentType<any>;
}

interface PreviewState {
    propsList: PropsList;
    propActive: PropActive;
}

const cnPreview = cn('Preview');

const DefaultCanvas: React.FC = (props) => <div {...props} />;

export class Preview extends React.PureComponent<PreviewProps, PreviewState> {
    static defaultProps = {
        canvas: DefaultCanvas,
        staticProps: {},
    };

    constructor(props: PreviewProps) {
        super(props);

        this.state = {
            ...this.initState(props),
        };
    }

    initState(props: PreviewProps) {
        const { dynamicProps } = props;
        const propsList: PropsList = [];
        const propActive: PropActive = {};

        toPairs(dynamicProps).forEach(([name, _data]) => {
            const data = isObject(_data) ? _data : { value: _data };
            let initialValue;

            const meta: any = {
                required: !data.optional,
                comment: data.comment,
            };

            if (isArray(data.value)) {
                meta.type = 'list';
                meta.values = data.optional ? ['', ...data.value] : data.value;
                initialValue = meta.values[0];
            } else if (isBoolean(data.value)) {
                meta.required = false;
                meta.type = 'boolean';
                meta.value = true;
                initialValue = data.value;
            } else {
                meta.type = meta.required ? 'info' : 'boolean';
                meta.value = data.value;
            }

            if (!isUndefined(initialValue)) {
                propActive[name] = initialValue;
            }

            propsList.push([name, meta]);
        });

        return { propsList, propActive };
    }

    onChange = (name: PropName, value: any) => {
        const { propActive } = this.state;

        this.setState({ propActive: { ...propActive, [name]: value } });
    };

    renderProp(name: PropName, data: PropVariant) {
        const { propActive } = this.state;

        const propValue = propActive[name];

        if (data.type === 'info') {
            return <span className={cnPreview('PropVariant', { type: data.type })}>{data.comment}</span>;
        }

        if (data.type === 'boolean') {
            return (
                <span className={cnPreview('PropVariant', { type: data.type })}>
                    <input
                        type="checkbox"
                        checked={Boolean(propValue)}
                        onChange={() => this.onChange(name, propValue ? null : data.value)}
                    />
                </span>
            );
        }

        if (data.type === 'list') {
            return (
                <span className={cnPreview('PropVariant', { type: data.type })}>
                    <select value={propValue} onChange={(event: any) => this.onChange(name, event.target.value)}>
                        {data.values.map((value, key) => (
                            <option key={`${value}${key}`} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </span>
            );
        }

        return 'TBD';
    }

    render() {
        const { title, staticProps, canvas: Canvas, component: Component } = this.props;
        const { propsList, propActive } = this.state;

        return (
            <div className={cnPreview()}>
                <h2 className={cnPreview('Title')}>{title}</h2>
                <div className={cnPreview('Row')}>
                    <ul className={cnPreview('Props')}>
                        {propsList.map(([name, data]) => (
                            <li className={cnPreview('PropsItem')} key={name}>
                                <label className={cnPreview('PropsItemLabel')}>
                                    <span className={cnPreview('PropName')}>{name}</span>
                                    <span className={cnPreview('PropData')}>{this.renderProp(name, data)}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                    <div className={cnPreview('Example')}>
                        <Canvas>
                            <Component {...staticProps} {...propActive} />
                        </Canvas>
                    </div>
                </div>
            </div>
        );
    }
}
