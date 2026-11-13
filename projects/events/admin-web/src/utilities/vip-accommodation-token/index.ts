import { createHmac, timingSafeEqual } from 'node:crypto';

import type * as Types from './type';

const TOKEN_DOMAIN = 'vip-accommodation-v1';

const getSigningSecret = (): string => {
   return process.env.VIP_ACCOMMODATION_TOKEN_SECRET?.trim() || '';
};

const computeSignature = (encodedPayload: string, secret: string): string => {
   return createHmac('sha256', `${secret}:${TOKEN_DOMAIN}`).update(encodedPayload).digest('base64url');
};

/**
 * Signs a tamper-proof token identifying a VIP attendant within a game.
 */
export const signVipAccommodationToken = (payload: Types.VipAccommodationTokenPayload): string => {
   const secret = getSigningSecret();

   if (!secret) {
      throw new Error('Missing signing secret for VIP accommodation token.');
   }

   const compact: Types.CompactPayload = {
      aid: payload.attendantId,
      gid: payload.gameId,
   };

   const encodedPayload = Buffer.from(JSON.stringify(compact), 'utf8').toString('base64url');
   const signature = computeSignature(encodedPayload, secret);

   return `${encodedPayload}.${signature}`;
};

/**
 * Verifies an HMAC-signed VIP accommodation token and extracts its payload.
 */
export const verifyVipAccommodationToken = (token: string): Types.VipAccommodationTokenPayload | null => {
   const secret = getSigningSecret();
   const trimmedToken = token.trim();

   if (!secret || !trimmedToken) {
      return null;
   }

   const parts = trimmedToken.split('.');
   if (parts.length !== 2) {
      return null;
   }

   const [encodedPayload, signature] = parts;
   if (!encodedPayload || !signature) {
      return null;
   }

   const expectedSignature = computeSignature(encodedPayload, secret);
   const sigBuffer = Buffer.from(signature, 'utf8');
   const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

   if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
   }

   try {
      const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Partial<Types.CompactPayload>;

      if (
         typeof decoded.aid !== 'string' ||
         typeof decoded.gid !== 'string' ||
         decoded.aid.trim() === '' ||
         decoded.gid.trim() === ''
      ) {
         return null;
      }

      return {
         attendantId: decoded.aid,
         gameId: decoded.gid,
      };
   } catch {
      return null;
   }
};
