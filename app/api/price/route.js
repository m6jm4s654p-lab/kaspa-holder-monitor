import { NextResponse } from 'next/server';
import { fetchKasPrice } from '@/lib/price';
export const revalidate=60;
export async function GET(){return NextResponse.json(await fetchKasPrice());}
