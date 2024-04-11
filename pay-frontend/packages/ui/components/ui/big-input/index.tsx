import React from 'react';

import { compose } from '@bem-react/core';
import { Textinput as TextinputDesktop, withViewMaterial } from '@yandex-lego/components/Textinput/desktop';
import { block } from 'bem-cn';

import './styles.css';

const b = block('big-input');

const Textinput = compose(withViewMaterial)(TextinputDesktop);

type TextinputProps = React.ComponentProps<typeof Textinput>;
type BigInputProps = TextinputProps & {
    label: string;
};

export default function BigInput({ className = '', disabled = false, ...props }: BigInputProps): JSX.Element {
    return (
        <div className={b({ disabled }).mix(className).toString()}>
            <Textinput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                disabled={disabled}
                view="material"
            />
        </div>
    );
}
