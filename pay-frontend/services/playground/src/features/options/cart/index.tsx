import * as React from 'react';

import { Panel } from 'components/panel';
import { PanelOption } from 'components/panel-option';
import { RadioButton } from 'components/radio-button';
import { Select } from 'components/select';
import { Toggle } from 'components/toggle';
import { useOption, useAvailableOptions } from 'hooks/use-options';

interface CartProps {
    country?: boolean;
    plus?: boolean;
    cash?: boolean;
    split?: boolean;
    chaas?: boolean;
    merchant?: boolean;
    dynamicCart?: boolean;
    receipt?: boolean;
}

export function Cart(props: CartProps) {
    return (
        <Panel caption="Корзина">
            {props.country ? (
                <PanelOption label="Страна">
                    <CountrySelector />
                </PanelOption>
            ) : null}

            <PanelOption label="Валюта">
                <CurrencySelector />
            </PanelOption>

            <PanelOption label="Товары">
                <OrderItemsSelector />
            </PanelOption>

            {props.dynamicCart ? (
                <PanelOption label="Динамическая корзина">
                    <DynamicCartTumbler />
                </PanelOption>
            ) : null}

            {props.plus ? (
                <PanelOption label="Баллы плюса">
                    <PlusTumbler />
                </PanelOption>
            ) : null}

            {props.cash ? (
                <PanelOption label="Оплата наличными">
                    <CashTumbler />
                </PanelOption>
            ) : null}

            {props.split ? (
                <PanelOption label="Сплит">
                    <SplitTumbler />
                </PanelOption>
            ) : null}

            {props.chaas ? (
                <PanelOption label="ЧААС">
                    <PassportChallengeTumbler />
                </PanelOption>
            ) : null}

            {props.merchant ? (
                <PanelOption label="Мерчант">
                    <MerchantItemsSelector />
                </PanelOption>
            ) : null}

            {props.receipt ? (
                <PanelOption label="Чек">
                    <ReceiptTumbler />
                </PanelOption>
            ) : null}
        </Panel>
    );
}

function CountrySelector() {
    const [country, setCountry] = useOption(['country']);
    const countriesOptions = useAvailableOptions(['countries']);

    return (
        <RadioButton
            name="country"
            options={countriesOptions.map((c) => ({ label: c, value: c }))}
            value={country}
            onChange={setCountry}
        />
    );
}

function CurrencySelector() {
    const [currency, setCurrency] = useOption(['currency']);
    const currenciesOptions = useAvailableOptions(['currencies']);

    return (
        <Select
            name="currency"
            options={currenciesOptions.map((c) => ({ label: c, value: c }))}
            value={currency}
            onChange={setCurrency}
        />
    );
}

function OrderItemsSelector() {
    const [orderItems, setOrderItems] = useOption(['order']);
    const cartOptions = useAvailableOptions(['orderOptions']);

    return (
        <Select
            name="orderItems"
            options={cartOptions}
            value={orderItems}
            onChange={setOrderItems}
        />
    );
}

function MerchantItemsSelector() {
    const [merchantItems, setMerchantItems] = useOption(['merchant']);
    const merchantOptions = useAvailableOptions(['merchantOptions']);

    return (
        <Select
            name="MerchantItems"
            options={merchantOptions}
            value={merchantItems}
            onChange={setMerchantItems}
        />
    );
}

function PlusTumbler() {
    const [plus, setPlus] = useOption(['plus']);

    return <Toggle name="plus" checked={plus} onChange={setPlus} />;
}

function CashTumbler() {
    const [cash, setCash] = useOption(['cash']);

    return <Toggle name="cash" checked={cash} onChange={setCash} />;
}

function ReceiptTumbler() {
    const [receipt, setReceipt] = useOption(['receipt']);

    return <Toggle name="cash" checked={receipt} onChange={setReceipt} />;
}

function SplitTumbler() {
    const [split, setSplit] = useOption(['split']);

    return <Toggle name="split" checked={split} onChange={setSplit} />;
}

function DynamicCartTumbler() {
    const [value, setValue] = useOption(['dynamicCart']);

    return <Toggle name="dynamicCart" checked={value} onChange={setValue} />;
}

function PassportChallengeTumbler() {
    const [passportChallenge, setPassportChallenge] = useOption(['chaas']);

    return (
        <Toggle
            name="passportChallenge"
            checked={passportChallenge}
            onChange={setPassportChallenge}
        />
    );
}
