const BASE='https://www.kaspalytics.com/api/charts/distribution/kas-threshold';
const THRESHOLDS=[['0.01+','0.01+'],['1+','1+'],['100+','100+'],['1K+','1k+'],['10K+','10k+'],['100K+','100k+'],['1M+','1m+'],['10M+','10m+'],['100M+','100m+'],['1B+','1b+']];

async function fetchThreshold(path){
  const response=await fetch(`${BASE}/${encodeURIComponent(path)}`,{next:{revalidate:300},headers:{accept:'application/json','user-agent':'KASPA-Holder-Monitor-TechBit/2.2.15'}});
  if(!response.ok)throw new Error(`Kaspalytics ${response.status}`);
  const json=await response.json(),labels=Array.isArray(json?.labels)?json.labels:[],dataset=(json?.datasets||[]).find(x=>/address/i.test(x?.label||''))||json?.datasets?.[1],values=Array.isArray(dataset?.data)?dataset.data:[],value=Number(values.at(-1)),capturedAt=labels.at(-1);
  if(!Number.isSafeInteger(value)||value<0||!capturedAt||!Number.isFinite(new Date(capturedAt).getTime()))throw new Error('Kaspalytics distribution response invalid');
  return {value,capturedAt};
}

export async function fetchHolderSnapshot(){
  try{
    const results=await Promise.all(THRESHOLDS.map(([,path])=>fetchThreshold(path)));
    const counts=Object.fromEntries(THRESHOLDS.map(([key],index)=>[key,results[index].value]));
    const ordered=['0.01+','1+','100+','1K+','10K+','100K+','1M+','10M+','100M+','1B+'];
    for(let i=1;i<ordered.length;i++)if(counts[ordered[i]]>counts[ordered[i-1]])throw new Error('Kaspalytics threshold consistency check failed');
    return {source:'Kaspalytics',capturedAt:results.map(x=>x.capturedAt).sort().at(-1),total1Plus:counts['1+'],totalBalanceAddresses:counts['0.01+'],minBalanceKas:0.01,circulating:null,concentration:{top10:null,top100:null,top1000:null},cumulative:counts,tiers:[]};
  }catch(error){
    console.error('Kaspalytics holder request failed',error?.message||String(error));
    return {source:'Kaspalytics',capturedAt:new Date().toISOString(),total1Plus:null,totalBalanceAddresses:null,minBalanceKas:0.01,circulating:null,concentration:{top10:null,top100:null,top1000:null},cumulative:{},tiers:[],fallback:true,error:error?.message||String(error)};
  }
}

export function cumulative(snapshot){
  if(snapshot?.cumulative&&Number.isFinite(snapshot.cumulative['100K+']))return snapshot.cumulative;
  return {'1+':null,'10+':null,'100+':null,'1K+':null,'10K+':null,'100K+':null,'1M+':null,'10M+':null,'100M+':null,'1B+':null};
}
