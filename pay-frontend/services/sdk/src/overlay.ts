import { dom } from '@trust/utils/dom';
import { EventEmitter } from '@trust/utils/event-emitter';

enum Events {
    Click = 'click',
}

interface EventsMap {
    [Events.Click]: undefined;
}

export class Overlay extends EventEmitter<EventsMap> {
    static Events = Events;

    private static instance: Overlay;

    private element: HTMLDivElement;

    static getInstance(): Overlay {
        if (this.instance) {
            return this.instance;
        }

        return new Overlay();
    }

    constructor() {
        super();

        this.mount();
    }

    private mount(): void {
        const element = document.createElement('div');

        dom.style(
            element,
            {
                'z-index': 2147483647,
                display: 'none',
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                'background-color': 'rgba(32, 33, 36, .6)',
            },
            true,
        );
        dom.add(document.body, element);
        dom.on(element, 'click', this.onClick);

        this.element = element;
    }

    private onClick = (): void => {
        this.emit(Events.Click, undefined);
    };

    show(): void {
        dom.style(this.element, {
            display: 'block',
        });
    }

    hide(): void {
        dom.style(this.element, {
            display: 'none',
        });
    }

    destroy(): void {
        super.destroy();
        dom.off(this.element, 'click', this.onClick);
        dom.remove(this.element);
    }
}
