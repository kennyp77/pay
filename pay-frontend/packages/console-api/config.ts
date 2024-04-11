import { createGetter } from '@trust/utils/object';

const configGetter = createGetter(window.__CONFIG);

export const API_CONSOLE_HOST = configGetter<string>(['services', 'console']);
