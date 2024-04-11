import { dom } from '@trust/utils/dom';
import { random } from '@trust/utils/string/random';

interface FrameOptions {
    payload: any;
    enctype: string;
    method: string;
    url: string;
}

const createInput = (payload: any): HTMLElement => {
    const input = document.createElement('input');

    dom.attrs(input, {
        name: 'payload',
        type: 'hidden',
        value: JSON.stringify(payload),
    });

    return input;
};

const createForm = (
    target: string,
    { payload, enctype, method, url }: FrameOptions,
): HTMLFormElement => {
    const form = document.createElement('form');
    const input = createInput(payload);

    dom.attrs(form, {
        target,
        enctype,
        method,
        action: url,
    });
    dom.add(form, input);

    return form;
};

export const createFrame = (target: string, src?: string): HTMLIFrameElement => {
    const frame = document.createElement('iframe');

    dom.attrs(frame, {
        name: target,
        title: target,
        frameborder: '0',
        tabindex: '-1',
        'aria-hidden': 'true',
    });

    if (src) {
        dom.attrs(frame, {
            src,
        });
    }

    dom.hide(frame);

    return frame;
};

export const openIframe = (parent: HTMLElement, options: FrameOptions): HTMLIFrameElement => {
    const target = `ya-frame-${random(8)}`;
    const form = createForm(target, options);
    const frame = createFrame(target);

    dom.add(document.body, form);
    dom.add(parent, frame);

    form.submit();

    setTimeout(() => {
        dom.remove(form);
    }, 0);

    return frame;
};
