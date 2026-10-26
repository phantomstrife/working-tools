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
      type Company = Instance['public']['Tables']['companies']['Row'];
      type Event = Instance['public']['Tables']['events']['Row'];
      type EventWithGames = Event & { games: Game[] };
      type Game = Instance['public']['Tables']['games']['Row'];
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
