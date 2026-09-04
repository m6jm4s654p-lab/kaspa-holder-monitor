import { NextResponse } from 'next/server';
import { fetchHolderSnapshot, cumulative } from '@/lib/holders';
import { fetchKasPrice } from '@/lib/price';
import { supabaseEnabled, supabaseRequest } from '@/lib/supabase';
export const dynamic='force-dynamic';
export async function GET(request){
  if(process.env.CRON_SECRET){const auth=request.headers.get('authorization'); if(auth!==`Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:'unauthorized'},{status:401});}
  if(!supabaseEnabled()) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const [h,p]=await Promise.all([fetchHolderSnapshot(),fetchKasPrice()]); const c=cumulative(h);
  const row={captured_at:new Date().toISOString(),kas_price_usd:p.usd,total_1_plus:h.total1Plus,a_1k_plus:c['1K+'],a_10k_plus:c['10K+'],a_100k_plus:c['100K+'],a_1m_plus:c['1M+'],a_10m_plus:c['10M+'],a_100m_plus:c['100M+'],top10_share:h.concentration.top10,top100_share:h.concentration.top100,top1000_share:h.concentration.top1000,circulating:h.circulating};
  await supabaseRequest('holder_snapshots',{method:'POST',body:JSON.stringify(row),prefer:'return=minimal'});
  return NextResponse.json({ok:true,row});
}
