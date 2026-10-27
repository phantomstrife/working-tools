import type * as Supabase from '@client-app/types/supabase';

declare global {
   declare namespace ClientApp {
      type Primitive = string | number | boolean | string[] | number[] | boolean[];
      type Object = Record<string, unknown>;

      type Component<T = { children: ReactNode }> = React.FC<T>;
      type ReactNode = React.ReactNode;
      type JSXElement = React.JSX.Element;
   }

   declare namespace ClientApp.Router {
      type Layout = () => ReactNode;
      type Page = () => ReactNode;
   }

   declare namespace ClientApp.Database {
      type Instance = Supabase.Database;

      type Account_Role = Instance['public']['Enums']['account_role'];
      type Check_In_Method = Instance['public']['Enums']['check_in_method_type'];
      type Game_Status = Instance['public']['Enums']['game_status'];

      type Account = Instance['public']['Tables']['accounts']['Row'];
      type Event = Instance['public']['Tables']['events']['Row'];
      type Game = Instance['public']['Tables']['games']['Row'];
      type GameLuckyDrawAttendant = Instance['public']['Tables']['lucky_draw_attendants']['Row'];
   }

   declare namespace ClientApp.Store.Session {
      type Status = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

      interface Account {
         id: string;
         email: string;
         full_name: string;
         role: Database.Account_Role;
         company_id: string | null;
      }
   }

   declare namespace ClientApp.Features.Game {
      interface AssignedGame {
         id: string;
         name: string;
         status: Database.Game_Status;
      }

      interface AssignedEvent {
         id: string;
         name: string;
         location_name: string | null;
         start_time: string;
         games: AssignedGame[];
      }
   }

   declare namespace ClientApp.Features.GameLuckyDraw.CheckIn {
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

   declare namespace ClientApp.Utilities.Trycatch {
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
