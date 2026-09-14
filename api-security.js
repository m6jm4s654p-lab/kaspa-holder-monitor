import { NextResponse } from 'next/server';

const WINDOW_MS=60*1000;
const MAX_BUCKETS=10000;
const buckets=globalThis.__khmRateLimitBuckets||(globalThis.__khmRateLimitBuckets=new Map());

function clientId(request){
  const forwarded=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const real=request.headers.get('x-real-ip')?.trim();
  return (forwarded||real||'unknown').slice(0,128);
}

function prune(now){
  for(const [key,bucket] of buckets){
    if(bucket.resetAt<=now)buckets.delete(key);
  }
  if(buckets.size>MAX_BUCKETS){
    const overflow=buckets.size-MAX_BUCKETS;
    let removed=0;
    for(const key of buckets.keys()){
      buckets.delete(key);
      if(++removed>=overflow)break;
    }
  }
}

// Best-effort burst protection for each running server instance.
// Platform-level rate limiting should remain enabled when available.
export function enforceRateLimit(request,scope,limit=60){
  const now=Date.now();
  if(buckets.size>MAX_BUCKETS||Math.random()<0.01)prune(now);
  const key=`${scope}:${clientId(request)}`;
  const current=buckets.get(key);
  const bucket=!current||current.resetAt<=now?{count:0,resetAt:now+WINDOW_MS}:current;
  bucket.count+=1;
  buckets.set(key,bucket);
  if(bucket.count<=limit)return null;
  const retryAfter=Math.max(1,Math.ceil((bucket.resetAt-now)/1000));
  return NextResponse.json(
    {error:'too_many_requests'},
    {status:429,headers:{'Cache-Control':'no-store','Retry-After':String(retryAfter)}}
  );
}

export const PUBLIC_CACHE_1M={'Cache-Control':'public, s-maxage=60, stale-while-revalidate=120'};
export const PUBLIC_CACHE_5M={'Cache-Control':'public, s-maxage=300, stale-while-revalidate=600'};
export const PUBLIC_CACHE_15M={'Cache-Control':'public, s-maxage=900, stale-while-revalidate=1800'};
export const NO_STORE={'Cache-Control':'no-store'};
