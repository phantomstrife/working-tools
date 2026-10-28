import type * as NextJs from 'next/server';
import type * as Supabase from '@admin-web/types/supabase';

declare global {
   declare namespace AdminWeb {
      type Primitive = string | number | boolean | string[] | number[] | boolean[];
      type Object = Record<string, unknown>;

      type Component<T = { children: ReactNode }> = React.FC<T>;
      type ReactNode = React.ReactNode;
      type JSXElement = React.JSX.Element;
   }

   declare namespace AdminWeb.Router {
      type Metadata = NextJs.Metadata;

      type Proxy_Request = NextJs.NextRequest;
      type Proxy_Response = NextJs.NextResponse;

      type Layout = (properties: { children: ReactNode }) => Promise<ReactNode> | ReactNode;
      type Page<T = object> = (properties: { params: Promise<T> }) => Promise<ReactNode> | ReactNode;
   }

   declare namespace AdminWeb.Database {
      type Instance = Supabase.Database;

      type Account_Role = Instance['public']['Enums']['account_role'];
      type Email_Status = Instance['public']['Enums']['email_status_type'];
      type Check_In_Method = Instance['public']['Enums']['check_in_method_type'];
      type Event_Status = Instance['public']['Enums']['event_status'];
      type Game_Status = Instance['public']['Enums']['game_status'];
      type Game_Type = Instance['public']['Enums']['game_type'];

      type Company = Instance['public']['Tables']['companies']['Row'];
      type Account = Instance['public']['Tables']['accounts']['Row'];
      type Event = Instance['public']['Tables']['events']['Row'];
      type EventInsert = Instance['public']['Tables']['events']['Insert'];
      type EventUpdate = Instance['public']['Tables']['events']['Update'];
      type EventWithGames = Event & { games: Game[] };
      type Game = Instance['public']['Tables']['games']['Row'];
      type GameInsert = Instance['public']['Tables']['games']['Insert'];
      type GameUpdate = Instance['public']['Tables']['games']['Update'];
      type GameAccount = Instance['public']['Tables']['game_accounts']['Row'];
      type GameLuckyDrawAttendant = Instance['public']['Tables']['lucky_draw_attendants']['Row'];
      type GameLuckyDrawAttendantInsert = Instance['public']['Tables']['lucky_draw_attendants']['Insert'];
      type GameLuckyDrawAttendantUpdate = Instance['public']['Tables']['lucky_draw_attendants']['Update'];
      type GameLuckyDrawPrize = Instance['public']['Tables']['lucky_draw_prizes']['Row'];
      type GameLuckyDrawPrizeInsert = Instance['public']['Tables']['lucky_draw_prizes']['Insert'];
      type GameLuckyDrawPrizeUpdate = Instance['public']['Tables']['lucky_draw_prizes']['Update'];
      type GameLuckyDrawWinner = Instance['public']['Tables']['lucky_draw_winners']['Row'];
   }

   declare namespace AdminWeb.Features.Game {
      interface AssignedGame {
         id: string;
         name: string;
         status: Database.Game_Status;
         game_type: Database.Game_Type;
         config: Database.Game['config'];
      }

      interface AssignedEvent {
         id: string;
         name: string;
         location_name: string | null;
         start_time: string;
         games: AssignedGame[];
      }
   }

   declare namespace AdminWeb.Features.GameLuckyDraw {
      type DrawMode = 'auto' | 'manual' | 'instant';
      type ThemeName = 'theme-02';

      interface Prize {
         id: string;
         name: string;
         description: string | null;
         imageUrl: string;
         tierOrder: number;
         totalQuantity: number;
         remainingQuantity: number;
      }

      interface Participant {
         id: string;
         ticketCode: string;
         name: string;
         companyName: string | null;
         department: string | null;
         hasWon: boolean;
         isAbsentForfeited: boolean;
      }

      interface WinnerEntry {
         id: string;
         prizeId: string;
         attendantId: string;
         ticketCode: string;
         name: string;
         companyName: string | null;
         department: string | null;
         wonAt: string | null;
      }

      interface Notice {
         kind: 'error' | 'warning' | 'info';
         text: string;
      }
   }

   declare namespace AdminWeb.Features.GameLuckyDraw.CheckIn {
      type Status = 'CHECKED_IN' | 'ALREADY_CHECKED_IN';

      type Attendant = Pick<
         Database.GameLuckyDrawAttendant,
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

      type Result =
         | { kind: 'SUCCESS' | 'ALREADY'; attendant: Attendant; at: number }
         | { kind: 'ERROR'; message: string; at: number };
   }

   declare namespace AdminWeb.Features.GameLuckyDraw.Attendant {
      type Filter =
         | ''
         | 'CHECKED_IN'
         | 'NOT_CHECKED_IN'
         | 'WINNER'
         | 'NOT_WINNER'
         | 'EMAIL_SENT'
         | 'EMAIL_PENDING';
   }

   declare namespace AdminWeb.Features.GameLuckyDraw.Prize {
      type Filter = '' | 'IN_STOCK' | 'DEPLETED';
      type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'DEPLETED';
   }

   declare namespace AdminWeb.Features.GameLuckyDraw.Staff {
      type Filter = '' | 'FIELD_STAFF' | 'GUARD';
   }

   declare namespace AdminWeb.Store.Session {
      type Status = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

      interface Account {
         id: string;
         email: string;
         full_name: string;
         role: Database.Account_Role;
         company_id: string | null;
      }
   }

   declare namespace AdminWeb.Store.Modal {
      interface Functions {
         open: (event?: React.MouseEvent | MouseEvent) => void;
         close: () => void;
      }
   }

   declare namespace AdminWeb.Utilities.Trycatch {
      type Result<T> = Resolved<T> | NotResolved;
      type ResultAsync<T> = Promise<Resolved<T> | NotResolved>;

      interface Debug extends Error {
         rawError?: unknown;
      }

      interface NotResolved {
         debug: Debug;
         message: string;
         error: true;
      }

      interface Resolved<T> {
         data: T;
         error: false;
      }
   }
}

export {};
