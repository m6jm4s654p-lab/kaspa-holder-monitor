import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { fetchHolderSnapshot, cumulative } from '@/lib/holders';
import { fetchKasPrice } from '@/lib/price';
import { supabaseEnabled, supabaseRequest } from '@/lib/supabase';
import { NO_STORE } from '@/lib/api-security';

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

function validCronAuthorization(request,secret){
  const provided=Buffer.from(request.headers.get('authorization')||'');
  const expected=Buffer.from(`Bearer ${secret}`);
  return provided.length===expected.length&&timingSafeEqual(provided,expected);
}

export async function GET(request){
  const cronSecret=process.env.CRON_SECRET;
  if(!cronSecret){
    console.error('Snapshot cron refused: CRON_SECRET is not configured');
    return NextResponse.json({error:'snapshot_unavailable'},{status:503,headers:NO_STORE});
  }
  if(!validCronAuthorization(request,cronSecret)){
    return NextResponse.json({error:'unauthorized'},{status:401,headers:NO_STORE});
  }
  if(!supabaseEnabled()){
    console.error('Snapshot cron refused: database credentials are not configured');
    return NextResponse.json({error:'snapshot_unavailable'},{status:503,headers:NO_STORE});
  }

  try{
    const {start,end}=currentJstDayRange();
    const existing=await supabaseRequest(`holder_snapshots?select=id,captured_at&captured_at=gte.${encodeURIComponent(start)}&captured_at=lt.${encodeURIComponent(end)}&order=captured_at.desc&limit=1`);
    if(existing?.length){
      const retentionCutoff=await removeExpiredSnapshots();
      return NextResponse.json({ok:true,inserted:false,reason:'snapshot already exists for the current JST day',retentionDays:RETENTION_DAYS,retentionCutoff,row:existing[0]},{headers:NO_STORE});
    }

    const [h,p]=await Promise.all([fetchHolderSnapshot(),fetchKasPrice()]);
    if(h.fallback){
      console.error('Snapshot cron refused fallback holder data',h.error||'unknown holder error');
      return NextResponse.json({ok:false,error:'live_data_unavailable'},{status:503,headers:NO_STORE});
    }

    const c=cumulative(h);
    const row={captured_at:new Date().toISOString(),kas_price_usd:p.usd,total_1_plus:h.total1Plus,a_1k_plus:c['1K+'],a_10k_plus:c['10K+'],a_100k_plus:c['100K+'],a_1m_plus:c['1M+'],a_10m_plus:c['10M+'],a_100m_plus:c['100M+'],top10_share:h.concentration.top10,top100_share:h.concentration.top100,top1000_share:h.concentration.top1000,circulating:h.circulating};
    try{
      await supabaseRequest('holder_snapshots',{method:'POST',body:JSON.stringify(row),prefer:'return=minimal'});
    }catch(error){
      // The unique JST-day index is the final guard if two cron requests overlap.
      if(error.status===409){
        const duplicate=await supabaseRequest(`holder_snapshots?select=id,captured_at&captured_at=gte.${encodeURIComponent(start)}&captured_at=lt.${encodeURIComponent(end)}&order=captured_at.desc&limit=1`);
        const retentionCutoff=await removeExpiredSnapshots();
        return NextResponse.json({ok:true,inserted:false,reason:'snapshot already exists for the current JST day',retentionDays:RETENTION_DAYS,retentionCutoff,row:duplicate?.[0]||null},{headers:NO_STORE});
      }
      throw error;
    }
    const retentionCutoff=await removeExpiredSnapshots();
    return NextResponse.json({ok:true,inserted:true,retentionDays:RETENTION_DAYS,retentionCutoff,row},{headers:NO_STORE});
  }catch(error){
    console.error('Snapshot cron failed',error);
    return NextResponse.json({ok:false,error:'snapshot_failed'},{status:503,headers:NO_STORE});
  }
}
