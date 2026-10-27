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

      type Company = Instance['public']['Tables']['companies']['Row'];
      type Event = Instance['public']['Tables']['events']['Row'];
      type EventWithGames = Event & { games: Game[] };
      type Game = Instance['public']['Tables']['games']['Row'];
      type GameAccount = Instance['public']['Tables']['game_accounts']['Row'];
      type GameLuckyDrawAttendant = Instance['public']['Tables']['lucky_draw_attendants']['Row'];
      type GameLuckyDrawAttendantInsert = Instance['public']['Tables']['lucky_draw_attendants']['Insert'];
      type GameLuckyDrawAttendantUpdate = Instance['public']['Tables']['lucky_draw_attendants']['Update'];
      type GameLuckyDrawPrize = Instance['public']['Tables']['lucky_draw_prizes']['Row'];
      type GameLuckyDrawWinner = Instance['public']['Tables']['lucky_draw_winners']['Row'];
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
