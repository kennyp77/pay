import isString from '@tinkoff/utils/is/string';

type Selector = string | HTMLElement;
type SelectorWithShadow = Selector | ShadowRoot;
type Primitive = string | number | boolean;

interface AnimateOptions {
    timingFunction?: string;
    duration?: string;
    delay?: string;
    property: string;
    from: string;
    to: string;
}

const findNode = <T = HTMLElement>(selector: T | string): HTMLElement | T | null =>
    isString(selector) ? document.querySelector<HTMLElement>(selector) : selector;

function remove(selector: SelectorWithShadow): void {
    const node = findNode(selector);

    if (node) {
        node.parentElement.removeChild(node);
    }
}

function add(parentSelector: SelectorWithShadow, node: HTMLElement): void {
    const parent = findNode(parentSelector);

    if (parent) {
        parent.appendChild(node);
    }
}

function removeClass(selector: Selector, className: string): void {
    const node = findNode(selector);

    if (node) {
        node.classList.remove(className);
    }
}

function addClass(selector: Selector, className: string): void {
    const node = findNode(selector);

    if (node) {
        node.classList.add(className);
    }
}

function toggleClass(selector: Selector, className: string, enable: boolean): void {
    if (enable) {
        addClass(selector, className);
    } else {
        removeClass(selector, className);
    }
}

type AllEventHandlers = GlobalEventHandlersEventMap &
    WindowEventHandlersEventMap &
    DocumentEventMap;

function off<K extends keyof AllEventHandlers>(
    selector: EventTarget | Selector,
    type: K,
    callback: Sys.CallbackFn1<AllEventHandlers[K]>,
): void {
    const node = findNode<EventTarget>(selector as Selector);

    if (node) {
        node.removeEventListener(type, callback);
    }
}

function on<K extends keyof AllEventHandlers>(
    selector: EventTarget | Selector,
    type: K,
    callback: Sys.CallbackFn1<AllEventHandlers[K]>,
): Sys.CallbackFn0 {
    const node = findNode<EventTarget>(selector as Selector);

    if (node) {
        node.addEventListener(type, callback);

        return (): void => off(node, type, callback);
    }

    return (): void => undefined;
}

function attrs(selector: Selector, record: Record<string, Primitive>): void {
    const node = findNode(selector);

    if (!node) {
        return;
    }

    Object.keys(record).forEach((key) => {
        node.setAttribute(key, String(record[key]));
    });
}

function style(selector: Selector, record: Record<string, Primitive>, important = false): void {
    const node = findNode(selector);

    if (!node) {
        return;
    }

    Object.keys(record).forEach((key) => {
        node.style.setProperty(key, String(record[key]), important ? 'important' : undefined);
    });
}

function hide(selector: Selector): void {
    style(selector, { display: 'none' });
}

function show(selector: Selector, display = 'block'): void {
    style(selector, { display });
}

function animate(
    selector: Selector,
    {
        timingFunction = 'ease-in-out',
        duration = '200ms',
        delay = '0',
        property,
        from,
        to,
    }: AnimateOptions,
): void {
    const node = findNode(selector);

    if (!node) {
        return;
    }
    style(selector, {
        'transition-timing-function': timingFunction,
        'transition-duration': duration,
        'transition-delay': delay,
        'transition-property': property,
        [property]: from,
    });

    setTimeout(() => {
        style(selector, {
            [property]: to,
        });
    }, 0);
}

export const dom = {
    remove,
    add,
    removeClass,
    addClass,
    toggleClass,
    findNode,
    off,
    on,
    attrs,
    style,
    hide,
    show,
    animate,
};
