import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
   try {
      const { id } = await props.params;
      const body = await request.json();
      const supabase = await createClient();

      const { error } = await supabase
         .from('companies')
         .update({
            ...body,
            updated_at: new Date().toISOString(),
         })
         .eq('id', id);

      if (error) throw error;

      return NextResponse.json({ success: true });
   } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
   }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
   try {
      const { id } = await props.params;
      const supabase = await createClient();

      const { error } = await supabase.from('companies').delete().eq('id', id);

      if (error) throw error;

      return NextResponse.json({ success: true });
   } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
   }
}
