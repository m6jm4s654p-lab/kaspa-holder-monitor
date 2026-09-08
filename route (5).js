import { NextResponse } from 'next/server';
import { fetchHolderSnapshot, cumulative } from '@/lib/holders';
import { fetchKasPrice } from '@/lib/price';
import { supabaseEnabled, supabaseRequest } from '@/lib/supabase';

export const dynamic='force-dynamic';

const RETENTION_DAYS=120;
const DAY_MS=24*60*60*1000;
const JST_OFFSET_MS=9*60*60*1000;

function currentJstDayRange(){
  const jst=new Date(Date.now()+JST_OFFSET_MS);
  const startMs=Date.UTC(jst.getUTCFullYear(),jst.getUTCMonth(),jst.getUTCDate())-JST_OFFSET_MS;
  return {start:new Date(startMs).toISOString(),end:new Date(startMs+DAY_MS).toISOString()};
}

async function removeExpiredSnapshots(){
  const cutoff=new Date(Date.now()-RETENTION_DAYS*DAY_MS).toISOString();
  await supabaseRequest(`holder_snapshots?captured_at=lt.${encodeURIComponent(cutoff)}`,{method:'DELETE',prefer:'return=minimal'});
  return cutoff;
}

export async function GET(request){
  if(process.env.CRON_SECRET){
    const auth=request.headers.get('authorization');
    if(auth!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:'unauthorized'},{status:401});
  }
  if(!supabaseEnabled())return NextResponse.json({error:'Supabase is not configured'},{status:503});

  const {start,end}=currentJstDayRange();
  const existing=await supabaseRequest(`holder_snapshots?select=id,captured_at&captured_at=gte.${encodeURIComponent(start)}&captured_at=lt.${encodeURIComponent(end)}&order=captured_at.desc&limit=1`);
  if(existing?.length){
    const retentionCutoff=await removeExpiredSnapshots();
    return NextResponse.json({ok:true,inserted:false,reason:'snapshot already exists for the current JST day',retentionDays:RETENTION_DAYS,retentionCutoff,row:existing[0]});
  }

  const [h,p]=await Promise.all([fetchHolderSnapshot(),fetchKasPrice()]);
  if(h.fallback)return NextResponse.json({ok:false,error:'Live holder data unavailable; fallback data was not saved',detail:h.error||null},{status:503});

  const c=cumulative(h);
  const row={captured_at:new Date().toISOString(),kas_price_usd:p.usd,total_1_plus:h.total1Plus,a_1k_plus:c['1K+'],a_10k_plus:c['10K+'],a_100k_plus:c['100K+'],a_1m_plus:c['1M+'],a_10m_plus:c['10M+'],a_100m_plus:c['100M+'],top10_share:h.concentration.top10,top100_share:h.concentration.top100,top1000_share:h.concentration.top1000,circulating:h.circulating};
  await supabaseRequest('holder_snapshots',{method:'POST',body:JSON.stringify(row),prefer:'return=minimal'});
  const retentionCutoff=await removeExpiredSnapshots();
  return NextResponse.json({ok:true,inserted:true,retentionDays:RETENTION_DAYS,retentionCutoff,row});
}
