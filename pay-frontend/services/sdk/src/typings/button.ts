import { Listener } from './common';

/**
 * Настройки платёжной кнопки.
 */

/**
 * Вид кнопки Yandex Pay
 */
export enum ButtonType {
    Simple = 'SIMPLE',
    Pay = 'PAY',
    Checkout = 'CHECKOUT',
}

/**
 * Тема кнопки Yandex Pay
 */
export enum ButtonTheme {
    White = 'WHITE',
    WhiteOutlined = 'WHITE-OUTLINED',
    Black = 'BLACK',
    Yellow = 'YELLOW',
}

/**
 * Ширина кнопки Yandex Pay
 */
export enum ButtonWidth {
    Auto = 'AUTO',
    Max = 'MAX',
}

/**
 * События платёжной кнопки.
 */

export enum ButtonEventType {
    Click = 'CLICK',
}

export type ButtonParent = HTMLElement | ShadowRoot;

export interface ButtonOptions {
    /**
     * @default ButtonType.Simple
     */
    type?: ButtonType;

    /**
     * @default ButtonTheme.Black
     */
    theme?: ButtonTheme;

    /**
     * @default ButtonWidth.Auto
     */
    width?: ButtonWidth;

    /**
     * Временные настраиваемые данные
     */
    withGiftBadge10p?: boolean;
}

export interface ButtonStyles {
    border: number;
    height: number;
}

/**
 * Конструктор платёжной кнопки.
 */

export declare class Button {
    constructor(options: ButtonOptions);

    static create(options: ButtonOptions): Button;

    /**
     * Добавить кнопку в dom-дерева.
     */
    mount(parent: ButtonParent): void;

    /**
     * Удалить кнопку из dom-дерева.
     */
    unmount(): void;

    /**
     * Удаляет все слушатели с кнопки и кнопку из dom-дерева.
     */
    destroy(): void;

    /**
     * Слушатель на клик.
     * Используйте этот параметр для запуска процесса оплаты на клик по кнопке.
     */
    on(type: ButtonEventType.Click, listener: Listener<MouseEvent>): void;
}
