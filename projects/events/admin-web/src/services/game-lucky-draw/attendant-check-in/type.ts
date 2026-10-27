export type Check_In_Method = AdminWeb.Database.Check_In_Method;
export type Account_Role = AdminWeb.Database.Account_Role;
export type Attendant = Pick<
   AdminWeb.Database.GameLuckyDrawAttendant,
   | 'id'
   | 'full_name'
   | 'ticket_code'
   | 'email'
   | 'phone'
   | 'company_name'
   | 'department'
   | 'is_checked_in'
   | 'checked_in_at'
   | 'check_in_method'
>;

export interface Request {
   accessToken: string;
   gameId: string;
   method: Check_In_Method;
   qrCodePayload?: string;
   attendantId?: string;
   searchQuery?: string;
}

export interface Response {
   status: 'CHECKED_IN' | 'ALREADY_CHECKED_IN';
   attendant: Attendant;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

