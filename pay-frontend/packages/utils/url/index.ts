export type SearchParams = Record<string, string | void>;
export type UrlParts = {
    poorUrl: string;
    search: string;
    hash: string;
};

const URL_PARTS_REGEXP = /^([^#?]*)?(\?[^#]*)?(#.*)?$/;

export function redirectTo(url: string): void {
    window.location.assign(url);
}

export function replaceWith(url: string): void {
    history.replaceState(null, document.title, url);
}

export function getSource(): string {
    return window.location.toString();
}

export function getSourceSearch(): string {
    return window.location.search;
}

export function getOrigin(url: string, def = ''): string {
    try {
        return new URL(url).origin;
    } catch (e) {
        return def;
    }
}

export function getUrlParts(url: string): UrlParts {
    const [
        // The full url.
        _url,
        poorUrl = '',
        search = '',
        hash = '',
    ] = url.match(URL_PARTS_REGEXP) || [];

    return {
        poorUrl,
        search,
        hash,
    };
}

export function getSearchString(url: string): string {
    const { search } = getUrlParts(url);

    return search.slice(1);
}

export function getHash(url: string): string {
    const { hash } = getUrlParts(url);

    return hash.slice(1);
}

export function getSearchParams(url: string): SearchParams {
    const searchString = getSearchString(url);
    const searchParams = {} as SearchParams;

    if (!searchString) {
        return searchParams;
    }

    return searchString.split('&').reduce((acc, pair) => {
        const [key, value] = pair.split('=');

        acc[decodeURIComponent(key)] = decodeURIComponent(value);

        return acc;
    }, searchParams);
}

export function createSearchString(searchParams: SearchParams): string {
    return Object.entries(searchParams)
        .filter(([_key, value]) => {
            return value !== undefined;
        })
        .map(([key, value]) => {
            // Don't use URLSearchParams due to lack of support in Edge and Safari.
            return `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`;
        })
        .join('&');
}

export function setSearchParams(url: string, searchParams: SearchParams): string {
    const parts = getUrlParts(url);
    const nextSearchString = createSearchString({
        ...getSearchParams(url),
        ...searchParams,
    });

    return [parts.poorUrl, nextSearchString ? '?' : '', nextSearchString, parts.hash].join('');
}

/**
 * @depricated
 */
export const reloadWithSearchParams = (params: Record<string, string>): void => {
    const newUrl = setSearchParams(getSource(), params);

    window.history.replaceState({ path: newUrl }, '', newUrl);
};
