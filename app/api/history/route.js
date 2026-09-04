import { NextResponse } from 'next/server';
import { supabaseEnabled, supabaseRequest } from '@/lib/supabase';
export const dynamic='force-dynamic';
export async function GET(request){
  if(!supabaseEnabled()) return NextResponse.json({enabled:false,rows:[]});
  const {searchParams}=new URL(request.url); const days=Math.min(400,Math.max(1,Number(searchParams.get('days')||90)));
  const since=new Date(Date.now()-days*86400000).toISOString();
  const rows=await supabaseRequest(`holder_snapshots?select=*&captured_at=gte.${encodeURIComponent(since)}&order=captured_at.asc`);
  return NextResponse.json({enabled:true,rows});
}
