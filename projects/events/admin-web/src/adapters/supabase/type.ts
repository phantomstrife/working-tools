import type { SupabaseClient } from '@supabase/supabase-js';

export type Get_Browser_Client = () => SupabaseClient<Database>;
export type Get_Server_Client = () => Promise<SupabaseClient<Database>>;

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
   // Allows to automatically instantiate createClient with right options
   // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
   __InternalSupabase: {
      PostgrestVersion: '14.18';
   };
   public: {
      Tables: {
         accounts: {
            Row: {
               company_id: string | null;
               created_at: string | null;
               created_by: string | null;
               email: string;
               full_name: string;
               id: string;
               is_active: boolean | null;
               password_hash: string;
               phone: string | null;
               role: Database['public']['Enums']['account_role'];
               updated_at: string | null;
               username: string | null;
            };
            Insert: {
               company_id?: string | null;
               created_at?: string | null;
               created_by?: string | null;
               email: string;
               full_name: string;
               id?: string;
               is_active?: boolean | null;
               password_hash: string;
               phone?: string | null;
               role: Database['public']['Enums']['account_role'];
               updated_at?: string | null;
               username?: string | null;
            };
            Update: {
               company_id?: string | null;
               created_at?: string | null;
               created_by?: string | null;
               email?: string;
               full_name?: string;
               id?: string;
               is_active?: boolean | null;
               password_hash?: string;
               phone?: string | null;
               role?: Database['public']['Enums']['account_role'];
               updated_at?: string | null;
               username?: string | null;
            };
            Relationships: [
               {
                  foreignKeyName: 'accounts_company_id_fkey';
                  columns: ['company_id'];
                  isOneToOne: false;
                  referencedRelation: 'companies';
                  referencedColumns: ['id'];
               },
               {
                  foreignKeyName: 'accounts_created_by_fkey';
                  columns: ['created_by'];
                  isOneToOne: false;
                  referencedRelation: 'accounts';
                  referencedColumns: ['id'];
               },
            ];
         };
         companies: {
            Row: {
               address: string | null;
               contact_email: string | null;
               contact_person: string | null;
               contact_phone: string | null;
               created_at: string | null;
               id: string;
               industry: string | null;
               logo_url: string | null;
               name: string;
               status: Database['public']['Enums']['company_status'] | null;
               tax_code: string | null;
               updated_at: string | null;
            };
            Insert: {
               address?: string | null;
               contact_email?: string | null;
               contact_person?: string | null;
               contact_phone?: string | null;
               created_at?: string | null;
               id?: string;
               industry?: string | null;
               logo_url?: string | null;
               name: string;
               status?: Database['public']['Enums']['company_status'] | null;
               tax_code?: string | null;
               updated_at?: string | null;
            };
            Update: {
               address?: string | null;
               contact_email?: string | null;
               contact_person?: string | null;
               contact_phone?: string | null;
               created_at?: string | null;
               id?: string;
               industry?: string | null;
               logo_url?: string | null;
               name?: string;
               status?: Database['public']['Enums']['company_status'] | null;
               tax_code?: string | null;
               updated_at?: string | null;
            };
            Relationships: [];
         };
         events: {
            Row: {
               banner_url: string | null;
               company_id: string;
               created_at: string | null;
               description: string | null;
               end_time: string | null;
               id: string;
               location_address: string | null;
               location_name: string | null;
               name: string;
               slug: string;
               start_time: string | null;
               status: Database['public']['Enums']['event_status'] | null;
               theme_config: Json | null;
               updated_at: string | null;
            };
            Insert: {
               banner_url?: string | null;
               company_id: string;
               created_at?: string | null;
               description?: string | null;
               end_time?: string | null;
               id?: string;
               location_address?: string | null;
               location_name?: string | null;
               name: string;
               slug: string;
               start_time?: string | null;
               status?: Database['public']['Enums']['event_status'] | null;
               theme_config?: Json | null;
               updated_at?: string | null;
            };
            Update: {
               banner_url?: string | null;
               company_id?: string;
               created_at?: string | null;
               description?: string | null;
               end_time?: string | null;
               id?: string;
               location_address?: string | null;
               location_name?: string | null;
               name?: string;
               slug?: string;
               start_time?: string | null;
               status?: Database['public']['Enums']['event_status'] | null;
               theme_config?: Json | null;
               updated_at?: string | null;
            };
            Relationships: [
               {
                  foreignKeyName: 'events_company_id_fkey';
                  columns: ['company_id'];
                  isOneToOne: false;
                  referencedRelation: 'companies';
                  referencedColumns: ['id'];
               },
            ];
         };
         game_accounts: {
            Row: {
               account_id: string;
               assigned_at: string | null;
               event_id: string;
               game_id: string;
               id: string;
            };
            Insert: {
               account_id: string;
               assigned_at?: string | null;
               event_id: string;
               game_id: string;
               id?: string;
            };
            Update: {
               account_id?: string;
               assigned_at?: string | null;
               event_id?: string;
               game_id?: string;
               id?: string;
            };
            Relationships: [
               {
                  foreignKeyName: 'game_accounts_account_id_fkey';
                  columns: ['account_id'];
                  isOneToOne: false;
                  referencedRelation: 'accounts';
                  referencedColumns: ['id'];
               },
               {
                  foreignKeyName: 'game_accounts_event_id_fkey';
                  columns: ['event_id'];
                  isOneToOne: false;
                  referencedRelation: 'events';
                  referencedColumns: ['id'];
               },
               {
                  foreignKeyName: 'game_accounts_game_id_fkey';
                  columns: ['game_id'];
                  isOneToOne: false;
                  referencedRelation: 'games';
                  referencedColumns: ['id'];
               },
            ];
         };
         games: {
            Row: {
               config: Json | null;
               created_at: string | null;
               description: string | null;
               event_id: string;
               game_type: Database['public']['Enums']['game_type'];
               id: string;
               is_dev_only: boolean | null;
               name: string;
               status: Database['public']['Enums']['game_status'] | null;
               updated_at: string | null;
            };
            Insert: {
               config?: Json | null;
               created_at?: string | null;
               description?: string | null;
               event_id: string;
               game_type: Database['public']['Enums']['game_type'];
               id?: string;
               is_dev_only?: boolean | null;
               name: string;
               status?: Database['public']['Enums']['game_status'] | null;
               updated_at?: string | null;
            };
            Update: {
               config?: Json | null;
               created_at?: string | null;
               description?: string | null;
               event_id?: string;
               game_type?: Database['public']['Enums']['game_type'];
               id?: string;
               is_dev_only?: boolean | null;
               name?: string;
               status?: Database['public']['Enums']['game_status'] | null;
               updated_at?: string | null;
            };
            Relationships: [
               {
                  foreignKeyName: 'games_event_id_fkey';
                  columns: ['event_id'];
                  isOneToOne: false;
                  referencedRelation: 'events';
                  referencedColumns: ['id'];
               },
            ];
         };
         logs: {
            Row: {
               account_id: string;
               action_type: Database['public']['Enums']['log_action_type'];
               created_at: string | null;
               event_id: string | null;
               game_id: string | null;
               id: string;
               metadata: Json | null;
               target_entity: string;
               target_id: string | null;
            };
            Insert: {
               account_id: string;
               action_type: Database['public']['Enums']['log_action_type'];
               created_at?: string | null;
               event_id?: string | null;
               game_id?: string | null;
               id?: string;
               metadata?: Json | null;
               target_entity: string;
               target_id?: string | null;
            };
            Update: {
               account_id?: string;
               action_type?: Database['public']['Enums']['log_action_type'];
               created_at?: string | null;
               event_id?: string | null;
               game_id?: string | null;
               id?: string;
               metadata?: Json | null;
               target_entity?: string;
               target_id?: string | null;
            };
            Relationships: [
               {
                  foreignKeyName: 'logs_account_id_fkey';
                  columns: ['account_id'];
                  isOneToOne: false;
                  referencedRelation: 'accounts';
                  referencedColumns: ['id'];
               },
               {
                  foreignKeyName: 'logs_event_id_fkey';
                  columns: ['event_id'];
                  isOneToOne: false;
                  referencedRelation: 'events';
                  referencedColumns: ['id'];
               },
               {
                  foreignKeyName: 'logs_game_id_fkey';
                  columns: ['game_id'];
                  isOneToOne: false;
                  referencedRelation: 'games';
                  referencedColumns: ['id'];
               },
            ];
         };
         lucky_draw_attendants: {
            Row: {
               check_in_method: Database['public']['Enums']['check_in_method_type'] | null;
               checked_in_at: string | null;
               checked_in_by: string | null;
               company_name: string | null;
               created_at: string | null;
               custom_metadata: Json | null;
               department: string | null;
               email: string | null;
               email_sent_at: string | null;
               email_status: Database['public']['Enums']['email_status_type'] | null;
               full_name: string;
               game_id: string;
               has_won: boolean | null;
               id: string;
               is_checked_in: boolean | null;
               phone: string | null;
               qr_code_payload: string;
               ticket_code: string;
               updated_at: string | null;
            };
            Insert: {
               check_in_method?: Database['public']['Enums']['check_in_method_type'] | null;
               checked_in_at?: string | null;
               checked_in_by?: string | null;
               company_name?: string | null;
               created_at?: string | null;
               custom_metadata?: Json | null;
               department?: string | null;
               email?: string | null;
               email_sent_at?: string | null;
               email_status?: Database['public']['Enums']['email_status_type'] | null;
               full_name: string;
               game_id: string;
               has_won?: boolean | null;
               id?: string;
               is_checked_in?: boolean | null;
               phone?: string | null;
               qr_code_payload: string;
               ticket_code: string;
               updated_at?: string | null;
            };
            Update: {
               check_in_method?: Database['public']['Enums']['check_in_method_type'] | null;
               checked_in_at?: string | null;
               checked_in_by?: string | null;
               company_name?: string | null;
               created_at?: string | null;
               custom_metadata?: Json | null;
               department?: string | null;
               email?: string | null;
               email_sent_at?: string | null;
               email_status?: Database['public']['Enums']['email_status_type'] | null;
               full_name?: string;
               game_id?: string;
               has_won?: boolean | null;
               id?: string;
               is_checked_in?: boolean | null;
               phone?: string | null;
               qr_code_payload?: string;
               ticket_code?: string;
               updated_at?: string | null;
            };
            Relationships: [
               {
                  foreignKeyName: 'lucky_draw_attendants_checked_in_by_fkey';
                  columns: ['checked_in_by'];
                  isOneToOne: false;
                  referencedRelation: 'accounts';
                  referencedColumns: ['id'];
               },
               {
                  foreignKeyName: 'lucky_draw_attendants_game_id_fkey';
                  columns: ['game_id'];
                  isOneToOne: false;
                  referencedRelation: 'games';
                  referencedColumns: ['id'];
               },
            ];
         };
         lucky_draw_prizes: {
            Row: {
               created_at: string | null;
               description: string | null;
               game_id: string;
               id: string;
               image_url: string | null;
               name: string;
               remaining_quantity: number;
               tier_order: number;
               total_quantity: number;
               updated_at: string | null;
            };
            Insert: {
               created_at?: string | null;
               description?: string | null;
               game_id: string;
               id?: string;
               image_url?: string | null;
               name: string;
               remaining_quantity: number;
               tier_order: number;
               total_quantity: number;
               updated_at?: string | null;
            };
            Update: {
               created_at?: string | null;
               description?: string | null;
               game_id?: string;
               id?: string;
               image_url?: string | null;
               name?: string;
               remaining_quantity?: number;
               tier_order?: number;
               total_quantity?: number;
               updated_at?: string | null;
            };
            Relationships: [
               {
                  foreignKeyName: 'lucky_draw_prizes_game_id_fkey';
                  columns: ['game_id'];
                  isOneToOne: false;
                  referencedRelation: 'games';
                  referencedColumns: ['id'];
               },
            ];
         };
         lucky_draw_winners: {
            Row: {
               attendant_id: string;
               drawn_by: string | null;
               game_id: string;
               id: string;
               prize_id: string;
               won_at: string | null;
            };
            Insert: {
               attendant_id: string;
               drawn_by?: string | null;
               game_id: string;
               id?: string;
               prize_id: string;
               won_at?: string | null;
            };
            Update: {
               attendant_id?: string;
               drawn_by?: string | null;
               game_id?: string;
               id?: string;
               prize_id?: string;
               won_at?: string | null;
            };
            Relationships: [
               {
                  foreignKeyName: 'lucky_draw_winners_attendant_id_fkey';
                  columns: ['attendant_id'];
                  isOneToOne: false;
                  referencedRelation: 'lucky_draw_attendants';
                  referencedColumns: ['id'];
               },
               {
                  foreignKeyName: 'lucky_draw_winners_drawn_by_fkey';
                  columns: ['drawn_by'];
                  isOneToOne: false;
                  referencedRelation: 'accounts';
                  referencedColumns: ['id'];
               },
               {
                  foreignKeyName: 'lucky_draw_winners_game_id_fkey';
                  columns: ['game_id'];
                  isOneToOne: false;
                  referencedRelation: 'games';
                  referencedColumns: ['id'];
               },
               {
                  foreignKeyName: 'lucky_draw_winners_prize_id_fkey';
                  columns: ['prize_id'];
                  isOneToOne: false;
                  referencedRelation: 'lucky_draw_prizes';
                  referencedColumns: ['id'];
               },
            ];
         };
      };
      Views: {
         [_ in never]: never;
      };
      Functions: {
         get_my_role: { Args: never; Returns: string };
      };
      Enums: {
         account_role: 'SUPER_ADMIN' | 'ADMIN' | 'FIELD_STAFF' | 'GUARD';
         check_in_method_type: 'QR_SCAN' | 'MANUAL_SEARCH';
         company_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
         email_status_type: 'NOT_SENT' | 'SENDING' | 'SENT' | 'FAILED';
         event_status: 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
         game_status: 'PENDING' | 'READY' | 'LIVE' | 'FINISHED';
         game_type: 'LUCKY_DRAW';
         log_action_type:
            | 'AUTH_LOGIN'
            | 'ACCOUNT_CREATE'
            | 'EMAIL_BATCH_SEND'
            | 'CHECKIN_QR_SCAN'
            | 'CHECKIN_MANUAL_SEARCH'
            | 'PRIZE_DRAWN'
            | 'REPORT_EXPORT';
      };
      CompositeTypes: {
         [_ in never]: never;
      };
   };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
   DefaultSchemaTableNameOrOptions extends
      | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
      | { schema: keyof DatabaseWithoutInternals },
   TableName extends DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
   }
      ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
           DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals;
}
   ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
        Row: infer R;
     }
      ? R
      : never
   : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
     ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
          Row: infer R;
       }
        ? R
        : never
     : never;

export type TablesInsert<
   DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
   TableName extends DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
   }
      ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals;
}
   ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
        Insert: infer I;
     }
      ? I
      : never
   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
     ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
          Insert: infer I;
       }
        ? I
        : never
     : never;

export type TablesUpdate<
   DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
   TableName extends DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
   }
      ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals;
}
   ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
        Update: infer U;
     }
      ? U
      : never
   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
     ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
          Update: infer U;
       }
        ? U
        : never
     : never;

export type Enums<
   DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
   EnumName extends DefaultSchemaEnumNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
   }
      ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
      : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals;
}
   ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
   : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
     ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
     : never;

export type CompositeTypes<
   PublicCompositeTypeNameOrOptions extends
      | keyof DefaultSchema['CompositeTypes']
      | { schema: keyof DatabaseWithoutInternals },
   CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
   }
      ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
      : never = never,
> = PublicCompositeTypeNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals;
}
   ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
   : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
     ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
     : never;

export const Constants = {
   public: {
      Enums: {
         account_role: ['SUPER_ADMIN', 'ADMIN', 'FIELD_STAFF', 'GUARD'],
         check_in_method_type: ['QR_SCAN', 'MANUAL_SEARCH'],
         company_status: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
         email_status_type: ['NOT_SENT', 'SENDING', 'SENT', 'FAILED'],
         event_status: ['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
         game_status: ['PENDING', 'READY', 'LIVE', 'FINISHED'],
         game_type: ['LUCKY_DRAW'],
         log_action_type: [
            'AUTH_LOGIN',
            'ACCOUNT_CREATE',
            'EMAIL_BATCH_SEND',
            'CHECKIN_QR_SCAN',
            'CHECKIN_MANUAL_SEARCH',
            'PRIZE_DRAWN',
            'REPORT_EXPORT',
         ],
      },
   },
} as const;
