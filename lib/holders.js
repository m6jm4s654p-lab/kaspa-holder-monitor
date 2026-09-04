const FALLBACK = {
  source: 'Kaspatrol / api.kaspa.org',
  capturedAt: '2026-09-04T11:25:00.000Z',
  total1Plus: 546653,
  circulating: 27680000000,
  concentration: { top10: 25.26, top100: 40.33, top1000: 58.59 },
  tiers: [
    { key:'1b', min:1000000000, count:1 },
    { key:'100m', min:100000000, count:15 },
    { key:'10m', min:10000000, count:186 },
    { key:'1m', min:1000000, count:2934 },
    { key:'100k', min:100000, count:22297 },
    { key:'10k', min:10000, count:66101 },
    { key:'1k', min:1000, count:99891 },
    { key:'100', min:100, count:100459 },
    { key:'10', min:10, count:108652 }
  ]
};

function plain(html){return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&ge;|≥/g,'≥').replace(/\s+/g,' ')}
function num(s){return Number(String(s).replace(/,/g,''))}

export async function fetchHolderSnapshot(){
  try{
    const r=await fetch('https://kaspatrol.com/addresses',{cache:'no-store',headers:{'user-agent':'KASPA-Holder-Monitor-TechBit/1.0'}});
    if(!r.ok) throw new Error(`Kaspatrol ${r.status}`);
    const text=plain(await r.text());
    const totalMatch=text.match(/Addrs with\s*≥\s*1\s*KAS\s*([\d,]+)/i);
    const circMatch=text.match(/Circulating\s*([\d.]+)B\s*KAS/i);
    const top10=text.match(/Top 10 owns\s*[\d.]+B\s*([\d.]+)%/i);
    const top100=text.match(/Top 100 owns\s*[\d.]+B\s*([\d.]+)%/i);
    const top1000=text.match(/Top 1000 owns\s*[\d.]+B\s*([\d.]+)%/i);
    const labels=[
      ['1b',1000000000,'Aquaman'],['100m',100000000,'Humpback'],['10m',10000000,'Whale'],
      ['1m',1000000,'Shark'],['100k',100000,'Dolphin'],['10k',10000,'Fish'],['1k',1000,'Octopus'],['100',100,'Crab'],['10',10,'Shrimp']
    ];
    const tiers=labels.map(([key,min,label])=>{
      const re=new RegExp(label+'\\s*'+min.toLocaleString('en-US').replaceAll(',','[,]?')+'\\s*([\\d,]+)','i');
      const m=text.match(re); return {key,min,count:m?num(m[1]):null};
    });
    if(!totalMatch || tiers.some(t=>t.count==null)) throw new Error('distribution parse failed');
    return {
      source:'Kaspatrol / api.kaspa.org', capturedAt:new Date().toISOString(), total1Plus:num(totalMatch[1]),
      circulating:circMatch?Number(circMatch[1])*1e9:FALLBACK.circulating,
      concentration:{top10:top10?Number(top10[1]):FALLBACK.concentration.top10,top100:top100?Number(top100[1]):FALLBACK.concentration.top100,top1000:top1000?Number(top1000[1]):FALLBACK.concentration.top1000},
      tiers
    };
  }catch(e){return {...FALLBACK, fallback:true, error:e.message};}
}

export function cumulative(snapshot){
  const t=Object.fromEntries(snapshot.tiers.map(x=>[x.key,x.count]));
  return {
    '1+': snapshot.total1Plus,
    '10+': t['10']+t['100']+t['1k']+t['10k']+t['100k']+t['1m']+t['10m']+t['100m']+t['1b'],
    '100+': t['100']+t['1k']+t['10k']+t['100k']+t['1m']+t['10m']+t['100m']+t['1b'],
    '1K+': t['1k']+t['10k']+t['100k']+t['1m']+t['10m']+t['100m']+t['1b'],
    '10K+': t['10k']+t['100k']+t['1m']+t['10m']+t['100m']+t['1b'],
    '100K+': t['100k']+t['1m']+t['10m']+t['100m']+t['1b'],
    '1M+': t['1m']+t['10m']+t['100m']+t['1b'],
    '10M+': t['10m']+t['100m']+t['1b'],
    '100M+': t['100m']+t['1b'],
    '1B+': t['1b']
  };
}
