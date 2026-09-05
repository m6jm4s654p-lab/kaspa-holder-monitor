import { NextResponse } from 'next/server';
import { supabaseEnabled } from '@/lib/supabase';

export const dynamic='force-dynamic';
export async function GET(){
  return NextResponse.json({
    ok:true,
    app:'KASPA Holder Monitor',
    version:'2.1.0',
    databaseConfigured:supabaseEnabled(),
    now:new Date().toISOString()
  },{headers:{'Cache-Control':'no-store'}});
}
