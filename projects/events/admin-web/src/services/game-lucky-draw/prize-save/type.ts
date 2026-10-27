export interface Request {
   id?: string;
   gameId: string;
   name: string;
   tier_order: number;
   total_quantity: number;
   remaining_quantity: number;
   description?: string | null;
   image_url?: string | null;
}

export interface Response {
   prize: Prize;
}

export type Prize = AdminWeb.Database.GameLuckyDrawPrize;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

