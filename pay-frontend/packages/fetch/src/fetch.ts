import errorByStatusDecorator, { ErrorByStatusFn } from './decorators/error-by-status';
import retryDecorator from './decorators/retry';
import createInstance from './lib/instance';
import request from './lib/request';

const defaultOptions = {
    method: 'GET' as 'GET',
    errorByStatus: ((status) => status < 200 || status >= 300) as ErrorByStatusFn,
};

const defaultDecorators = [errorByStatusDecorator, retryDecorator];

export default createInstance(defaultOptions, defaultDecorators, request);
