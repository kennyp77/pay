class FormEvent {
    public target: {
        type: string;
        id?: string;
        name?: string;
        value?: any;
    };
    constructor(type: string, id?: string, name?: string, value?: any) {
        this.target = { type, id, name, value };
    }
}

export class FormBlurEvent extends FormEvent {
    constructor(id?: string, name?: string) {
        super('blur', id, name);
    }
}

export class FormFocusEvent extends FormEvent {
    constructor(id?: string, name?: string) {
        super('focus', id, name);
    }
}

export class FormChangeEvent<V> extends FormEvent {
    constructor(value: V, id?: string, name?: string) {
        super('change', id, name, value);
    }
}
