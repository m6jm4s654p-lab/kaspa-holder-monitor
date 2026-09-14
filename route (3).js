import { NextResponse } from 'next/server';
import { cumulative, fetchHolderSnapshot } from '@/lib/holders';
import { enforceRateLimit, PUBLIC_CACHE_5M } from '@/lib/api-security';
export const revalidate=300;
export async function GET(request){
  const limited=enforceRateLimit(request,'holders',30);
  if(limited)return limited;
  const snapshot=await fetchHolderSnapshot();
  const {error,...safeSnapshot}=snapshot;
  return NextResponse.json({...safeSnapshot,cumulative:cumulative(snapshot)},{headers:PUBLIC_CACHE_5M});
}
