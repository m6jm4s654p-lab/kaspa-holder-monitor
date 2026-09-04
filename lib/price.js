export async function fetchKasPrice(){
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true',{cache:'no-store'});
    if(!r.ok) throw new Error(`CoinGecko ${r.status}`);
    const j=await r.json();
    return {usd:j.kaspa.usd, change24h:j.kaspa.usd_24h_change, source:'CoinGecko', capturedAt:new Date().toISOString()};
  }catch(e){return {usd:null,change24h:null,source:'CoinGecko',error:e.message,capturedAt:new Date().toISOString()}}
}

export async function fetchKasPriceHistory(days=30){
  const allowed=[1,7,30,90,365];
  const d=allowed.includes(Number(days))?Number(days):30;
  try{
    const r=await fetch(`https://api.coingecko.com/api/v3/coins/kaspa/market_chart?vs_currency=usd&days=${d}`,{cache:'no-store'});
    if(!r.ok) throw new Error(`CoinGecko ${r.status}`);
    const j=await r.json();
    const prices=(j.prices||[]).map(([ts,value])=>({ts,value:Number(value)}));
    const volumes=(j.total_volumes||[]).map(([ts,value])=>({ts,value:Number(value)}));
    return {days:d,prices,volumes,source:'CoinGecko',capturedAt:new Date().toISOString()};
  }catch(e){return {days:d,prices:[],volumes:[],source:'CoinGecko',error:e.message,capturedAt:new Date().toISOString()}}
}
