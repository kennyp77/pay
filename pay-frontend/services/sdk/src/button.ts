import { timeEnd, timeStart } from '@trust/rum/light/delta-logger';
import { logError } from '@trust/rum/light/error-logger';
import { dom } from '@trust/utils/dom';
import { EventEmitter } from '@trust/utils/event-emitter';
import {
    SdkPaymentMethodEventType,
    SdkPaymentMethodReadyEvent,
} from '@yandex-pay/sdk-payment-method/src/typings';

import { hasExpSync } from './abt';
import { BUTTON_CLASS, BUTTON_LABEL, ASSETS_URL, RUM_DELTA_NAMES } from './config';
import { getClassName } from './helpers/classname';
import { getMainStyle } from './helpers/styles';
import { validateButtonOptions } from './helpers/validation';
import { renderWatcher } from './lib/render-watcher';
import { counters } from './metrika';
import { PaymentProxy } from './payment';
import SdkPaymentMethod from './sdk-payment-method';
import {
    ButtonEventType,
    ButtonParent,
    ButtonType,
    ButtonTheme,
    ButtonWidth,
    ButtonOptions,
    ButtonStyles,
} from './typings';

interface EventsMap {
    [ButtonEventType.Click]: MouseEvent;
}

const cn = getClassName(BUTTON_CLASS);

const defaultOptions = {
    type: ButtonType.Pay,
    theme: ButtonTheme.Black,
    width: ButtonWidth.Auto,
};

const getButtonStyles = (button: HTMLButtonElement): ButtonStyles => {
    const allStyles = getComputedStyle(button);

    return {
        // NB: В FF общий borderRadius пустой
        //     тогда как значения по углам (borderTopRightRadius, etc) заполнены
        border: parseInt(allStyles.borderRadius || allStyles.borderTopRightRadius, 10),
        height: parseInt(allStyles.height, 10),
    };
};

// TODO: extends YaPay.Button
export class Button extends EventEmitter<EventsMap> {
    private static isMainStylesMounted = false;

    private hasShadowRoot = false;

    private payment: PaymentProxy;
    private parent: ButtonParent;
    private options: ButtonOptions;
    private styleElement: HTMLStyleElement;
    private buttonElement: HTMLButtonElement;
    private paymentMethod: SdkPaymentMethod;
    private renderWatcherUnsubscribe = (): void => undefined;

    static create(options: ButtonOptions, payment: PaymentProxy): Button {
        return new Button(options, payment);
    }

    constructor(options: ButtonOptions, payment: PaymentProxy) {
        super();

        try {
            const { sheet } = payment;
            this.payment = payment;

            this.options = {
                ...defaultOptions,
                ...options,
            };

            if (sheet && hasExpSync('yellow_btn', sheet.merchant.id)) {
                this.options.theme = ButtonTheme.Yellow;
            }

            validateButtonOptions(this.options);
        } catch (err) {
            logError('button create', err);
        }
    }

    destroy(): void {
        super.destroy();
        this.unmount();
    }

    mount(parent: ButtonParent): void {
        // TODO: Покрыть тестом кейс с множественными монтированиями
        if (this.parent) {
            this.unmount();
        }

        try {
            this.parent = parent;
            this.hasShadowRoot = window.ShadowRoot !== undefined && parent instanceof ShadowRoot;

            this.mountButton();
            this.mountStyles();
            this.mountPaymentMethod();

            this.renderWatcherUnsubscribe = renderWatcher(this.buttonElement, (watcher) =>
                counters.buttonRender({ watcher }),
            );

            timeEnd(RUM_DELTA_NAMES.ButtonMountFromPaymentCreate);
            timeEnd(RUM_DELTA_NAMES.ButtonMountFromPaymentResolve);
            timeStart(RUM_DELTA_NAMES.PaymentMethodsShowFromButtonMount);
        } catch (err) {
            logError('button mount', err);
        }
    }

    unmount(): void {
        this.parent = undefined;
        this.renderWatcherUnsubscribe();

        this.unmountButton();
        this.unmountStyles();
        this.unmountPaymentMethod();
    }

    private onClick = (event: MouseEvent): void => {
        this.emit(ButtonEventType.Click, event);
    };

    private onSdkPaymentMethodReady = (event: SdkPaymentMethodReadyEvent): void => {
        const { type, theme } = this.options;

        counters.buttonLoad({ theme, type: event.buttonType || type });
        this.showPaymentMethod();
    };

    private onSdkPaymentMethodFailure = (): void => {
        const { type, theme } = this.options;

        counters.buttonLoad({ theme, type });
        this.unmountPaymentMethod();
    };

    private mountButton(): void {
        const { type, theme, width } = this.options;

        const className = cn({ type, theme, width });
        const button = document.createElement('button');

        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', BUTTON_LABEL);
        button.setAttribute('class', className);

        dom.add(this.parent, button);
        dom.on(button, 'click', this.onClick);

        this.buttonElement = button;
    }

    private unmountButton(): void {
        dom.off(this.buttonElement, 'click', this.onClick);
        dom.remove(this.buttonElement);
    }

    private mountStyles(): void {
        const style = document.createElement('style');

        style.setAttribute('type', 'text/css');
        style.textContent = getMainStyle({
            assetsUrl: ASSETS_URL,
            baseClass: BUTTON_CLASS,
        });

        if (this.hasShadowRoot) {
            this.styleElement = style;
            dom.add(this.parent, style);
        } else if (!Button.isMainStylesMounted) {
            document.head.appendChild(style);
            Button.isMainStylesMounted = true;
        }
    }

    private unmountStyles(): void {
        dom.remove(this.styleElement);
    }

    private mountPaymentMethod(): void {
        const buttonStyles = getButtonStyles(this.buttonElement);

        this.paymentMethod = SdkPaymentMethod.create(this.payment, this.options, buttonStyles);
        this.paymentMethod.mount(this.buttonElement);
        this.paymentMethod.on(SdkPaymentMethodEventType.Ready, this.onSdkPaymentMethodReady);
        this.paymentMethod.on(SdkPaymentMethodEventType.Failure, this.onSdkPaymentMethodFailure);
    }

    private unmountPaymentMethod(): void {
        if (this.paymentMethod) {
            this.paymentMethod.destroy();
        }
    }

    private showPaymentMethod(): void {
        const personalisedClass = cn('', { personalised: true });

        dom.addClass(this.buttonElement, personalisedClass);

        if (this.paymentMethod) {
            this.paymentMethod.show();
        }
    }
}
