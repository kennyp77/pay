export const CHARS_AUTOREPLACE = [' ', '-', '+'];

const checkChar = (char: string, mask: string): { status: boolean; char: string } => {
    let status = false;
    let _char = '';

    if (CHARS_AUTOREPLACE.includes(mask)) {
        status = mask === char;
        _char = mask;
    } else {
        switch (mask) {
            default: {
                status = false;
                break;
            }
            case '0': {
                status = /\d/.test(char);
                break;
            }
            case 'A': {
                status = /[A-Z]/.test(char);
                break;
            }
            case 'a': {
                status = /[a-z]/.test(char);
                break;
            }
            case 'А': {
                status = /[А-Я]/.test(char);
                break;
            }
            case 'а': {
                status = /[а-я]/.test(char);
                break;
            }
        }
    }

    return { status, char: _char };
};

export function maskFn(value: string, mask: string) {
    if (!mask || !value) {
        return value;
    }

    let _val = '';
    let maskIndex = 0;

    for (let i = 0; i < value.length; i += 1) {
        const { status, char } = checkChar(value[i], mask[maskIndex]);

        if (status || char) {
            maskIndex += 1;
            _val += char || value[i];
        }

        if (!status && char) {
            i -= 1;
        }
    }

    return _val;
}

export function getMaskedValue(value: string, masks: string[]) {
    return masks.reduce((val, curr) => {
        const newMasked = maskFn(value, curr);

        if (newMasked.length > val.length) {
            return newMasked;
        }

        return val;
    }, '');
}
