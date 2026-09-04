import { NextResponse } from 'next/server';
import { fetchKasPrice } from '@/lib/price';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json(await fetchKasPrice());}
