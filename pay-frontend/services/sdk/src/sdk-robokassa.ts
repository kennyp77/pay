import icon from './assets/robokassa-icon.svg';
import { ASSETS_URL } from './config';

const getTabIconFullSrc = (src: string): string => `${ASSETS_URL}${src}`;

export const Robokassa = {
    getTabIcon: (): Promise<string> => Promise.resolve(getTabIconFullSrc(icon)),
};
