import type * as NextJs from 'next/server';
import type * as Supabase from '@admin-web/types/supabase';

declare global {
   type Component<T = object> = React.FC<T>;

   type Metadata = NextJs.Metadata;
   type Database = Supabase.Database;

   declare namespace Router {
      interface PropertiesLayout {
         children: ReactNode;
      }

      interface PropertiesPage<T> {
         params: Promise<T>;
      }

      type Layout = (properties: PropertiesLayout) => Promise<ReactNode> | ReactNode;
      type Page<T = object> = (properties: PropertiesPage<T>) => JSXElement;
   }

   type Proxy_Request = NextJs.NextRequest;
   type Proxy_Response = NextJs.NextResponse;

   declare namespace HttpRequest {
      type Success<T> = {
         data: T;
         error: false;
      };

      type Failed = {
         data: null;
         error: true;
         message: string;
      };

      type Result<T> = Promise<Success<T> | Failed>;
   }

   type Role = Database['public']['Enums']['account_role'];
   type Company = Database['public']['Tables']['companies']['Row'];
}

export {};
