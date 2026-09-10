const BASE='https://www.kaspalytics.com/api/charts/distribution/kas-threshold';
const THRESHOLDS=[['0.01+','0.01+'],['1+','1+'],['100+','100+'],['1K+','1k+'],['10K+','10k+'],['100K+','100k+'],['1M+','1m+'],['10M+','10m+'],['100M+','100m+'],['1B+','1b+']];

async function fetchThreshold(key,path){
  const response=await fetch(`${BASE}/${encodeURIComponent(path)}`,{next:{revalidate:300},headers:{accept:'application/json','user-agent':'KASPA-Holder-Monitor-TechBit/2.2.16'}});
  if(!response.ok)throw new Error(`Kaspalytics ${response.status}`);
  const json=await response.json(),labels=Array.isArray(json?.labels)?json.labels:[],addressSet=(json?.datasets||[]).find(x=>/address/i.test(x?.label||''))||json?.datasets?.[1],priceSet=(json?.datasets||[]).find(x=>/price/i.test(x?.label||''))||json?.datasets?.[0],values=addressSet?.data||[],prices=priceSet?.data||[];
  const points=labels.map((capturedAt,index)=>({capturedAt,value:Number(values[index]),price:Number(prices[index])})).filter(x=>Number.isSafeInteger(x.value)&&x.value>=0&&Number.isFinite(new Date(x.capturedAt).getTime()));
  if(!points.length)throw new Error('Kaspalytics distribution response invalid');
  return {key,points};
}

async function fetchAll(){return Promise.all(THRESHOLDS.map(([key,path])=>fetchThreshold(key,path)))}
function validCounts(counts){
  const ordered=['0.01+','1+','100+','1K+','10K+','100K+','1M+','10M+','100M+','1B+'];
  return ordered.every(key=>Number.isSafeInteger(counts[key]))&&ordered.slice(1).every((key,index)=>counts[key]<=counts[ordered[index]]);
}

export async function fetchHolderHistory(days=30){
  const sets=await fetchAll(),maps=Object.fromEntries(sets.map(set=>[set.key,new Map(set.points.map(point=>[point.capturedAt,point]))])),base=sets.find(set=>set.key==='100K+').points.slice(-Math.max(1,days));
  return base.map(point=>{
    const counts=Object.fromEntries(THRESHOLDS.map(([key])=>[key,maps[key].get(point.capturedAt)?.value]));
    if(!validCounts(counts))return null;
    return {captured_at:point.capturedAt,kas_price_usd:Number.isFinite(point.price)?point.price:null,total_1_plus:counts['1+'],a_1k_plus:counts['1K+'],a_10k_plus:counts['10K+'],a_100k_plus:counts['100K+'],a_1m_plus:counts['1M+'],a_10m_plus:counts['10M+'],a_100m_plus:counts['100M+'],top10_share:null,top100_share:null,top1000_share:null,circulating:null};
  }).filter(Boolean);
}

export async function fetchHolderSnapshot(){
  try{
    const sets=await fetchAll(),latest=Object.fromEntries(sets.map(set=>[set.key,set.points.at(-1)])),counts=Object.fromEntries(THRESHOLDS.map(([key])=>[key,latest[key]?.value]));
    if(!validCounts(counts))throw new Error('Kaspalytics threshold consistency check failed');
    return {source:'Kaspalytics',capturedAt:latest['100K+'].capturedAt,total1Plus:counts['1+'],totalBalanceAddresses:counts['0.01+'],minBalanceKas:0.01,circulating:null,concentration:{top10:null,top100:null,top1000:null},cumulative:counts,tiers:[]};
  }catch(error){
    console.error('Kaspalytics holder request failed',error?.message||String(error));
    return {source:'Kaspalytics',capturedAt:new Date().toISOString(),total1Plus:null,totalBalanceAddresses:null,minBalanceKas:0.01,circulating:null,concentration:{top10:null,top100:null,top1000:null},cumulative:{},tiers:[],fallback:true,error:error?.message||String(error)};
  }
}

export function cumulative(snapshot){
  if(snapshot?.cumulative&&Number.isFinite(snapshot.cumulative['100K+']))return snapshot.cumulative;
  return {'1+':null,'10+':null,'100+':null,'1K+':null,'10K+':null,'100K+':null,'1M+':null,'10M+':null,'100M+':null,'1B+':null};
}
