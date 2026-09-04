'use client';
import { useEffect, useMemo, useState } from 'react';

const T={
 ja:{tag:'データで見る、KASPAの未来。',live:'LIVE ON-CHAIN',price:'KAS価格',addresses:'総アドレス数',supply:'流通供給量',whales:'クジラ集中度',holderScore:'Holder Trend Score',scoreHelp:'保有層の増減・クジラ集中度・価格との乖離から、KASの蓄積傾向を0〜100で示す独自指標です。30日以上の履歴がない場合は算出しません。',tiers:'保有量別アドレス数',current:'現在',d7:'7日変化',d30:'30日変化',trend:'100K+ アドレス数の推移',daily:'100K+ 日次変化量',compare:'価格 vs 100K+ アドレス',signal:'マーケットシグナル',noHistory:'履歴DBを接続すると、7D・30D・90Dの実変化とHolder Trend Scoreを自動計算します。',acc:'ACCUMULATION',neutral:'NEUTRAL',dist:'DISTRIBUTION',foot:'アドレス数＝保有者数ではありません。1ウォレットが複数アドレスを利用する場合があります。クジラ集中度には取引所等のアドレスが含まれる可能性があります。',source:'データソース',updated:'更新',home:'ホーム',charts:'チャート',holders:'ホルダー',alerts:'アラート',more:'その他',top10:'Top 10',top100:'Top 100',top1000:'Top 1000',whaleHelp:'上位アドレスが流通KASの何％を保有しているかを示します。数値が高いほど保有が一部アドレスへ集中しています。',insufficient:'履歴不足',priceLive:'CoinGecko 実価格履歴'},
 en:{tag:'See the on-chain story. Build a bigger KASPA.',live:'LIVE ON-CHAIN',price:'KAS Price',addresses:'Total Addresses',supply:'Circulating Supply',whales:'Whale Concentration',holderScore:'Holder Trend Score',scoreHelp:'A proprietary 0–100 indicator combining holding-tier changes, whale concentration and price/holder divergence. It is not calculated until enough 30-day history exists.',tiers:'Addresses by Holding Tier',current:'Current',d7:'7D change',d30:'30D change',trend:'100K+ Address Trend',daily:'100K+ Daily Change',compare:'Price vs 100K+ Addresses',signal:'Market Signal',noHistory:'Connect the history database to calculate real 7D/30D/90D changes and the Holder Trend Score.',acc:'ACCUMULATION',neutral:'NEUTRAL',dist:'DISTRIBUTION',foot:'Address count is not holder count. One wallet may use multiple addresses. Whale concentration may include exchange or service addresses.',source:'Data source',updated:'Updated',home:'Home',charts:'Charts',holders:'Holders',alerts:'Alerts',more:'More',top10:'Top 10',top100:'Top 100',top1000:'Top 1000',whaleHelp:'Shows how much of circulating KAS is held by the largest addresses. Higher values indicate greater concentration.',insufficient:'Not enough history',priceLive:'Live CoinGecko history'}
};
const tiers=['1+','100+','1K+','10K+','100K+','1M+','10M+','100M+'];
function fmt(n){if(n==null)return '—'; return Number(n).toLocaleString()}
function pct(n){if(n==null)return '—';return `${n>=0?'+':''}${n.toFixed(2)}%`}
function nearestChange(rows,key,days){if(!rows?.length)return null;const now=rows.at(-1),target=Date.now()-days*86400000;let prev=rows[0];for(const r of rows){if(Math.abs(new Date(r.captured_at)-target)<Math.abs(new Date(prev.captured_at)-target))prev=r}const a=mapRow(now,key),b=mapRow(prev,key);if(a==null||!b)return null;return {abs:a-b,pct:(a-b)/b*100,daysObserved:(new Date(now.captured_at)-new Date(prev.captured_at))/86400000}}
function mapRow(r,key){return ({'1+':r.total_1_plus,'1K+':r.a_1k_plus,'10K+':r.a_10k_plus,'100K+':r.a_100k_plus,'1M+':r.a_1m_plus,'10M+':r.a_10m_plus,'100M+':r.a_100m_plus}[key]??null)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

function MarketChart({prices,volumes,lang}){
 const [hover,setHover]=useState(null); const W=430,H=205,PL=9,PR=50,PT=10,PB=28,VH=38;
 if(!prices?.length) return <div className="emptyChart marketEmpty">NO PRICE HISTORY</div>;
 const vals=prices.map(x=>x.value), min=Math.min(...vals), max=Math.max(...vals), pad=(max-min)*.08||.001, lo=min-pad, hi=max+pad;
 const x=i=>PL+i*(W-PL-PR)/(prices.length-1), y=v=>PT+(hi-v)*(H-PB-VH-PT)/(hi-lo);
 const path=prices.map((p,i)=>`${i?'L':'M'}${x(i)},${y(p.value)}`).join(' ');
 const area=`${path} L${x(prices.length-1)},${H-PB-VH} L${x(0)},${H-PB-VH} Z`;
 const volVals=(volumes||[]).map(v=>v.value), vmax=Math.max(...volVals,1);
 const idx=hover==null?prices.length-1:hover, hp=prices[idx], hx=x(idx), hy=y(hp.value);
 const labels=[hi,(hi+lo)/2,lo];
 const onMove=e=>{const r=e.currentTarget.getBoundingClientRect();const px=((e.touches?.[0]?.clientX??e.clientX)-r.left)/r.width*W;setHover(clamp(Math.round((px-PL)/(W-PL-PR)*(prices.length-1)),0,prices.length-1))};
 const dateFmt=new Intl.DateTimeFormat(lang==='ja'?'ja-JP':'en-US',{month:'short',day:'numeric'});
 return <div className="marketWrap"><svg className="marketChart" viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={()=>setHover(null)} onTouchMove={onMove}>
   <defs><linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#49eac1" stopOpacity=".32"/><stop offset="1" stopColor="#49eac1" stopOpacity="0"/></linearGradient></defs>
   {[0,.5,1].map((q,i)=>{const yy=PT+q*(H-PB-VH-PT);return <line key={i} x1={PL} y1={yy} x2={W-PR} y2={yy} className="mgrid"/>})}
   {(volumes||[]).slice(0,prices.length).map((v,i)=>{const bh=(v.value/vmax)*(VH-5);return <rect key={i} x={x(i)-.7} y={H-PB-bh} width="1.5" height={bh} className="volbar"/>})}
   <path d={area} fill="url(#priceArea)"/><path d={path} fill="none" stroke="#49eac1" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"/>
   {labels.map((v,i)=><text key={i} x={W-PR+5} y={PT+i*(H-PB-VH-PT)/2+4} className="axisText">${v.toFixed(v<.1?4:3)}</text>)}
   {[0,Math.floor((prices.length-1)/2),prices.length-1].map((i,k)=><text key={k} x={x(i)} y={H-7} textAnchor={k===0?'start':k===2?'end':'middle'} className="axisText">{dateFmt.format(new Date(prices[i].ts))}</text>)}
   <line x1={hx} y1={PT} x2={hx} y2={H-PB} className="cross"/><circle cx={hx} cy={hy} r="4" fill="#49eac1" stroke="#05211c" strokeWidth="2"/>
   <rect x={W-PR+1} y={hy-10} width={PR-3} height="20" rx="4" className="priceTag"/><text x={W-PR+5} y={hy+4} className="priceTagText">${hp.value.toFixed(hp.value<.1?5:3)}</text>
 </svg><div className="marketTooltip"><b>${hp.value.toFixed(hp.value<.1?5:3)}</b><span>{new Date(hp.ts).toLocaleString(lang==='ja'?'ja-JP':'en-US')}</span></div></div>
}

function LineChart({values,second}){const W=420,H=130,p=8;const all=[...values,...(second||[])].filter(v=>Number.isFinite(v));if(all.length<2)return <div className="emptyChart">NO HISTORY YET</div>; const min=Math.min(...all),max=Math.max(...all),range=max-min||1;const path=d=>d.map((v,i)=>`${i?'L':'M'}${p+i*(W-2*p)/(d.length-1)},${H-p-(v-min)*(H-2*p)/range}`).join(' ');return <svg className="chart" viewBox={`0 0 ${W} ${H}`}><g className="gridLines"><line x1="0" y1="32" x2={W} y2="32"/><line x1="0" y1="65" x2={W} y2="65"/><line x1="0" y1="98" x2={W} y2="98"/></g><path d={path(values)} fill="none" stroke="#49eac1" strokeWidth="3" strokeLinecap="round"/>{second&&<path d={path(second)} fill="none" stroke="#fff" strokeWidth="2.2" strokeOpacity=".8"/>}</svg>}
function BarChart({values}){if(values.length<2)return <div className="emptyChart">NO HISTORY YET</div>;const W=420,H=120,mid=60,max=Math.max(...values.map(v=>Math.abs(v)),1);return <svg className="chart" viewBox={`0 0 ${W} ${H}`}><line x1="0" y1={mid} x2={W} y2={mid} stroke="#ffffff22"/>{values.map((v,i)=>{const bw=W/values.length*.55,h=Math.abs(v)/max*52,x=i*W/values.length+(W/values.length-bw)/2,y=v>=0?mid-h:mid;return <rect key={i} x={x} y={y} width={bw} height={h} rx="1.5" fill={v>=0?'#49eac1':'#ff6b6b'}/>})}</svg>}

export default function Dashboard(){
 const [lang,setLang]=useState('ja'),[holder,setHolder]=useState(null),[price,setPrice]=useState(null),[priceHistory,setPriceHistory]=useState({prices:[],volumes:[]}),[history,setHistory]=useState({enabled:false,rows:[]}),[period,setPeriod]=useState(30),[scoreOpen,setScoreOpen]=useState(false);
 const t=T[lang];
 useEffect(()=>{const l=localStorage.getItem('khm-lang')||(navigator.language.startsWith('ja')?'ja':'en');setLang(l);if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});Promise.all([fetch('/api/holders').then(r=>r.json()),fetch('/api/price').then(r=>r.json()),fetch('/api/history?days=400').then(r=>r.json())]).then(([h,p,his])=>{setHolder(h);setPrice(p);setHistory(his)});},[]);
 useEffect(()=>{fetch(`/api/price/history?days=${period}`).then(r=>r.json()).then(setPriceHistory).catch(()=>setPriceHistory({prices:[],volumes:[]}));},[period]);
 const rows=useMemo(()=>history.rows?.slice(-period)||[],[history,period]);
 const h100=rows.map(r=>r.a_100k_plus).filter(Number.isFinite); const priceSeries=rows.map(r=>r.kas_price_usd).filter(Number.isFinite); const daily=h100.slice(1).map((v,i)=>v-h100[i]);
 const changes30=['1K+','10K+','100K+','1M+'].map(k=>nearestChange(history.rows,k,30));
 const concentrationChange=history.rows?.length>1&&history.rows.at(-1).top100_share!=null?history.rows.at(-1).top100_share-history.rows[0].top100_share:null;
 const livePrice30=priceHistory.prices?.length>1?(priceHistory.prices.at(-1).value/priceHistory.prices[0].value-1)*100:null;
 const enoughHistory=changes30.every(c=>c&&c.daysObserved>=25);
 const score=useMemo(()=>{
   if(!enoughHistory)return null;
   const breadth=changes30.reduce((s,c)=>s+clamp(c.pct,-10,10),0)/4;
   const whale=((changes30[2]?.pct||0)+(changes30[3]?.pct||0))/2;
   const conc=concentrationChange==null?0:-concentrationChange;
   const divergence=(livePrice30!=null&&livePrice30<0&&breadth>0)?1:(livePrice30!=null&&livePrice30>0&&breadth<0)?-1:0;
   const raw=50 + breadth*2.2 + whale*1.1 + conc*4 + divergence*8;
   return Math.round(clamp(raw,0,100));
 },[enoughHistory,changes30,concentrationChange,livePrice30]);
 const signal=score==null?t.insufficient:score>=65?t.acc:score<=35?t.dist:t.neutral;
 const change7=nearestChange(history.rows,'100K+',7),change30=nearestChange(history.rows,'100K+',30);
 const toggleLang=()=>{const n=lang==='ja'?'en':'ja';setLang(n);localStorage.setItem('khm-lang',n)};
 const concentration=holder?.concentration||{};
 return <main className="shell">
   <header className="topbar"><div className="brandBlock"><img src="/kaspa-logo.svg" className="kaspaMark"/><div><div className="kaspaWord">KASPA</div><div className="monitorWord">HOLDER MONITOR</div></div></div><button className="techbit"><span>by</span> @TechBit</button><button className="lang" onClick={toggleLang}>{lang==='ja'?'EN':'JA'}</button></header>
   <section className="hero"><div className="live"><i/> {t.live}</div><h1>{t.tag}</h1><p>Small Steps. A Bigger KASPA.</p></section>
   <section className="card priceCard"><div className="row"><div><div className="eyebrow">{t.price} (USD)</div><div className="price">{price?.usd?`$${price.usd.toFixed(price.usd<.1?5:3)}`:'—'}</div><div className={price?.change24h>=0?'up':'down'}>{price?.change24h!=null?pct(price.change24h):'—'} <span>24h</span></div></div><div className="periods">{[1,7,30,90,365].map(x=><button key={x} className={period===x?'active':''} onClick={()=>setPeriod(x)}>{x===365?'1Y':`${x}D`}</button>)}</div></div><MarketChart prices={priceHistory.prices} volumes={priceHistory.volumes} lang={lang}/><div className="priceSource">● {t.priceLive}</div></section>
   <div className="statsGrid"><section className="card stat"><div className="eyebrow">{t.addresses} (1+ KAS)</div><b>{fmt(holder?.total1Plus)}</b><small>{holder?.fallback?'Fallback snapshot':'Network-wide'}</small></section><section className="card stat score"><div className="eyebrow scoreTitle">{t.holderScore}<button onClick={()=>setScoreOpen(v=>!v)}>?</button></div>{score==null?<div className="scoreMissing">—<small>{t.insufficient}</small></div>:<><div className="gauge" style={{'--score':`${score*3.6}deg`}}><b>{score}</b></div><small className="signalPill">{signal}</small></>}{scoreOpen&&<div className="scoreExplain">{t.scoreHelp}</div>}</section></div>
   <div className="statsGrid"><section className="card stat"><div className="eyebrow">{t.supply}</div><b>{holder?.circulating?`${(holder.circulating/1e9).toFixed(2)} B KAS`:'—'}</b><div className="supplyBar"><i style={{width:'77%'}}/></div></section><section className="card stat whaleCard"><div className="eyebrow">{t.whales}</div>{[[t.top10,concentration.top10],[t.top100,concentration.top100],[t.top1000,concentration.top1000]].map(([label,val])=><div className="whaleMeter" key={label}><div><span>{label}</span><b>{val??'—'}%</b></div><div className="meterTrack"><i style={{width:`${val||0}%`}}/></div></div>)}<p className="whaleHelp">{t.whaleHelp}</p></section></div>
   <section className="card"><div className="sectionTitle">{t.tiers}</div><div className="table head"><span>Tier</span><span>{t.current}</span><span>{t.d7}</span><span>{t.d30}</span></div>{tiers.map(key=>{const c7=nearestChange(history.rows,key,7),c30=nearestChange(history.rows,key,30);return <div className={`table ${key==='100K+'?'hot':''}`} key={key}><span>{key}</span><b>{fmt(holder?.cumulative?.[key])}</b><span className={c7?.abs>=0?'up':'down'}>{c7?`${c7.abs>=0?'+':''}${fmt(c7.abs)}`:'—'}</span><span className={c30?.abs>=0?'up':'down'}>{c30?`${c30.abs>=0?'+':''}${fmt(c30.abs)}`:'—'}</span></div>})}</section>
   <section className="card"><div className="chartHead"><b>{t.trend}</b><span>{change30?pct(change30.pct):'—'}</span></div><LineChart values={h100}/>{!history.enabled&&<div className="historyNote">{t.noHistory}</div>}</section>
   <section className="card"><div className="chartHead"><b>{t.daily}</b><span>100K+</span></div><BarChart values={daily}/></section>
   <section className="card"><div className="chartHead"><b>{t.compare}</b><span>{period===365?'1Y':`${period}D`}</span></div><LineChart values={h100} second={priceSeries}/></section>
   <section className="card signalCard"><div><div className="eyebrow">{t.signal}</div><strong>{signal}</strong></div><div className="scoreNum">{score??'—'}<small>{score==null?'':'/100'}</small></div></section>
   <footer><div className="footerBrand"><img src="/kaspa-logo.svg"/><div><b>@TechBit</b><span>Build a brighter future with KASPA</span></div></div><p>{t.foot}</p><p>{t.source}: Kaspatrol / api.kaspa.org · CoinGecko<br/>{t.updated}: {holder?.capturedAt?new Date(holder.capturedAt).toLocaleString(lang==='ja'?'ja-JP':'en-US'):'—'}</p></footer>
   <nav><button className="active">⌂<span>{t.home}</span></button><button>▥<span>{t.charts}</span></button><button>♟<span>{t.holders}</span></button><button>♢<span>{t.alerts}</span></button><button>•••<span>{t.more}</span></button></nav>
 </main>
}
