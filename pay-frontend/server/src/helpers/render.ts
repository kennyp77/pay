import serialize from 'serialize-javascript';

export type RenderData = Record<string, string | number | boolean>;

function addNonce(template: string, nonce: string): string {
    return template.replace(/<script(.*?)>/g, (match: string, attrs: string): string =>
        attrs.includes('src') ? match : `<script nonce="${nonce}" ${attrs}>`,
    );
}

export function render(tpl: string, data: RenderData = {}, nonce?: string): string {
    const dataMap = new Map(Object.entries(data));
    const replaceKeyRegex = /\W/g;

    const template = tpl.replace(/['"]?%%.+?%%['"]?|##.+?##|/g, (match: string): string => {
        const key = match.replace(replaceKeyRegex, '');

        if (!dataMap.has(key)) {
            // TODO: Log error
            return '';
        }

        const value = dataMap.get(key);

        if (match.startsWith('#')) {
            return String(value);
        }

        return serialize(value, { isJSON: true });
    });

    return nonce ? addNonce(template, nonce) : template;
}
