import { count, goal } from './utils';

export const formReady = goal('pay_form_ready');

export const formLoad = count('pay_form_load');
export const formClose = count('pay_form_close');

export const logout = count('auth_logout');

export const formLosed = goal('pay_form_lose');
