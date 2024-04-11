import { logFatal } from '@trust/rum';

export const checkUnclosedForm = (source: string, checkDelay = 3000) => {
    setTimeout(() => logFatal(`Pay form not closed (source=${source})`), checkDelay);
};
