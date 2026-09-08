import { NextResponse } from 'next/server';
import { cumulative, fetchHolderSnapshot } from '@/lib/holders';
export const dynamic='force-dynamic';
export async function GET(){const s=await fetchHolderSnapshot();return NextResponse.json({...s,cumulative:cumulative(s)});}
