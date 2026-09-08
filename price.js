export async function fetchKasPrice(){
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true',{next:{revalidate:60}});
    if(!r.ok) throw new Error(`CoinGecko ${r.status}`);
    const j=await r.json();
    return {usd:j.kaspa.usd, change24h:j.kaspa.usd_24h_change, source:'CoinGecko', capturedAt:new Date().toISOString()};
  }catch(e){
    return {usd:null,change24h:null,source:'CoinGecko',error:e.message,capturedAt:new Date().toISOString()};
  }
}

export async function fetchKasPriceHistory(days=30){
  // v2.1 keeps 100 days internally for MA warm-up, while the UI shows the latest 60 days.
  const d=100;
  const marketUrl='https://api.coingecko.com/api/v3/coins/kaspa/market_chart?vs_currency=usd&days=100&interval=hourly&precision=full';
  const ohlcUrl='https://api.coingecko.com/api/v3/coins/kaspa/ohlc?vs_currency=usd&days=30&precision=full';
  let prices=[], volumes=[], candles=[], marketError=null,ohlcError=null;

  const fetchJson=async(url,label)=>{
    const r=await fetch(url,{next:{revalidate:900}});
    if(!r.ok) throw new Error(`${label} ${r.status}`);
    return r.json();
  };
  const [marketResult,ohlcResult]=await Promise.allSettled([
    fetchJson(marketUrl,'CoinGecko market_chart'),
    fetchJson(ohlcUrl,'CoinGecko OHLC')
  ]);

  if(marketResult.status==='fulfilled'){
    const j=marketResult.value;
    prices=(j.prices||[]).map(([ts,value])=>({ts:Number(ts),value:Number(value)}))
      .filter(x=>Number.isFinite(x.ts)&&Number.isFinite(x.value));
    volumes=(j.total_volumes||[]).map(([ts,value])=>({ts:Number(ts),value:Number(value)}))
      .filter(x=>Number.isFinite(x.ts)&&Number.isFinite(x.value));
  }else{
    marketError=marketResult.reason?.message||String(marketResult.reason);
  }

  const span=4*60*60*1000,buckets=new Map();
  for(const point of prices){
    const bucket=Math.floor(point.ts/span)*span,current=buckets.get(bucket);
    if(!current)buckets.set(bucket,{ts:bucket,open:point.value,high:point.value,low:point.value,close:point.value,lastTs:point.ts});
    else{current.high=Math.max(current.high,point.value);current.low=Math.min(current.low,point.value);if(point.ts>=current.lastTs){current.close=point.value;current.lastTs=point.ts}}
  }
  candles=[...buckets.values()].sort((a,b)=>a.ts-b.ts).map(({lastTs,...candle})=>candle);

  // Prefer CoinGecko's official 4-hour OHLC for the latest 30 days.
  if(ohlcResult.status==='fulfilled'){
    const official=(Array.isArray(ohlcResult.value)?ohlcResult.value:[]).map(([ts,open,high,low,close])=>({
      ts:Math.floor(Number(ts)/span)*span,open:Number(open),high:Number(high),low:Number(low),close:Number(close)
    })).filter(x=>[x.ts,x.open,x.high,x.low,x.close].every(Number.isFinite));
    const merged=new Map(candles.map(candle=>[candle.ts,candle]));
    official.forEach(candle=>merged.set(candle.ts,candle));
    candles=[...merged.values()].sort((a,b)=>a.ts-b.ts);
  }else{
    ohlcError=ohlcResult.reason?.message||String(ohlcResult.reason);
  }

  const volumeBuckets=new Map();
  for(const point of volumes){const bucket=Math.floor(point.ts/span)*span,current=volumeBuckets.get(bucket);if(!current||point.ts>current.sourceTs)volumeBuckets.set(bucket,{ts:bucket,value:point.value,sourceTs:point.ts})}
  volumes=[...volumeBuckets.values()].sort((a,b)=>a.ts-b.ts).map(({ts,value})=>({ts,value}));

  return {
    days:d,
    prices,
    volumes,
    candles,
    maPrices:prices,
    source:'CoinGecko',
    capturedAt:new Date().toISOString(),
    errors:{market:marketError,ohlc:ohlcError}
  };
}
