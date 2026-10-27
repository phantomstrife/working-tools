import type * as Types from './type';

export const generateQrCodePayload: Types.Generate_Qr_Code_Payload = (gameId, ticketCode) => {
   return `${gameId}:${ticketCode.trim()}:${crypto.randomUUID()}`;
};

