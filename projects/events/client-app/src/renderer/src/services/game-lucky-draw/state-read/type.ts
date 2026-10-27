export type Prize = ClientApp.Features.GameLuckyDraw.Prize;
export type Participant = ClientApp.Features.GameLuckyDraw.Participant;
export type Winner_Entry = ClientApp.Features.GameLuckyDraw.WinnerEntry;

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
   full_name: string;
   ticket_code: string;
   company_name: string | null;
   department: string | null;
   has_won: boolean | null;
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
           full_name: string;
           ticket_code: string;
           company_name: string | null;
           department: string | null;
        }
      | {
           id: string;
           full_name: string;
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

export type Service = (request: Request) => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
