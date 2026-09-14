import { NextResponse } from 'next/server';
import { fetchKasDerivatives } from '@/lib/derivatives';
import { enforceRateLimit, PUBLIC_CACHE_5M } from '@/lib/api-security';

export const revalidate=300;

export async function GET(request){
  const limited=enforceRateLimit(request,'derivatives',60);
  if(limited)return limited;
  const result=await fetchKasDerivatives();
  result.errors={ticker:Boolean(result.errors?.ticker),history:Boolean(result.errors?.history)};
  return NextResponse.json(result,{headers:PUBLIC_CACHE_5M});
}
