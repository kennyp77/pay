import { logFatal } from '@trust/rum';
import { Template } from '@trust/ui/typings';

import { TEMPLATE } from '../config';

export const isTouchTemplate = () => TEMPLATE === Template.Touch;

export const checkUnclosedForm = (source: string, checkDelay = 3000) => {
    setTimeout(() => logFatal(`Checkout not closed (source=${source})`), checkDelay);
};
