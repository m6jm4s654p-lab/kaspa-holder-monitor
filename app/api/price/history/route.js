import { NextResponse } from 'next/server';
import { fetchKasPriceHistory } from '@/lib/price';
export const dynamic='force-dynamic';
export async function GET(request){
  const {searchParams}=new URL(request.url);
  const days=Number(searchParams.get('days')||30);
  return NextResponse.json(await fetchKasPriceHistory(days));
}
