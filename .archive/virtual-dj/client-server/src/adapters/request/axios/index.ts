import axios, { isAxiosError } from 'axios';

import { random } from '@client-server/utilities/number';
import { trycatchAsync } from '@client-server/utilities/trycatch';

import { HEADERS, POOLS } from './constants';

import type * as Types from './type';

const instance = axios.create();

instance.interceptors.response.use(
   (response) => response,
   (error: unknown) => {
      let message = Error.isError(error) ? error.message : String(error);

      if (isAxiosError(error) && error.response) {
         message = JSON.stringify(error.response.data);
      }

      return Promise.reject(new Error(message));
   },
);

export const makeRequest: Types.Make_Request = async (_request) => {
   const { agent, ...request } = _request;

   if (agent) {
      const randomHeader = random(0, HEADERS.length - 1);
      const randomPool = random(0, POOLS.length - 1);

      request.headers = {
         ...HEADERS[randomHeader],
         ...request.headers,
      };

      request.headers['User-Agent'] = POOLS[randomPool];
      request.httpAgent = agent;
      request.httpsAgent = agent;
      request.maxBodyLength = Infinity;
   }

   return await trycatchAsync(async () => instance(request));
};
