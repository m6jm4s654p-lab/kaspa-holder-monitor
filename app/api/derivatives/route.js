import { NextResponse } from 'next/server';
import { fetchKasDerivatives } from '@/lib/derivatives';

export const revalidate=300;

export async function GET(){
  return NextResponse.json(await fetchKasDerivatives());
}
