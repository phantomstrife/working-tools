export interface Request {
   gameId: string;
   prizeId: string;
   revokeWinnerRecordId?: string;
   excludeAttendantIds?: string[];
}

export interface Response {
   winner: {
      id: string;
      game_id: string;
      prize_id: string;
      attendant_id: string;
      drawn_by: string | null;
      won_at: string | null;
   };
   attendant: {
      id: string;
      full_name: string;
      ticket_code: string;
      email: string | null;
      phone: string | null;
      company_name: string | null;
      department: string | null;
      has_won: boolean | null;
   };
   prize: {
      id: string;
      game_id: string;
      name: string;
      description: string | null;
      image_url: string | null;
      tier_order: number;
      total_quantity: number;
      remaining_quantity: number;
   };
   revokedWinnerRecordId: string | null;
   revokedAttendantId: string | null;
}

export type Service = (request: Request) => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
