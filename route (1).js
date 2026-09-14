import { NextResponse } from 'next/server';
import { fetchKasPrice } from '@/lib/price';
import { enforceRateLimit, PUBLIC_CACHE_1M } from '@/lib/api-security';
export const revalidate=60;
export async function GET(request){
  const limited=enforceRateLimit(request,'price',120);
  if(limited)return limited;
  const {error,...price}=await fetchKasPrice();
  return NextResponse.json(price,{headers:PUBLIC_CACHE_1M});
}
