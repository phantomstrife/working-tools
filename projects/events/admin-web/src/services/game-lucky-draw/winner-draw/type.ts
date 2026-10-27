export type Account_Role = AdminWeb.Database.Account_Role;
export type Prize = Pick<
   AdminWeb.Database.GameLuckyDrawPrize,
   'id' | 'game_id' | 'name' | 'description' | 'image_url' | 'tier_order' | 'total_quantity' | 'remaining_quantity'
>;
export type Attendant = Pick<
   AdminWeb.Database.GameLuckyDrawAttendant,
   'id' | 'full_name' | 'ticket_code' | 'email' | 'phone' | 'company_name' | 'department' | 'has_won' | 'custom_metadata'
>;

export interface Winner_Record {
   id: string;
   game_id: string;
   prize_id: string;
   attendant_id: string;
   drawn_by: string | null;
   won_at: string | null;
}

export interface Request {
   accessToken: string;
   gameId: string;
   prizeId: string;
   revokeWinnerRecordId?: string;
   excludeAttendantIds?: string[];
}

export interface Response {
   winner: Winner_Record;
   attendant: Omit<Attendant, 'custom_metadata'>;
   prize: Prize;
   revokedWinnerRecordId: string | null;
   revokedAttendantId: string | null;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

