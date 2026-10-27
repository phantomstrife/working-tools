import { NextResponse } from 'next/server';

import { CORS_HEADERS, ERROR_STATUS } from './constants';

import type * as Types from './type';

export const readBearerToken: Types.Read_Bearer_Token = (request) => {
   const authorization = request.headers.get('authorization') ?? '';
   const [scheme, token] = authorization.split(' ');

   if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return '';
   }

   return token.trim();
};

export const corsPreflight: Types.Cors_Preflight = () => {
   return new NextResponse(null, {
      status: 204,
      headers: CORS_HEADERS,
   });
};

export const corsJson: Types.Cors_Json = (body, status = 200) => {
   return NextResponse.json(body, {
      status,
      headers: CORS_HEADERS,
   });
};

export const resolveErrorStatus: Types.Resolve_Error_Status = (message) => {
   return ERROR_STATUS[message] ?? 400;
};

