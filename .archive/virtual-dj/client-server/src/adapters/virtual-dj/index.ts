import { makeRequest } from '@client-server/adapters/request/axios';

import { VIRTUAL_DJ } from './constants';
import { emitMessage } from '@client-server/adapters/websocket';

export async function createInstance() {
   const url = `http://${VIRTUAL_DJ.HOST}:${VIRTUAL_DJ.PORT}/query?script=${encodeURIComponent('file_count sideview')}`;

   const response = await makeRequest({
      url,
      headers: {
         Authorization: `Bearer ${VIRTUAL_DJ.PASSWORD}`,
      },
   });

   if (response.error) {
      console.error('Failed to connect to Virtual DJ:', response.message);
   } else {
      emitMessage('vdj_connected', {
         count: response.data.data,
      });
   }
}
