'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import InfiniteFlightCanvas from './InfiniteFlightCanvas';

const nf=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const compact=new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1});
const shortHash=hash=>`${hash.slice(0,7)}…${hash.slice(-5)}`;
const formatKas=value=>`${value>=1_000_000?compact.format(value):nf.format(value)} KAS`;
const blockClass=block=>block.maxTransferKas>=1_000_000?'mega':block.maxTransferKas>=100_000?'large':block.maxTransferKas>=10_000?'medium':block.maxTransferKas>=1_000?'small':'normal';
const blockSignal=block=>({mega:'MEGA WHALE DETECTED',large:'100K+ FLOW DETECTED',medium:'10K+ FLOW DETECTED',small:'1K+ FLOW DETECTED',normal:'NORMAL ACTIVITY'})[blockClass(block)];
const PLAYBACK_DELAY_MS=60_000;
const BUFFER_RETENTION_MS=150_000;
const CANVAS_BLOCK_LIMIT=80;

export default function BlockDAGView(){
 const [data,setData]=useState(null),[buffer,setBuffer]=useState([]),[playbackNow,setPlaybackNow]=useState(()=>Date.now()-PLAYBACK_DELAY_MS),[selected,setSelected]=useState(null),[paused,setPaused]=useState(false),[error,setError]=useState(false),[retryCount,setRetryCount]=useState(0);
 const load=useCallback(async()=>{try{const response=await fetch('/api/blockdag');if(!response.ok)throw new Error(`blockdag ${response.status}`);const payload=await response.json();if(!payload?.ok||!payload.blocks?.length)throw new Error('blockdag unavailable');setData(payload);setBuffer(current=>{const merged=[...new Map([...current,...payload.blocks].map(block=>[block.hash,block])).values()].sort((a,b)=>a.timestamp-b.timestamp||a.daaScore-b.daaScore);const newest=merged.at(-1)?.timestamp??Date.now();return merged.filter(block=>block.timestamp>=newest-BUFFER_RETENTION_MS)});setError(false);setRetryCount(0)}catch{setError(true);setRetryCount(count=>count+1)}},[]);
 useEffect(()=>{void load();const timer=window.setInterval(load,5_000);return()=>window.clearInterval(timer)},[load]);
 useEffect(()=>{if(paused)return;const tick=()=>setPlaybackNow(Date.now()-PLAYBACK_DELAY_MS);tick();const timer=window.setInterval(tick,500);return()=>window.clearInterval(timer)},[paused]);
 const orderedBuffer=useMemo(()=>[...buffer].sort((a,b)=>a.timestamp-b.timestamp||a.daaScore-b.daaScore),[buffer]);
 const newestTimestamp=orderedBuffer.at(-1)?.timestamp??0;
 // A public fallback can trail wall-clock time by more than the intended
 // 60-second delay. Never place the playback cursor ahead of the newest block
 // we actually have, otherwise the initial metric window can be empty.
 const effectivePlaybackNow=newestTimestamp?Math.min(playbackNow,newestTimestamp):playbackNow;
 const broadcastBlocks=useMemo(()=>orderedBuffer.filter(block=>block.timestamp<=effectivePlaybackNow),[orderedBuffer,effectivePlaybackNow]);
 const metricBlocks=useMemo(()=>{
  const delayedWindow=broadcastBlocks.filter(block=>block.timestamp>effectivePlaybackNow-PLAYBACK_DELAY_MS);
  if(delayedWindow.length)return delayedWindow;
  // On the first response the 60-second delayed window can fall between the
  // timestamps supplied by the upstream snapshot. Show the latest available
  // 60-second slice instead of leaving every headline metric empty.
  const available=broadcastBlocks.length?broadcastBlocks:orderedBuffer;
  const anchor=available.at(-1)?.timestamp??0;
  return anchor?available.filter(block=>block.timestamp>anchor-PLAYBACK_DELAY_MS):[];
 },[broadcastBlocks,effectivePlaybackNow,orderedBuffer]);
 const canvasBlocks=useMemo(()=>broadcastBlocks.slice(-CANVAS_BLOCK_LIMIT),[broadcastBlocks]);
 const bufferAheadSeconds=newestTimestamp?Math.max(0,Math.round((newestTimestamp-effectivePlaybackNow)/1000)):0;
 useEffect(()=>{if(!canvasBlocks.length)return;setSelected(current=>canvasBlocks.find(block=>block.hash===current?.hash)??canvasBlocks.at(-1)??null)},[canvasBlocks]);
 const summary=useMemo(()=>{const blocks=metricBlocks;return {txs:blocks.reduce((sum,block)=>sum+block.txCount,0),volume:blocks.reduce((sum,block)=>sum+block.volumeKas,0),small:blocks.filter(block=>block.maxTransferKas>=1_000).length,medium:blocks.filter(block=>block.maxTransferKas>=10_000).length,large:blocks.filter(block=>block.maxTransferKas>=100_000).length,mega:blocks.filter(block=>block.maxTransferKas>=1_000_000).length}},[metricBlocks]);
 const visibleTransfers=(selected?.transactions??[]).filter(tx=>tx.valueKas>=1_000).sort((a,b)=>b.valueKas-a.valueKas);
 const lastUpdate=data?.fetchedAt?new Date(data.fetchedAt).toLocaleTimeString('ja-JP',{hour12:false}):'—';

 return <main className="dagApp">
  <header className="dagTopbar">
   <a className="dagBack" href="/">← Holder Monitor</a>
   <div className="dagBrand"><img src="/kaspa-logo.svg" alt="Kaspa"/><div><b>KASPA</b><span>LIVE BLOCKDAG</span></div></div>
   <button className="dagPause" type="button" onClick={()=>setPaused(value=>!value)}>{paused?'▶ 再開':'Ⅱ 一時停止'}</button>
  </header>
  <section className="dagMetrics" aria-label="直近ブロックの集計">
   <div><span>解析ブロック</span><b>{metricBlocks.length||'—'}</b><small>60s BROADCAST</small></div>
   <div><span>取引件数</span><b>{nf.format(summary.txs)}</b><small>UNIQUE TX</small></div>
   <div><span>総Output量</span><b>{formatKas(summary.volume)}</b><small>VISIBLE OUTPUTS</small></div>
   <div className="small"><span>1K+ブロック</span><b>{summary.small}</b><small>1K+ FLOW</small></div>
   <div className="medium"><span>10K+ブロック</span><b>{summary.medium}</b><small>10K+ FLOW</small></div>
   <div className="large"><span>100K+ブロック</span><b>{summary.large}</b><small>LARGE FLOW</small></div>
   <div className="mega"><span>1M+ブロック</span><b>{summary.mega}</b><small>MEGA WHALE</small></div>
  </section>
  <section className="dagWorkspace">
   <div className="dagPanel">
    <div className="dagPanelHead"><div><span>BUFFERED LIVE · INFINITE FLIGHT v2.4.2</span><h1>Live BlockDAG</h1></div><div className="dagLegend"><span><i className="normal"/>通常</span><span><i className="small"/>1K+</span><span><i className="medium"/>10K+</span><span><i className="large"/>100K+</span><span><i className="mega"/>1M+</span></div></div>
    <div className="dagCanvasWrap">{canvasBlocks.length?<InfiniteFlightCanvas blocks={canvasBlocks} selected={selected?.hash} paused={paused} onSelect={setSelected}/>:<div className="dagLoading">{error?`データ取得待機中 · 再試行 ${retryCount}回`:'120秒バッファを準備中'}</div>}<span className="dagAxis left">FLIGHT PATH</span><span className="dagAxis right">LIVE −60s</span></div>
    <div className="dagPanelFoot"><span>120秒先読み・60秒遅延配信</span><span>CDN共有データ・BUFFER {bufferAheadSeconds}s</span><span>最終取得 {lastUpdate}</span></div>
   </div>
   <aside className="dagInspector">
    <div className="dagInspectorTitle"><span>BLOCK INSPECTOR</span><b>{selected?shortHash(selected.hash):'ブロックを選択'}</b></div>
    {selected?<>
     <div className={`dagSignal ${blockClass(selected)}`}><span>{blockSignal(selected)}</span><strong>{formatKas(selected.maxTransferKas)}</strong><small>最大Output</small></div>
     <dl className="dagDetailGrid"><div><dt>DAA Score</dt><dd>{nf.format(selected.daaScore)}</dd></div><div><dt>Timestamp</dt><dd>{new Date(selected.timestamp).toLocaleTimeString('ja-JP',{hour12:false})}</dd></div><div><dt>Transactions</dt><dd>{selected.txCount}</dd></div><div><dt>Total outputs</dt><dd>{formatKas(selected.volumeKas)}</dd></div></dl>
     <div className="dagHash"><span>BLOCK HASH</span><code>{selected.hash}</code></div>
     <div className="dagTxHead"><span>1K+ Output</span><b>{visibleTransfers.length}</b></div>
     <div className="dagTxList">{visibleTransfers.map(tx=><a key={tx.id} href={`https://explorer.kaspa.org/txs/${tx.id}`} target="_blank" rel="noreferrer" className={blockClass({...selected,maxTransferKas:tx.valueKas})}><span>{shortHash(tx.id)}</span><strong>{formatKas(tx.valueKas)}</strong><em>↗</em></a>)}{!visibleTransfers.length&&<p>1K KAS以上のOutputはありません</p>}</div>
    </>:<p className="dagEmpty">DAG上のブロックを選択してください。</p>}
   </aside>
  </section>
  <footer className="dagFooter"><span>Outputベースの暫定集計です。所有者や取引所内売買は断定できません。</span><b>by TechBit</b></footer>
 </main>
}
