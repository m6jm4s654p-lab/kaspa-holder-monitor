import { NextResponse } from 'next/server';
import { enforceRateLimit, NO_STORE } from '@/lib/api-security';

export const dynamic='force-dynamic';

const KASPA_API='https://api.kaspa.org';
const SOMPI=100_000_000;
const SITE_ORIGIN='https://kaspa-live-blockdag.teacbit.chatgpt.site';
const CACHE_HEADERS={
  'Cache-Control':'public, s-maxage=3, stale-while-revalidate=9',
  'Access-Control-Allow-Origin':SITE_ORIGIN,
  'Access-Control-Allow-Methods':'GET, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type',
  'Access-Control-Max-Age':'86400',
  'Cross-Origin-Resource-Policy':'cross-origin',
  'Vary':'Origin'
};
const ERROR_HEADERS={...NO_STORE,...CACHE_HEADERS,'Cache-Control':'no-store'};

function corsAllowed(request){
  const origin=request.headers.get('origin');
  return !origin||origin===SITE_ORIGIN;
}

async function fetchJson(path){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(`${KASPA_API}${path}`,{
      headers:{accept:'application/json','user-agent':'KASPA-Holder-Monitor/2.2.19'},
      cache:'no-store',
      signal:controller.signal
    });
    if(!response.ok)throw new Error(`upstream_${response.status}`);
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('application/json'))throw new Error('upstream_not_json');
    return response.json();
  }finally{
    clearTimeout(timeout);
  }
}

function normalizeBlock(raw){
  const hash=raw?.verboseData?.hash||raw?.hash||'';
  const daaScore=Number(raw?.header?.daaScore||raw?.daa_score||0);
  const rawTimestamp=Number(raw?.header?.timestamp||raw?.timestamp||Date.now());
  const timestamp=rawTimestamp<10_000_000_000?rawTimestamp*1000:rawTimestamp;
  const parents=raw?.header?.parents?.flatMap(parent=>parent?.parentHashes||[])||raw?.parent_hashes||[];
  const txs=(raw?.transactions||[]).filter(tx=>(tx?.inputs?.length||0)>0);
  const transactions=txs.map(tx=>{
    const values=(tx?.outputs||[]).map(output=>Number(output?.amount??output?.value??0)/SOMPI);
    const valueKas=Math.max(0,...values);
    return {
      id:tx?.verboseData?.transactionId||tx?.transactionId||tx?.transaction_id||'',
      valueKas,
      whale:valueKas>=1_000_000?'mega':valueKas>=100_000?'large':'normal'
    };
  }).filter(tx=>tx.id);
  const volumeKas=txs.reduce((total,tx)=>total+(tx?.outputs||[]).reduce(
    (sum,output)=>sum+Number(output?.amount??output?.value??0)/SOMPI,0
  ),0);
  return {
    hash,
    daaScore,
    timestamp,
    parents,
    txCount:txs.length,
    volumeKas,
    maxTransferKas:Math.max(0,...transactions.map(tx=>tx.valueKas)),
    transactions,
    color:raw?.extra?.color||(raw?.verboseData?.isChainBlock?'blue':'red')
  };
}

export function OPTIONS(request){
  if(!corsAllowed(request))return new NextResponse(null,{status:403,headers:NO_STORE});
  return new NextResponse(null,{status:204,headers:CACHE_HEADERS});
}

export async function GET(request){
  if(!corsAllowed(request)){
    return NextResponse.json({ok:false,error:'origin_not_allowed'},{status:403,headers:NO_STORE});
  }
  const limited=enforceRateLimit(request,'blockdag',90);
  if(limited)return limited;

  try{
    const state=await fetchJson('/info/blockdag');
    const tipHash=state?.virtualParentHashes?.[0]||state?.tipHashes?.[0];
    if(!tipHash)throw new Error('tip_unavailable');

    const tipBlock=await fetchJson(`/blocks/${encodeURIComponent(tipHash)}?includeTransactions=false`);
    const tipBlueScore=Number(tipBlock?.header?.blueScore||tipBlock?.verboseData?.blueScore||0);
    if(!tipBlueScore)throw new Error('blue_score_unavailable');

    const anchorScore=Math.max(0,tipBlueScore-72);
    const anchors=await fetchJson(`/blocks-from-bluescore?blueScore=${anchorScore}&includeTransactions=false`);
    const anchorHash=anchors?.[0]?.verboseData?.hash;
    if(!anchorHash)throw new Error('anchor_unavailable');

    const recent=await fetchJson(`/blocks?lowHash=${encodeURIComponent(anchorHash)}&includeBlocks=true&includeTransactions=true`);
    const rawBlocks=Array.isArray(recent)?recent:recent?.blocks||[];
    const blocks=rawBlocks.map(normalizeBlock)
      .filter(block=>block.hash&&block.daaScore>0)
      .sort((a,b)=>a.daaScore-b.daaScore||a.timestamp-b.timestamp)
      .slice(-48);
    if(!blocks.length)throw new Error('blocks_unavailable');

    return NextResponse.json({
      ok:true,
      source:'live',
      fetchedAt:new Date().toISOString(),
      network:state?.networkName||'kaspa-mainnet',
      virtualDaaScore:Number(state?.virtualDaaScore||0),
      blocks
    },{headers:CACHE_HEADERS});
  }catch(error){
    console.error('BlockDAG relay failed',error?.message||String(error));
    return NextResponse.json({ok:false,source:'unavailable',blocks:[],error:'blockdag_unavailable'},{status:503,headers:ERROR_HEADERS});
  }
}
