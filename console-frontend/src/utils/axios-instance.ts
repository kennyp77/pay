import axios from 'axios';

import { axiosStoreUrl } from 'const';
import { setupInterceptorsTo } from 'utils/interceptors';

const serverApi = setupInterceptorsTo(
  axios.create({
    baseURL: '/',
  }),
);

const api = setupInterceptorsTo(
  axios.create({
    baseURL: axiosStoreUrl,
  }),
);

export { serverApi, api };
