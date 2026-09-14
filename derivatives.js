const BYBIT_BASE='https://api.bybit.com';
const SYMBOL='KASUSDT';

async function fetchBybit(path){
  const response=await fetch(`${BYBIT_BASE}${path}`,{cache:'no-store',headers:{accept:'application/json','user-agent':'KASPA-Holder-Monitor-TechBit/2.2.14'}});
  if(!response.ok)throw new Error(`Bybit ${response.status}`);
  const json=await response.json();
  if(json.retCode!==0)throw new Error(json.retMsg||`Bybit code ${json.retCode}`);
  return json.result;
}

export async function fetchKasDerivatives(){
  const [tickerResult,historyResult]=await Promise.allSettled([
    fetchBybit(`/v5/market/tickers?category=linear&symbol=${SYMBOL}`),
    fetchBybit(`/v5/market/open-interest?category=linear&symbol=${SYMBOL}&intervalTime=4h&limit=50`)
  ]);
  const ticker=tickerResult.status==='fulfilled'?tickerResult.value?.list?.[0]:null;
  const history=historyResult.status==='fulfilled'?(historyResult.value?.list||[]).map(item=>({
    ts:Number(item.timestamp),value:Number(item.openInterest)
  })).filter(item=>Number.isFinite(item.ts)&&Number.isFinite(item.value)).sort((a,b)=>a.ts-b.ts):[];
  const latest=history.at(-1),target=latest?.ts-24*60*60*1000;
  const previous=history.length?history.reduce((best,item)=>Math.abs(item.ts-target)<Math.abs(best.ts-target)?item:best,history[0]):null;
  const oiChange24h=latest&&previous&&previous.value?(latest.value/previous.value-1)*100:null;
  const openInterest=Number(ticker?.openInterest);
  const openInterestUsd=Number(ticker?.openInterestValue);
  const fundingRate=Number(ticker?.fundingRate);
  if(tickerResult.status==='rejected')console.error('Bybit ticker request failed',tickerResult.reason?.message||String(tickerResult.reason));
  if(historyResult.status==='rejected')console.error('Bybit open-interest request failed',historyResult.reason?.message||String(historyResult.reason));
  return {
    available:Boolean(ticker||history.length),
    symbol:SYMBOL,
    source:'Bybit',
    openInterest:Number.isFinite(openInterest)?openInterest:null,
    openInterestUsd:Number.isFinite(openInterestUsd)?openInterestUsd:null,
    oiChange24h:Number.isFinite(oiChange24h)?oiChange24h:null,
    fundingRate:Number.isFinite(fundingRate)?fundingRate:null,
    nextFundingTime:Number(ticker?.nextFundingTime)||null,
    history,
    capturedAt:new Date().toISOString(),
    errors:{
      ticker:tickerResult.status==='rejected'?(tickerResult.reason?.message||String(tickerResult.reason)):null,
      history:historyResult.status==='rejected'?(historyResult.reason?.message||String(historyResult.reason)):null
    }
  };
}
