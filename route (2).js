import { NextResponse } from 'next/server';
import { fetchKasPriceHistory } from '@/lib/price';
import { enforceRateLimit, PUBLIC_CACHE_15M } from '@/lib/api-security';
export const revalidate=900;
export async function GET(request){
  const {searchParams}=new URL(request.url);
  const limited=enforceRateLimit(request,'price-history',30);
  if(limited)return limited;
  const requested=Number(searchParams.get('days')||30);
  const days=Math.min(100,Math.max(1,Number.isFinite(requested)?Math.floor(requested):30));
  const result=await fetchKasPriceHistory(days);
  result.errors={market:Boolean(result.errors?.market),ohlc:Boolean(result.errors?.ohlc)};
  return NextResponse.json(result,{headers:PUBLIC_CACHE_15M});
}
