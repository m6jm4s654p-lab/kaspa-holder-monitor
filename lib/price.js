export async function fetchKasPrice(){
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true',{cache:'no-store'});
    if(!r.ok) throw new Error(`CoinGecko ${r.status}`);
    const j=await r.json();
    return {usd:j.kaspa.usd, change24h:j.kaspa.usd_24h_change, source:'CoinGecko', capturedAt:new Date().toISOString()};
  }catch(e){
    return {usd:null,change24h:null,source:'CoinGecko',error:e.message,capturedAt:new Date().toISOString()};
  }
}

export async function fetchKasPriceHistory(days=30){
  const allowed=[1,7,30,90,365];
  const d=allowed.includes(Number(days))?Number(days):30;

  const marketUrl=`https://api.coingecko.com/api/v3/coins/kaspa/market_chart?vs_currency=usd&days=${d}&precision=full`;
  const ohlcUrl=`https://api.coingecko.com/api/v3/coins/kaspa/ohlc?vs_currency=usd&days=${d}&precision=full`;

  let prices=[], volumes=[], candles=[], marketError=null, ohlcError=null;

  try{
    const r=await fetch(marketUrl,{cache:'no-store'});
    if(!r.ok) throw new Error(`CoinGecko market_chart ${r.status}`);
    const j=await r.json();
    prices=(j.prices||[]).map(([ts,value])=>({ts:Number(ts),value:Number(value)}))
      .filter(x=>Number.isFinite(x.ts)&&Number.isFinite(x.value));
    volumes=(j.total_volumes||[]).map(([ts,value])=>({ts:Number(ts),value:Number(value)}))
      .filter(x=>Number.isFinite(x.ts)&&Number.isFinite(x.value));
  }catch(e){
    marketError=e.message;
  }

  try{
    const r=await fetch(ohlcUrl,{cache:'no-store'});
    if(!r.ok) throw new Error(`CoinGecko OHLC ${r.status}`);
    const j=await r.json();
    candles=(Array.isArray(j)?j:[]).map(([ts,open,high,low,close])=>({
      ts:Number(ts),open:Number(open),high:Number(high),low:Number(low),close:Number(close)
    })).filter(x=>[x.ts,x.open,x.high,x.low,x.close].every(Number.isFinite));
  }catch(e){
    ohlcError=e.message;
  }

  return {
    days:d,
    prices,
    volumes,
    candles,
    source:'CoinGecko',
    capturedAt:new Date().toISOString(),
    errors:{market:marketError,ohlc:ohlcError}
  };
}
