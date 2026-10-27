export type Attendant = ClientApp.Features.GameLuckyDraw.CheckIn.Attendant;

export type Request =
   | { gameId: string; method: 'QR_SCAN'; qrCodePayload: string }
   | { gameId: string; method: 'MANUAL_SEARCH'; attendantId: string; searchQuery: string };

export interface Response {
   status: ClientApp.Features.GameLuckyDraw.CheckIn.Status;
   attendant: Attendant;
}

export type Service = (request: Request) => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
