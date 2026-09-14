import { NextResponse } from 'next/server';
import { enforceRateLimit, NO_STORE } from '@/lib/api-security';

export const dynamic='force-dynamic';

const KASPA_API='https://kas.nownodes.io';
const SOMPI=100_000_000;
const SITE_ORIGIN='https://kaspa-live-blockdag.teacbit.chatgpt.site';
const CACHE_HEADERS={
  'Cache-Control':'public, s-maxage=120, stale-while-revalidate=240',
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

async function fetchJson(path,apiKey){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{
    const response=await fetch(`${KASPA_API}${path}`,{
      headers:{accept:'application/json','api-key':apiKey,'user-agent':'KASPA-Holder-Monitor/2.2.22'},
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
  const header=raw?.header||{};
  const verbose=raw?.verboseData||{};
  const hash=verbose?.hash||raw?.hash||'';
  const daaScore=Number(header?.daaScore||verbose?.daaScore||raw?.daaScore||0);
  const rawTimestamp=header?.timestamp||raw?.timestamp||Date.now();
  const numericTimestamp=Number(rawTimestamp);
  const timestamp=Number.isFinite(numericTimestamp)
    ?(numericTimestamp<10_000_000_000?numericTimestamp*1000:numericTimestamp)
    :Date.parse(rawTimestamp);
  const parents=(header?.parents||raw?.parents||[]).flatMap(parent=>parent?.parentHashes||parent||[]);
  const txs=(raw?.transactions||[]).filter(tx=>(tx?.inputs?.length||0)>0);
  const transactions=txs.map(tx=>{
    const values=(tx?.outputs||[]).map(output=>Number(output?.amount??output?.value??0)/SOMPI);
    const valueKas=Math.max(0,...values);
    return {
      id:tx?.verboseData?.transactionId||tx?.transactionId||'',
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
    color:(raw?.isChainBlock??verbose?.isChainBlock)?'blue':'red'
  };
}

function extractAnchorHash(payload){
  const candidate=Array.isArray(payload)
    ?payload[0]
    :payload?.blocks?.[0]
      ??payload?.blockHashes?.[0]
      ??payload?.block_hashes?.[0]
      ??payload?.hashes?.[0];
  if(typeof candidate==='string')return candidate;
  return candidate?.verboseData?.hash||candidate?.hash||candidate?.blockHash||'';
}

export function OPTIONS(request){
  if(!corsAllowed(request))return new NextResponse(null,{status:403,headers:NO_STORE});
  return new NextResponse(null,{status:204,headers:CACHE_HEADERS});
}

export async function GET(request){
  if(!corsAllowed(request)){
    return NextResponse.json({ok:false,error:'origin_not_allowed'},{status:403,headers:NO_STORE});
  }
  const limited=enforceRateLimit(request,'blockdag',30);
  if(limited)return limited;

  try{
    const apiKey=process.env.NOWNODES_API_KEY;
    if(!apiKey)throw new Error('api_key_missing');

    const state=await fetchJson('/info/blockdag',apiKey);
    const tipHash=state?.virtualParentHashes?.[0];
    if(!tipHash)throw new Error('tip_hash_unavailable');

    const tipBlock=await fetchJson(`/blocks/${encodeURIComponent(tipHash)}?includeTransactions=false`,apiKey);
    const tipBlueScore=Number(tipBlock?.header?.blueScore||tipBlock?.verboseData?.blueScore||0);
    if(!tipBlueScore)throw new Error('blue_score_unavailable');

    const anchorBlueScore=Math.max(0,tipBlueScore-72);
    const anchors=await fetchJson(`/blocks-from-bluescore?blueScore=${anchorBlueScore}&includeTransactions=false`,apiKey);
    const anchorHash=extractAnchorHash(anchors);
    if(!anchorHash)throw new Error('anchor_hash_unavailable');

    const recent=await fetchJson(`/blocks?lowHash=${encodeURIComponent(anchorHash)}&includeBlocks=true&includeTransactions=true`,apiKey);
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
