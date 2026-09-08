import { NextResponse } from 'next/server';
import { supabaseEnabled, supabaseRequest } from '@/lib/supabase';

export const dynamic='force-dynamic';

const MAX_HISTORY_DAYS=120;
const FIELDS='captured_at,kas_price_usd,total_1_plus,a_1k_plus,a_10k_plus,a_100k_plus,a_1m_plus,a_10m_plus,a_100m_plus,top10_share,top100_share,top1000_share,circulating';

export async function GET(request){
  if(!supabaseEnabled()){
    return NextResponse.json({enabled:false,rows:[],error:'Supabase is not configured'},{headers:{'Cache-Control':'no-store'}});
  }

  const {searchParams}=new URL(request.url);
  const requested=Number(searchParams.get('days')||MAX_HISTORY_DAYS);
  const days=Math.min(MAX_HISTORY_DAYS,Math.max(1,Number.isFinite(requested)?Math.floor(requested):MAX_HISTORY_DAYS));
  const cutoff=new Date(Date.now()-days*24*60*60*1000).toISOString();

  try{
    const newestFirst=await supabaseRequest(`holder_snapshots?select=${FIELDS}&captured_at=gte.${encodeURIComponent(cutoff)}&order=captured_at.desc&limit=${MAX_HISTORY_DAYS}`);
    const rows=(newestFirst||[]).reverse();
    return NextResponse.json({enabled:true,days,retentionDays:MAX_HISTORY_DAYS,rows},{headers:{'Cache-Control':'no-store'}});
  }catch(error){
    return NextResponse.json({enabled:true,days,retentionDays:MAX_HISTORY_DAYS,rows:[],error:error.message},{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
