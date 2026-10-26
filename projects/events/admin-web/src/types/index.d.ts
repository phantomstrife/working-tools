import type * as NextJs from 'next/server';
import type * as Supabase from '@admin-web/types/supabase';

declare global {
   declare namespace ValueType {
      type Primitive = string | number | boolean | string[] | number[] | boolean[];
      type Object = Record<string, unknown>;
   }

   type Component<T = object> = React.FC<T>;

   type Metadata = NextJs.Metadata;
   type Database = Supabase.Database;

   type Proxy_Request = NextJs.NextRequest;
   type Proxy_Response = NextJs.NextResponse;

   declare namespace Router {
      type Layout = (properties: { children: ReactNode }) => Promise<ReactNode> | ReactNode;
      type Page<T = object> = (properties: { params: Promise<T> }) => JSXElement;
   }

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

   declare namespace Database {
      type Role = Database['public']['Enums']['account_role'];
      type Company = Database['public']['Tables']['companies']['Row'];
   }
}

export {};
