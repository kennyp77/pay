type CnParams = Record<string, string | boolean>;

/**
 * @example
 * const cn = getClassName('abc');
 * cn()                // 'abc'
 * cn({ a: 1 })        // 'abc abc_a_1
 * cn('def')           // 'abc__def'
 * cn('def', { a: 1 }) // 'abc__def_a_1'
 * cn('', { a: 1 })    // 'abc_a_1'
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getClassName = (base: string) => {
    function cn(): string;
    function cn(params: CnParams): string;
    function cn(element: string, params: CnParams): string;
    function cn(...args: any[]): string {
        const classes: string[] = [];
        const params: CnParams = args.pop();
        const element: string = args.pop();

        if (element !== '') {
            const baseClass = element ? `${base}__${element}` : base;

            classes.push(baseClass);
        }

        if (params) {
            // eslint-disable-next-line no-restricted-syntax
            for (const [name, value] of Object.entries(params)) {
                if (typeof value === 'boolean') {
                    if (value === true) {
                        classes.push(`${base}_${name}`);
                    }
                } else {
                    classes.push(`${base}_${name}_${value}`);
                }
            }
        }

        return classes.join(' ').toLowerCase();
    }

    return cn;
};
