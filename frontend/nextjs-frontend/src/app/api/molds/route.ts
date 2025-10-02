// app/api/molds/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import type { Database } from '../../../../types/database.types';

export const dynamic = 'force-dynamic'; // avoid caching in dev

type Mold = Database['public']['Views']['mold_names']['Row']; 

export async function GET() {
  const { data, error } = await supabase
    .from('mold_names') 
    .select('id, name')
    .order('id', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []) as Pick<Mold, 'id'|'name'>[]);
}
