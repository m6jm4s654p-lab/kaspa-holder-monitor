import { NextResponse } from 'next/server';
import { enforceRateLimit, NO_STORE } from '@/lib/api-security';

export const dynamic='force-dynamic';
export async function GET(request){
  const limited=enforceRateLimit(request,'health',30);
  if(limited)return limited;
  return NextResponse.json({
    ok:true,
    app:'KASPA Holder Monitor',
    version:'2.2.14',
    now:new Date().toISOString()
  },{headers:NO_STORE});
}
