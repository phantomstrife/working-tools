export type Prize = AdminWeb.Features.GameLuckyDraw.Prize;
export type Participant = AdminWeb.Features.GameLuckyDraw.Participant;
export type Winner_Entry = AdminWeb.Features.GameLuckyDraw.WinnerEntry;

export interface Prize_Row {
   id: string;
   name: string;
   description: string | null;
   image_url: string | null;
   tier_order: number;
   total_quantity: number;
   remaining_quantity: number;
}

export interface Participant_Row {
   id: string;
   salutation: string | null;
   full_name: string;
   phone: string | null;
   representative_salutation: string | null;
   representative: string | null;
   representative_phone: string | null;
   ticket_code: string;
   company_name: string | null;
   department: string | null;
   has_won: boolean | null;
   is_draw_eligible: boolean;
   custom_metadata: unknown;
}

export interface Winner_Row {
   id: string;
   prize_id: string;
   attendant_id: string;
   won_at: string | null;
   attendant:
      | {
           id: string;
           salutation: string | null;
           full_name: string;
           phone: string | null;
           representative_salutation: string | null;
           representative: string | null;
           representative_phone: string | null;
           ticket_code: string;
           company_name: string | null;
           department: string | null;
        }
      | {
           id: string;
           salutation: string | null;
           full_name: string;
           phone: string | null;
           representative_salutation: string | null;
           representative: string | null;
           representative_phone: string | null;
           ticket_code: string;
           company_name: string | null;
           department: string | null;
        }[]
      | null;
}

export interface Request {
   gameId: string;
}

export interface Response {
   prizes: Prize[];
   participants: Participant[];
   winners: Winner_Entry[];
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
