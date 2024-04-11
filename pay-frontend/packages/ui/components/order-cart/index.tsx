import React, { useCallback, useRef, useState } from 'react';

import { OrderItem } from '@yandex-pay/sdk/src/typings';
import { block } from 'bem-cn';

import OrderCartItem from '../order-cart-item';
import Icon from '../ui/icon';
import Link from '../ui/link';
import { OutsideClickWrapper } from '../ui/outside-click-wrapper';
import { Popup } from '../ui/popup';

import './styles.css';

const b = block('order-cart');

interface OrderCartProps {
    items: OrderItem[];
    currency: string;
}

export default function OrderCart({ items, currency }: OrderCartProps): JSX.Element {
    const innerRef = useRef<HTMLDivElement>(null);
    const linkRef = useRef<HTMLDivElement>(null);

    const [visible, setVisible] = useState(false);

    const onClick = useCallback(() => {
        setVisible(!visible);
    }, [visible]);

    return (
        <div className={b()} ref={innerRef}>
            <OutsideClickWrapper targetRef={innerRef} visible={visible} onOutsideClick={onClick}>
                <div className={b('button')} ref={linkRef}>
                    <Link onClick={onClick} theme="grey">
                        <Icon glyph="chevron" className={b('chevron', { visible })} />
                    </Link>
                </div>

                <Popup
                    view="default"
                    direction="bottom"
                    hasTail
                    visible={visible}
                    target="anchor"
                    anchor={linkRef}
                    scope="inplace"
                >
                    <div className={b('items')}>
                        <table className={b('items-inner')}>
                            <tbody>
                                {items.map((item, i) => (
                                    <OrderCartItem item={item} currency={currency} key={i} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Popup>
            </OutsideClickWrapper>
        </div>
    );
}
