'use client';
import { useEffect, useMemo, useState } from 'react';

const T={
 ja:{tag:'データで見る、KASPAの未来。',live:'LIVE ON-CHAIN',price:'KAS価格',addresses:'残高保有アドレス総数',supply:'流通供給量',whales:'クジラ集中度',holderScore:'Holder Trend Score',scoreHelp:'@TechBit独自のオンチェーン指標です。1K+〜1M+の保有層の増減、大口層の増減、Top100集中度の変化、価格とHolderのダイバージェンスを組み合わせて0〜100で評価します。Kaspa公式指標や売買シグナルではありません。',tiers:'保有量別アドレス数',current:'現在',d7:'7日変化',d30:'30日変化',trend:'100K+ アドレス数の推移',daily:'100K+ 日次変化量',compare:'価格 vs 100K+ アドレス',signal:'マーケットシグナル',noHistory:'日次履歴を蓄積すると、7D・30D・90Dの変化とHolder Trend Scoreを自動計算します。',acc:'ACCUMULATION',neutral:'NEUTRAL',dist:'DISTRIBUTION',foot:'アドレス数＝保有者数ではありません。1ウォレットが複数アドレスを利用する場合があります。クジラ集中度には取引所・サービス用アドレスが含まれる可能性があります。',source:'データソース',updated:'更新',home:'ホーム',charts:'チャート',holders:'ホルダー',alerts:'アラート',more:'その他',top10:'Top 10',top100:'Top 100',top1000:'Top 1000',whaleHelp:'Top10 / Top100 / Top1000 は累積値です。下の帯は重複しない保有層に分解し、供給量がどこに集中しているかを示します。',insufficient:'履歴不足',priceLive:'CoinGecko 実市場データ',ohlc:'OHLC ローソク足',open:'始値',close:'終値',dataUnavailable:'価格データを取得できません',realData:'実データのみ表示',periodChange:'期間騰落率',high:'高値',low:'安値',volume:'直近出来高',scoreBreakdown:'スコア内訳',breadth:'保有層の広がり',large:'大口層トレンド',concentration:'集中度改善',divergence:'価格との乖離',scoreNote:'30日程度の履歴が揃うまでスコアは表示しません。',other:'その他',top11_100:'11–100位',top101_1000:'101–1000位',normalized:'期間開始=0%で正規化',priceLegend:'KAS価格',holderLegend:'100K+アドレス',holderAnalysis:'Holder分析',holderPeriod:'分析期間',addresses100k:'100K+アドレス',addresses1m:'1M+アドレス',top100Change:'Top100集中度',momentum:'Holder Momentum',momentumHelp:'選択期間の100K+アドレス増減を、期間前半と後半で比較した変化速度です。',divergenceTitle:'価格とのダイバージェンス',divAcc:'価格下落・Holder増加',divDist:'価格上昇・Holder減少',divConfirm:'価格とHolderが同方向',historyCoverage:'履歴カバレッジ',days:'日',observed:'観測',needMore:'この期間を評価するには履歴が不足しています。',realHistory:'Supabase実履歴のみ',pp:'pt',minAddressBalance:'残高 0.0001 KAS以上',networkWide:'ネットワーク全体',oneKasPlus:'1 KAS以上'},
 en:{tag:'See the on-chain story. Build a bigger KASPA.',live:'LIVE ON-CHAIN',price:'KAS Price',addresses:'Total Balance-Holding Addresses',supply:'Circulating Supply',whales:'Whale Concentration',holderScore:'Holder Trend Score',scoreHelp:'A proprietary @TechBit on-chain indicator. It combines changes across 1K+ to 1M+ address tiers, large-holder trends, Top-100 concentration changes, and price/holder divergence into a 0–100 score. It is not an official Kaspa metric or a trading signal.',tiers:'Addresses by Holding Tier',current:'Current',d7:'7D change',d30:'30D change',trend:'100K+ Address Trend',daily:'100K+ Daily Change',compare:'Price vs 100K+ Addresses',signal:'Market Signal',noHistory:'As daily history accumulates, the app will calculate real 7D/30D/90D changes and the Holder Trend Score.',acc:'ACCUMULATION',neutral:'NEUTRAL',dist:'DISTRIBUTION',foot:'Address count is not holder count. One wallet may use multiple addresses. Whale concentration may include exchange or service addresses.',source:'Data source',updated:'Updated',home:'Home',charts:'Charts',holders:'Holders',alerts:'Alerts',more:'More',top10:'Top 10',top100:'Top 100',top1000:'Top 1000',whaleHelp:'Top 10 / Top 100 / Top 1000 are cumulative. The strip below decomposes them into non-overlapping groups so concentration is easier to read.',insufficient:'Not enough history',priceLive:'Live CoinGecko market data',ohlc:'OHLC candlesticks',open:'Open',close:'Close',dataUnavailable:'Price data unavailable',realData:'Real data only',periodChange:'Period change',high:'High',low:'Low',volume:'Latest volume',scoreBreakdown:'Score breakdown',breadth:'Holder breadth',large:'Large-holder trend',concentration:'Concentration improvement',divergence:'Price divergence',scoreNote:'The score stays hidden until roughly 30 days of history is available.',other:'Other',top11_100:'Ranks 11–100',top101_1000:'Ranks 101–1000',normalized:'Normalized to 0% at period start',priceLegend:'KAS price',holderLegend:'100K+ addresses',holderAnalysis:'Holder analysis',holderPeriod:'Analysis period',addresses100k:'100K+ addresses',addresses1m:'1M+ addresses',top100Change:'Top-100 concentration',momentum:'Holder Momentum',momentumHelp:'Change acceleration in 100K+ addresses, comparing the first and second halves of the selected period.',divergenceTitle:'Price divergence',divAcc:'Price down / holders up',divDist:'Price up / holders down',divConfirm:'Price and holders aligned',historyCoverage:'History coverage',days:'days',observed:'observed',needMore:'Not enough history to evaluate this period.',realHistory:'Supabase real history only',pp:'pt',minAddressBalance:'Balance ≥ 0.0001 KAS',networkWide:'Network-wide',oneKasPlus:'≥ 1 KAS',minAddressBalance:'残高 0.0001 KAS以上',networkWide:'ネットワーク全体',oneKasPlus:'1 KAS以上'}
};
const tiers=['1+','100+','1K+','10K+','100K+','1M+','10M+','100M+'];
function fmt(n){if(n==null)return '—';return Number(n).toLocaleString()}
function pct(n){if(n==null||!Number.isFinite(n))return '—';return `${n>=0?'+':''}${n.toFixed(2)}%`}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function mapRow(r,key){return ({'1+':r.total_1_plus,'1K+':r.a_1k_plus,'10K+':r.a_10k_plus,'100K+':r.a_100k_plus,'1M+':r.a_1m_plus,'10M+':r.a_10m_plus,'100M+':r.a_100m_plus}[key]??null)}
function jstDay(iso){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))}
function dailyRows(rows=[]){const byDay=new Map();for(const r of rows){if(r?.captured_at)byDay.set(jstDay(r.captured_at),r)}return [...byDay.values()].sort((a,b)=>new Date(a.captured_at)-new Date(b.captured_at))}
function nearestChange(rows,key,days){if(!rows?.length)return null;const now=rows.at(-1),target=new Date(now.captured_at).getTime()-days*86400000;let prev=rows[0];for(const r of rows){if(Math.abs(new Date(r.captured_at)-target)<Math.abs(new Date(prev.captured_at)-target))prev=r}const a=mapRow(now,key),b=mapRow(prev,key);if(a==null||!b)return null;return {abs:a-b,pct:(a-b)/b*100,daysObserved:(new Date(now.captured_at)-new Date(prev.captured_at))/86400000}}
function compactUsd(v){if(!Number.isFinite(v))return '—';return new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1,style:'currency',currency:'USD'}).format(v)}

function changeBetween(a,b,key){
 const av=mapRow(a,key),bv=mapRow(b,key);
 if(av==null||bv==null||!bv)return null;
 return {abs:av-bv,pct:(av-bv)/bv*100};
}
function concentrationDelta(rows,days){
 if(!rows?.length)return null;
 const now=rows.at(-1),target=new Date(now.captured_at).getTime()-days*86400000;
 let prev=rows[0];
 for(const r of rows){if(Math.abs(new Date(r.captured_at)-target)<Math.abs(new Date(prev.captured_at)-target))prev=r}
 const observed=(new Date(now.captured_at)-new Date(prev.captured_at))/86400000;
 if(now.top100_share==null||prev.top100_share==null)return null;
 return {delta:Number(now.top100_share)-Number(prev.top100_share),daysObserved:observed};
}
function holderMomentum(rows,days){
 if(!rows?.length)return null;
 const now=rows.at(-1),endTs=new Date(now.captured_at).getTime(),startTs=endTs-days*86400000,midTs=startTs+(days*86400000/2);
 const periodRows=rows.filter(r=>{const ts=new Date(r.captured_at).getTime();return ts>=startTs&&ts<=endTs});
 if(periodRows.length<3)return null;
 const first=periodRows[0],mid=periodRows.reduce((best,r)=>Math.abs(new Date(r.captured_at)-midTs)<Math.abs(new Date(best.captured_at)-midTs)?r:best,periodRows[0]),last=periodRows.at(-1);
 const a=mapRow(first,'100K+'),m=mapRow(mid,'100K+'),b=mapRow(last,'100K+');
 if([a,m,b].some(v=>v==null))return null;
 const firstHalf=m-a,secondHalf=b-m;
 return {firstHalf,secondHalf,acceleration:secondHalf-firstHalf};
}

function scoreComponent(v){return Math.round(clamp(v,0,100))}

function MarketChart({candles,prices,volumes,lang,t}){
 const [hover,setHover]=useState(null);
 const W=430,H=244,PL=8,PR=58,PT=14,PB=30,VH=48;
 const hasCandles=Array.isArray(candles)&&candles.length>=2;
 const hasPrices=Array.isArray(prices)&&prices.length>=2;
 if(!hasCandles&&!hasPrices)return <div className="emptyChart marketEmpty"><div><b>{t.dataUnavailable}</b><span>{t.realData}</span></div></div>;

 // Use true OHLC candles whenever CoinGecko OHLC is available.
 const points=hasCandles?candles:prices.map(p=>({ts:p.ts,open:p.value,high:p.value,low:p.value,close:p.value}));
 const highs=points.map(x=>x.high),lows=points.map(x=>x.low);
 const rawMin=Math.min(...lows),rawMax=Math.max(...highs),pad=(rawMax-rawMin)*.07||rawMax*.01||.001,lo=rawMin-pad,hi=rawMax+pad;
 const plotBottom=H-PB-VH;
 const x=i=>PL+i*(W-PL-PR)/(Math.max(points.length-1,1));
 const y=v=>PT+(hi-v)*(plotBottom-PT)/(hi-lo);
 const volVals=(volumes||[]).map(v=>v.value).filter(Number.isFinite),vmax=Math.max(...volVals,1);
 const idx=hover==null?points.length-1:hover,p=points[idx],cx=x(idx);
 const candleStep=(W-PL-PR)/Math.max(points.length-1,1);
 const bodyW=Math.max(1.2,Math.min(7,candleStep*.62));
 const onMove=e=>{const r=e.currentTarget.getBoundingClientRect(),px=((e.touches?.[0]?.clientX??e.clientX)-r.left)/r.width*W;setHover(clamp(Math.round((px-PL)/(W-PL-PR)*(points.length-1)),0,points.length-1))};
 const dateFmt=new Intl.DateTimeFormat(lang==='ja'?'ja-JP':'en-US',{month:'short',day:'numeric'});
 const dtFmt=new Intl.DateTimeFormat(lang==='ja'?'ja-JP':'en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 const start=points[0].open,end=points.at(-1).close,periodPct=(end/start-1)*100;
 const axis=[hi,(hi+lo)/2,lo];

 // Real market_chart line is used only when OHLC is unavailable; never synthetic.
 const fallbackPath=!hasCandles?points.map((q,i)=>`${i?'L':'M'}${x(i)},${y(q.close)}`).join(' '):null;

 return <div className="marketWrap">
  <div className="chartMode"><span className="realDot"/> <b>{hasCandles?t.ohlc:t.priceLive}</b><em>{t.realData}</em></div>
  <svg className="marketChart" viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={()=>setHover(null)} onTouchMove={onMove}>
   {[0,.25,.5,.75,1].map((q,i)=>{const yy=PT+q*(plotBottom-PT);return <line key={i} x1={PL} y1={yy} x2={W-PR} y2={yy} className="mgrid"/>})}
   {(volumes||[]).slice(0,points.length).map((v,i)=>{const bh=(v.value/vmax)*(VH-7),xx=PL+i*(W-PL-PR)/(Math.max((volumes||[]).slice(0,points.length).length-1,1));return <rect key={i} x={xx-.8} y={H-PB-bh} width="1.6" height={bh} className="volbar"/>})}
   {hasCandles ? points.map((q,i)=>{const xx=x(i),up=q.close>=q.open,top=y(Math.max(q.open,q.close)),bottom=y(Math.min(q.open,q.close)),bh=Math.max(1,bottom-top);return <g key={q.ts} className={up?'candleUp':'candleDown'}><line x1={xx} y1={y(q.high)} x2={xx} y2={y(q.low)} className="wick"/><rect x={xx-bodyW/2} y={top} width={bodyW} height={bh} rx=".6" className="body"/></g>}) :
    <path d={fallbackPath} fill="none" className="realPriceLine" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"/>}
   {axis.map((v,i)=><text key={i} x={W-PR+5} y={PT+i*(plotBottom-PT)/2+4} className="axisText">${v.toFixed(v<.1?5:3)}</text>)}
   {[0,Math.floor((points.length-1)/2),points.length-1].map((i,k)=><text key={k} x={x(i)} y={H-7} textAnchor={k===0?'start':k===2?'end':'middle'} className="axisText">{dateFmt.format(new Date(points[i].ts))}</text>)}
   <line x1={cx} y1={PT} x2={cx} y2={H-PB} className="cross"/>
   <circle cx={cx} cy={y(p.close)} r="3.5" className="closeDot"/>
   <rect x={W-PR+1} y={clamp(y(p.close)-10,2,plotBottom-20)} width={PR-3} height="20" rx="4" className="priceTag"/>
   <text x={W-PR+5} y={clamp(y(p.close)+4,16,plotBottom-6)} className="priceTagText">${p.close.toFixed(p.close<.1?5:3)}</text>
  </svg>
  <div className="ohlcTooltip">
   <div className="ohlcTime">{dtFmt.format(new Date(p.ts))}</div>
   <span>O <b>${p.open.toFixed(5)}</b></span><span>H <b>${p.high.toFixed(5)}</b></span>
   <span>L <b>${p.low.toFixed(5)}</b></span><span>C <b>${p.close.toFixed(5)}</b></span>
  </div>
 </div>
}
function LineChart({values}){const W=420,H=130,p=8,all=values.filter(Number.isFinite);if(all.length<2)return <div className="emptyChart">NO HISTORY YET</div>;const min=Math.min(...all),max=Math.max(...all),range=max-min||1,path=values.map((v,i)=>`${i?'L':'M'}${p+i*(W-2*p)/(values.length-1)},${H-p-(v-min)*(H-2*p)/range}`).join(' ');return <svg className="chart" viewBox={`0 0 ${W} ${H}`}><g className="gridLines"><line x1="0" y1="32" x2={W} y2="32"/><line x1="0" y1="65" x2={W} y2="65"/><line x1="0" y1="98" x2={W} y2="98"/></g><path d={path} fill="none" stroke="#49eac1" strokeWidth="3" strokeLinecap="round"/></svg>}
function NormalizedCompare({holderValues,priceValues,t}){if(holderValues.length<2||priceValues.length<2)return <div className="emptyChart">NO HISTORY YET</div>;const n=Math.min(holderValues.length,priceValues.length),h=holderValues.slice(-n),p=priceValues.slice(-n),hn=h.map(v=>(v/h[0]-1)*100),pn=p.map(v=>(v/p[0]-1)*100),all=[...hn,...pn],min=Math.min(...all,0),max=Math.max(...all,0),range=max-min||1,W=420,H=145,px=8;const path=d=>d.map((v,i)=>`${i?'L':'M'}${px+i*(W-2*px)/(d.length-1)},${H-px-(v-min)*(H-2*px)/range}`).join(' '),zeroY=H-px-(0-min)*(H-2*px)/range;return <><svg className="chart compareChart" viewBox={`0 0 ${W} ${H}`}><line x1="0" y1={zeroY} x2={W} y2={zeroY} className="zeroLine"/><path d={path(pn)} fill="none" stroke="#f3faf8" strokeWidth="2.2"/><path d={path(hn)} fill="none" stroke="#49eac1" strokeWidth="3"/></svg><div className="legend"><span><i className="legendPrice"/> {t.priceLegend} {pct(pn.at(-1))}</span><span><i className="legendHolder"/> {t.holderLegend} {pct(hn.at(-1))}</span></div><div className="normalizedNote">{t.normalized}</div></>}
function BarChart({values}){if(values.length<2)return <div className="emptyChart">NO HISTORY YET</div>;const W=420,H=120,mid=60,max=Math.max(...values.map(v=>Math.abs(v)),1);return <svg className="chart" viewBox={`0 0 ${W} ${H}`}><line x1="0" y1={mid} x2={W} y2={mid} stroke="#ffffff22"/>{values.map((v,i)=>{const bw=W/values.length*.55,h=Math.abs(v)/max*52,x=i*W/values.length+(W/values.length-bw)/2,y=v>=0?mid-h:mid;return <rect key={i} x={x} y={y} width={bw} height={h} rx="1.5" fill={v>=0?'#49eac1':'#ff6b6b'}/>})}</svg>}

export default function Dashboard(){
 const [lang,setLang]=useState('ja'),[holder,setHolder]=useState(null),[price,setPrice]=useState(null),[priceHistory,setPriceHistory]=useState({prices:[],volumes:[],candles:[]}),[history,setHistory]=useState({enabled:false,rows:[]}),[period,setPeriod]=useState(30),[holderPeriod,setHolderPeriod]=useState(30),[scoreOpen,setScoreOpen]=useState(false);const t=T[lang];
 useEffect(()=>{const l=localStorage.getItem('khm-lang')||(navigator.language.startsWith('ja')?'ja':'en');setLang(l);if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});Promise.all([fetch('/api/holders').then(r=>r.json()),fetch('/api/price').then(r=>r.json()),fetch('/api/history?days=400').then(r=>r.json())]).then(([h,p,his])=>{setHolder(h);setPrice(p);setHistory(his)});},[]);
 useEffect(()=>{const d=Math.max(period,holderPeriod);fetch(`/api/price/history?days=${d}`).then(r=>r.json()).then(setPriceHistory).catch(()=>setPriceHistory({prices:[],volumes:[],candles:[]}));},[period,holderPeriod]);
 const allDaily=useMemo(()=>dailyRows(history.rows||[]),[history.rows]);const rows=useMemo(()=>allDaily.slice(-Math.max(period,2)),[allDaily,period]);
 const h100=rows.map(r=>r.a_100k_plus).filter(Number.isFinite),priceSeries=rows.map(r=>r.kas_price_usd).filter(Number.isFinite),daily=h100.slice(1).map((v,i)=>v-h100[i]);
 const changes30=['1K+','10K+','100K+','1M+'].map(k=>nearestChange(allDaily,k,30)),latest=allDaily.at(-1),old30=allDaily.length?allDaily.reduce((best,r)=>Math.abs(new Date(r.captured_at)-(new Date(latest.captured_at).getTime()-30*86400000))<Math.abs(new Date(best.captured_at)-(new Date(latest.captured_at).getTime()-30*86400000))?r:best,allDaily[0]):null;
 const concentrationChange=latest&&old30&&latest!==old30&&latest.top100_share!=null&&old30.top100_share!=null?latest.top100_share-old30.top100_share:null,livePrice30=priceHistory.prices?.length>1?(priceHistory.prices.at(-1).value/priceHistory.prices[0].value-1)*100:null,enoughHistory=changes30.every(c=>c&&c.daysObserved>=25);
 const scoreParts=useMemo(()=>{if(!enoughHistory)return null;const breadthAvg=changes30.reduce((s,c)=>s+c.pct,0)/4,largeAvg=((changes30[2]?.pct||0)+(changes30[3]?.pct||0))/2,breadth=scoreComponent(50+breadthAvg*10),large=scoreComponent(50+largeAvg*12.5),concentration=scoreComponent(50-(concentrationChange||0)*50);let divergence=50;if(livePrice30<0&&breadthAvg>0)divergence=85;else if(livePrice30>0&&breadthAvg>0)divergence=65;else if(livePrice30>0&&breadthAvg<0)divergence=20;else if(livePrice30<0&&breadthAvg<0)divergence=35;const total=Math.round(breadth*.35+large*.25+concentration*.20+divergence*.20);return {breadth,large,concentration,divergence,total}},[enoughHistory,changes30,concentrationChange,livePrice30]);
 const score=scoreParts?.total??null,signal=score==null?t.insufficient:score>=65?t.acc:score<=35?t.dist:t.neutral,change30=nearestChange(allDaily,'100K+',30),
 holder100k=nearestChange(allDaily,'100K+',holderPeriod),holder1m=nearestChange(allDaily,'1M+',holderPeriod),top100Delta=concentrationDelta(allDaily,holderPeriod),momentum=holderMomentum(allDaily,holderPeriod),
 holderEnough=holder100k&&holder100k.daysObserved>=holderPeriod*.80&&holder1m&&holder1m.daysObserved>=holderPeriod*.80,
 holderPriceStart=priceHistory?.prices?.[0]?.value,holderPriceEnd=priceHistory?.prices?.at(-1)?.value,
 holderPricePct=(holderPriceStart&&holderPriceEnd)?(holderPriceEnd/holderPriceStart-1)*100:null,
 divergenceLabel=holderEnough&&holderPricePct!=null?(holderPricePct<0&&holder100k.pct>0?t.divAcc:holderPricePct>0&&holder100k.pct<0?t.divDist:t.divConfirm):t.insufficient,
 toggleLang=()=>{const n=lang==='ja'?'en':'ja';setLang(n);localStorage.setItem('khm-lang',n)},concentration=holder?.concentration||{};
 const ph=priceHistory.prices||[],pv=priceHistory.volumes||[],pc=priceHistory.candles||[],periodChange=ph.length>1?(ph.at(-1).value/ph[0].value-1)*100:null,periodHigh=ph.length?Math.max(...ph.map(x=>x.value)):null,periodLow=ph.length?Math.min(...ph.map(x=>x.value)):null,latestVol=pv.length?pv.at(-1).value:null;
 const top10=Number(concentration.top10)||0,top100=Number(concentration.top100)||0,top1000=Number(concentration.top1000)||0,segments=[{label:t.top10,val:top10,cls:'seg10'},{label:t.top11_100,val:Math.max(0,top100-top10),cls:'seg100'},{label:t.top101_1000,val:Math.max(0,top1000-top100),cls:'seg1000'},{label:t.other,val:Math.max(0,100-top1000),cls:'segOther'}];
 return <main className="shell">
  <header className="topbar"><div className="brandBlock"><img src="/kaspa-logo.svg" className="kaspaMark" alt="Kaspa"/><div><div className="kaspaWord">KASPA</div><div className="monitorWord">HOLDER MONITOR</div></div></div><div className="techbitBrand"><span>ANALYTICS BY</span><b>@TechBit</b></div><button className="lang" onClick={toggleLang}>{lang==='ja'?'EN':'JA'}</button></header>
  <section className="hero"><div className="live"><i/> {t.live}</div><h1>{t.tag}</h1><p>Small Steps. A Bigger KASPA.</p></section>
  <section className="card priceCard"><div className="row"><div><div className="eyebrow">{t.price} (USD)</div><div className="price">{price?.usd?`$${price.usd.toFixed(price.usd<.1?5:3)}`:'—'}</div><div className={price?.change24h>=0?'up':'down'}>{price?.change24h!=null?pct(price.change24h):'—'} <span>24h</span></div></div><div className="periods">{[1,7,30,90,365].map(x=><button key={x} className={period===x?'active':''} onClick={()=>setPeriod(x)}>{x===365?'1Y':`${x}D`}</button>)}</div></div><MarketChart candles={pc} prices={ph} volumes={pv} lang={lang} t={t}/><div className="marketStats"><div><span>{t.periodChange}</span><b className={periodChange>=0?'up':'down'}>{pct(periodChange)}</b></div><div><span>{t.high}</span><b>{periodHigh?`$${periodHigh.toFixed(5)}`:'—'}</b></div><div><span>{t.low}</span><b>{periodLow?`$${periodLow.toFixed(5)}`:'—'}</b></div><div><span>{t.volume}</span><b>{compactUsd(latestVol)}</b></div></div><div className="priceSource"><span className="realDot"/> {t.priceLive} · {pc.length?t.ohlc:'market_chart'} · {t.realData}{priceHistory?.capturedAt?` · ${new Date(priceHistory.capturedAt).toLocaleTimeString(lang==='ja'?'ja-JP':'en-US')}`:''}</div></section>
  <div className="statsGrid"><section className="card stat"><div className="eyebrow">{t.addresses}</div><b>{fmt(holder?.totalBalanceAddresses)}</b><small>{holder?.totalBalanceAddresses!=null?t.minAddressBalance:(holder?.fallback?'Live total unavailable':t.minAddressBalance)} · {t.networkWide}</small><div className="subStat"><span>{t.oneKasPlus}</span><b>{fmt(holder?.total1Plus)}</b></div></section><section className="card stat score"><div className="eyebrow scoreTitle">{t.holderScore}<button onClick={()=>setScoreOpen(v=>!v)}>?</button></div>{score==null?<div className="scoreMissing">—<small>{t.insufficient}</small></div>:<><div className="gauge" style={{'--score':`${score*3.6}deg`}}><b>{score}</b></div><small className="signalPill">{signal}</small></>}{scoreOpen&&<div className="scoreExplain"><b>{t.scoreBreakdown}</b><p>{t.scoreHelp}</p>{scoreParts&&<div className="scoreParts">{[[t.breadth,scoreParts.breadth,'35%'],[t.large,scoreParts.large,'25%'],[t.concentration,scoreParts.concentration,'20%'],[t.divergence,scoreParts.divergence,'20%']].map(([l,v,w])=><div key={l}><span>{l} <em>{w}</em></span><b>{v}</b></div>)}</div>}<small>{t.scoreNote}</small></div>}</section></div>
  <div className="statsGrid"><section className="card stat"><div className="eyebrow">{t.supply}</div><b>{holder?.circulating?`${(holder.circulating/1e9).toFixed(2)} B KAS`:'—'}</b><div className="supplyBar"><i style={{width:'100%'}}/></div><small>KAS circulating</small></section><section className="card stat whaleCard"><div className="eyebrow">{t.whales}</div><div className="whaleHero"><b>{top100.toFixed(2)}%</b><span>{lang==='ja'?'上位100アドレス':'held by Top 100'}</span></div><div className="whaleStack">{segments.map(s=><i key={s.label} className={s.cls} style={{width:`${s.val}%`}} title={`${s.label}: ${s.val.toFixed(2)}%`}/>)}</div><div className="whaleLegend">{segments.map(s=><span key={s.label}><i className={s.cls}/>{s.label}<b>{s.val.toFixed(2)}%</b></span>)}</div><p className="whaleHelp">{t.whaleHelp}</p></section></div>
  <section className="card holderAnalysisCard">
   <div className="holderAnalysisHead"><div><div className="eyebrow">{t.holderAnalysis}</div><b>{t.realHistory}</b></div><div className="holderPeriods">{[7,30,90].map(x=><button key={x} className={holderPeriod===x?'active':''} onClick={()=>setHolderPeriod(x)}>{x}D</button>)}</div></div>
   <div className="coverage"><span>{t.historyCoverage}</span><b>{allDaily.length?`${Math.max(1,Math.round((new Date(allDaily.at(-1).captured_at)-new Date(allDaily[0].captured_at))/86400000)+1)} ${t.days}`:`0 ${t.days}`}</b></div>
   <div className="holderMetricGrid">
    <div className="holderMetric"><span>{t.addresses100k}</span><b>{holderEnough?`${holder100k.abs>=0?'+':''}${fmt(holder100k.abs)}`:'—'}</b><small className={holder100k?.pct>=0?'up':'down'}>{holderEnough?pct(holder100k.pct):t.insufficient}</small></div>
    <div className="holderMetric"><span>{t.addresses1m}</span><b>{holderEnough?`${holder1m.abs>=0?'+':''}${fmt(holder1m.abs)}`:'—'}</b><small className={holder1m?.pct>=0?'up':'down'}>{holderEnough?pct(holder1m.pct):t.insufficient}</small></div>
    <div className="holderMetric"><span>{t.top100Change}</span><b>{holderEnough&&top100Delta?`${top100Delta.delta>=0?'+':''}${top100Delta.delta.toFixed(2)} ${t.pp}`:'—'}</b><small>{holderEnough&&top100Delta?(top100Delta.delta<0?(lang==='ja'?'分散方向':'Less concentrated'):(lang==='ja'?'集中方向':'More concentrated')):t.insufficient}</small></div>
    <div className="holderMetric"><span>{t.momentum}</span><b>{holderEnough&&momentum?`${momentum.acceleration>=0?'+':''}${fmt(momentum.acceleration)}`:'—'}</b><small>{t.momentumHelp}</small></div>
   </div>
   <div className={`divergenceBox ${holderEnough?'ready':''}`}><div><span>{t.divergenceTitle}</span><b>{divergenceLabel}</b></div><div className="divergenceNums"><span>KAS {holderEnough&&holderPricePct!=null?pct(holderPricePct):'—'}</span><span>100K+ {holderEnough?pct(holder100k.pct):'—'}</span></div></div>
   {!holderEnough&&<div className="holderNeedMore">{t.needMore}</div>}
  </section>
  <section className="card"><div className="sectionTitle">{t.tiers}</div><div className="table head"><span>Tier</span><span>{t.current}</span><span>{t.d7}</span><span>{t.d30}</span></div>{tiers.map(key=>{const c7=nearestChange(allDaily,key,7),c30=nearestChange(allDaily,key,30);return <div className={`table ${key==='100K+'?'hot':''}`} key={key}><span>{key==='1+'?'1 KAS+':key}</span><b>{fmt(holder?.cumulative?.[key])}</b><span className={c7?.abs>=0?'up':'down'}>{c7&&c7.daysObserved>=5?`${c7.abs>=0?'+':''}${fmt(c7.abs)}`:'—'}</span><span className={c30?.abs>=0?'up':'down'}>{c30&&c30.daysObserved>=25?`${c30.abs>=0?'+':''}${fmt(c30.abs)}`:'—'}</span></div>})}</section>
  <section className="card"><div className="chartHead"><b>{t.trend}</b><span>{change30&&change30.daysObserved>=25?pct(change30.pct):'—'}</span></div><LineChart values={h100}/>{allDaily.length<2&&<div className="historyNote">{t.noHistory}</div>}</section>
  <section className="card"><div className="chartHead"><b>{t.daily}</b><span>100K+</span></div><BarChart values={daily}/></section>
  <section className="card"><div className="chartHead"><b>{t.compare}</b><span>{period===365?'1Y':`${period}D`}</span></div><NormalizedCompare holderValues={h100} priceValues={priceSeries} t={t}/></section>
  <section className="card signalCard"><div><div className="eyebrow">{t.signal}</div><strong>{signal}</strong></div><div className="scoreNum">{score??'—'}<small>{score==null?'':'/100'}</small></div></section>
  <footer><div className="footerBrand"><img src="/kaspa-logo.svg" alt="Kaspa"/><div><b>@TechBit</b><span>KASPA ON-CHAIN ANALYTICS</span></div></div><p>{t.foot}</p><p>{t.source}: Kaspatrol / api.kaspa.org · CoinGecko<br/>{t.updated}: {holder?.capturedAt?new Date(holder.capturedAt).toLocaleString(lang==='ja'?'ja-JP':'en-US'):'—'}</p></footer>
</main>
}
