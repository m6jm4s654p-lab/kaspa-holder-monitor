'use client';
import { useEffect, useMemo, useState } from 'react';

const T={
 ja:{tag:'データで見る、KASPAの未来。',live:'LIVE ON-CHAIN',price:'KAS価格',addresses:'残高保有アドレス総数',supply:'流通供給量',whales:'クジラ集中度',holderScore:'Holder Trend Score',scoreHelp:'@TechBit独自のオンチェーン指標です。1K+〜1M+の保有層の増減、大口層の増減、Top100集中度の変化、価格とHolderのダイバージェンスを組み合わせて0〜100で評価します。Kaspa公式指標や売買シグナルではありません。',tiers:'保有量別アドレス数',current:'現在',d7:'7日変化',d30:'30日変化',trend:'100K+ アドレス数の推移',daily:'100K+ 日次変化量',compare:'価格 vs 100K+ アドレス',signal:'マーケットシグナル',noHistory:'日次履歴を蓄積すると、7D・30D・90Dの変化とHolder Trend Scoreを自動計算します。',acc:'ACCUMULATION',neutral:'NEUTRAL',dist:'DISTRIBUTION',foot:'アドレス数＝保有者数ではありません。1ウォレットが複数アドレスを利用する場合があります。クジラ集中度には取引所・サービス用アドレスが含まれる可能性があります。',source:'データソース',updated:'更新',home:'ホーム',charts:'チャート',holders:'ホルダー',alerts:'アラート',more:'その他',top10:'Top 10',top100:'Top 100',top1000:'Top 1000',whaleHelp:'Top10 / Top100 / Top1000 は累積値です。下の帯は重複しない保有層に分解し、供給量がどこに集中しているかを示します。',insufficient:'履歴不足',priceLive:'CoinGecko 実市場データ',ohlc:'OHLC ローソク足',open:'始値',close:'終値',dataUnavailable:'価格データを取得できません',realData:'実データのみ表示',periodChange:'期間騰落率',high:'高値',low:'安値',volume:'直近出来高',scoreBreakdown:'スコア内訳',breadth:'保有層の広がり',large:'大口層トレンド',concentration:'集中度改善',divergence:'価格との乖離',scoreNote:'30日程度の履歴が揃うまでスコアは表示しません。',other:'その他',top11_100:'11–100位',top101_1000:'101–1000位',normalized:'期間開始=0%で正規化',priceLegend:'KAS価格',holderLegend:'100K+アドレス',holderAnalysis:'Holder分析',holderPeriod:'分析期間',addresses100k:'100K+アドレス',addresses1m:'1M+アドレス',top100Change:'Top100集中度',momentum:'Holder Momentum',momentumHelp:'選択期間の100K+アドレス増減を、期間前半と後半で比較した変化速度です。',divergenceTitle:'価格とのダイバージェンス',divAcc:'価格下落・Holder増加',divDist:'価格上昇・Holder減少',divConfirm:'価格とHolderが同方向',historyCoverage:'履歴カバレッジ',days:'日',observed:'観測',needMore:'この期間を評価するには履歴が不足しています。',realHistory:'Supabase実履歴のみ',pp:'pt',minAddressBalance:'残高 0.0001 KAS以上',networkWide:'ネットワーク全体',oneKasPlus:'1 KAS以上'},
 en:{tag:'See the on-chain story. Build a bigger KASPA.',live:'LIVE ON-CHAIN',price:'KAS Price',addresses:'Total Balance-Holding Addresses',supply:'Circulating Supply',whales:'Whale Concentration',holderScore:'Holder Trend Score',scoreHelp:'A proprietary @TechBit on-chain indicator. It combines changes across 1K+ to 1M+ address tiers, large-holder trends, Top-100 concentration changes, and price/holder divergence into a 0–100 score. It is not an official Kaspa metric or a trading signal.',tiers:'Addresses by Holding Tier',current:'Current',d7:'7D change',d30:'30D change',trend:'100K+ Address Trend',daily:'100K+ Daily Change',compare:'Price vs 100K+ Addresses',signal:'Market Signal',noHistory:'As daily history accumulates, the app will calculate real 7D/30D/90D changes and the Holder Trend Score.',acc:'ACCUMULATION',neutral:'NEUTRAL',dist:'DISTRIBUTION',foot:'Address count is not holder count. One wallet may use multiple addresses. Whale concentration may include exchange or service addresses.',source:'Data source',updated:'Updated',home:'Home',charts:'Charts',holders:'Holders',alerts:'Alerts',more:'More',top10:'Top 10',top100:'Top 100',top1000:'Top 1000',whaleHelp:'Top 10 / Top 100 / Top 1000 are cumulative. The strip below decomposes them into non-overlapping groups so concentration is easier to read.',insufficient:'Not enough history',priceLive:'Live CoinGecko market data',ohlc:'OHLC candlesticks',open:'Open',close:'Close',dataUnavailable:'Price data unavailable',realData:'Real data only',periodChange:'Period change',high:'High',low:'Low',volume:'Latest volume',scoreBreakdown:'Score breakdown',breadth:'Holder breadth',large:'Large-holder trend',concentration:'Concentration improvement',divergence:'Price divergence',scoreNote:'The score stays hidden until roughly 30 days of history is available.',other:'Other',top11_100:'Ranks 11–100',top101_1000:'Ranks 101–1000',normalized:'Normalized to 0% at period start',priceLegend:'KAS price',holderLegend:'100K+ addresses',holderAnalysis:'Holder analysis',holderPeriod:'Analysis period',addresses100k:'100K+ addresses',addresses1m:'1M+ addresses',top100Change:'Top-100 concentration',momentum:'Holder Momentum',momentumHelp:'Change acceleration in 100K+ addresses, comparing the first and second halves of the selected period.',divergenceTitle:'Price divergence',divAcc:'Price down / holders up',divDist:'Price up / holders down',divConfirm:'Price and holders aligned',historyCoverage:'History coverage',days:'days',observed:'observed',needMore:'Not enough history to evaluate this period.',realHistory:'Supabase real history only',pp:'pt',minAddressBalance:'Balance ≥ 0.0001 KAS',networkWide:'Network-wide',oneKasPlus:'≥ 1 KAS'},
 ko:{tag:'데이터로 보는 KASPA의 미래.',live:'실시간 온체인',price:'KAS 가격',addresses:'잔액 보유 주소 총수',supply:'유통 공급량',whales:'상위 100개 주소 보유 비율',holderScore:'홀더 추세 점수',scoreHelp:'@TechBit의 독자적인 온체인 지표입니다. 1K+~1M+ 주소 계층의 변화, 대형 보유자 추세, 상위 100개 주소 집중도 변화, 가격과 홀더의 다이버전스를 결합해 0~100으로 평가합니다. Kaspa 공식 지표나 매매 신호가 아닙니다.',tiers:'보유량별 주소 수',current:'현재',d7:'7일 변화',d30:'30일 변화',trend:'100K+ 주소 추이',daily:'100K+ 일일 변화',compare:'가격 vs 100K+ 주소',signal:'시장 신호',noHistory:'일별 기록이 쌓이면 실제 7D/30D/90D 변화와 홀더 추세 점수를 자동 계산합니다.',acc:'축적',neutral:'중립',dist:'분산',foot:'주소 수는 보유자 수와 같지 않습니다. 하나의 지갑이 여러 주소를 사용할 수 있습니다. 상위 100개 주소 비율에는 거래소·서비스 주소가 포함될 수 있습니다.',source:'데이터 출처',updated:'업데이트',home:'홈',charts:'차트',holders:'홀더',alerts:'알림',more:'기타',top10:'상위 10',top100:'상위 100',top1000:'상위 1000',whaleHelp:'상위 10/100/1000은 누적값입니다. 아래 막대는 중복 없는 보유 계층으로 나눠 공급 집중도를 보여줍니다.',insufficient:'기록 부족',priceLive:'CoinGecko 실시간 시장 데이터',ohlc:'OHLC 캔들',open:'시가',close:'종가',dataUnavailable:'가격 데이터를 불러올 수 없습니다',realData:'실제 데이터만 표시',periodChange:'기간 등락률',high:'고가',low:'저가',volume:'최근 거래량',scoreBreakdown:'점수 구성',breadth:'보유층 확대',large:'대형 보유자 추세',concentration:'집중도 개선',divergence:'가격 다이버전스',scoreNote:'약 30일의 기록이 쌓일 때까지 점수를 표시하지 않습니다.',other:'기타',top11_100:'11~100위',top101_1000:'101~1000위',normalized:'기간 시작=0%로 정규화',priceLegend:'KAS 가격',holderLegend:'100K+ 주소',holderAnalysis:'홀더 분석',holderPeriod:'분석 기간',addresses100k:'100K+ 주소',addresses1m:'1M+ 주소',top100Change:'상위 100개 주소 비율 변화',momentum:'홀더 모멘텀',momentumHelp:'선택 기간의 전반과 후반을 비교한 100K+ 주소 변화 속도입니다.',divergenceTitle:'가격 다이버전스',divAcc:'가격 하락 / 홀더 증가',divDist:'가격 상승 / 홀더 감소',divConfirm:'가격과 홀더가 같은 방향',historyCoverage:'기록 범위',days:'일',observed:'관측',needMore:'이 기간을 평가하기에는 기록이 부족합니다.',realHistory:'Supabase 실제 기록만 사용',pp:'%p',minAddressBalance:'잔액 0.0001 KAS 이상',networkWide:'네트워크 전체',oneKasPlus:'1 KAS 이상'},
 zh:{tag:'用数据洞察 KASPA 的未来。',live:'实时链上数据',price:'KAS 价格',addresses:'持有余额的地址总数',supply:'流通供应量',whales:'前100地址持有占比',holderScore:'持币趋势评分',scoreHelp:'@TechBit 独家链上指标。综合1K+至1M+地址层级变化、大额持币者趋势、前100地址集中度变化及价格与持币者背离，给出0至100分。并非Kaspa官方指标或交易信号。',tiers:'按持币量划分的地址数',current:'当前',d7:'7日变化',d30:'30日变化',trend:'100K+ 地址趋势',daily:'100K+ 每日变化',compare:'价格 vs 100K+ 地址',signal:'市场信号',noHistory:'随着每日历史数据积累，将自动计算真实的7D/30D/90D变化及持币趋势评分。',acc:'增持',neutral:'中性',dist:'减持',foot:'地址数不等于持币人数。一个钱包可能使用多个地址。前100地址持有占比可能包含交易所或服务地址。',source:'数据来源',updated:'更新时间',home:'首页',charts:'图表',holders:'持币者',alerts:'提醒',more:'其他',top10:'前10',top100:'前100',top1000:'前1000',whaleHelp:'前10/100/1000均为累计值。下方条带拆分为互不重叠的持币层级，以便查看供应集中度。',insufficient:'历史数据不足',priceLive:'CoinGecko 实时市场数据',ohlc:'OHLC K线',open:'开盘',close:'收盘',dataUnavailable:'无法获取价格数据',realData:'仅显示真实数据',periodChange:'区间涨跌幅',high:'最高',low:'最低',volume:'最新成交量',scoreBreakdown:'评分明细',breadth:'持币层扩展',large:'大额持币者趋势',concentration:'集中度改善',divergence:'价格背离',scoreNote:'在积累约30天历史数据前不会显示评分。',other:'其他',top11_100:'第11–100位',top101_1000:'第101–1000位',normalized:'以区间起点=0%标准化',priceLegend:'KAS价格',holderLegend:'100K+地址',holderAnalysis:'持币者分析',holderPeriod:'分析周期',addresses100k:'100K+地址',addresses1m:'1M+地址',top100Change:'前100地址持有占比变化',momentum:'持币者动量',momentumHelp:'比较所选周期前半段和后半段的100K+地址变化速度。',divergenceTitle:'价格背离',divAcc:'价格下跌 / 地址增加',divDist:'价格上涨 / 地址减少',divConfirm:'价格与地址同向',historyCoverage:'历史覆盖',days:'天',observed:'已观测',needMore:'历史数据不足，无法评估该周期。',realHistory:'仅使用Supabase真实历史',pp:'个百分点',minAddressBalance:'余额 ≥ 0.0001 KAS',networkWide:'全网络',oneKasPlus:'≥ 1 KAS'},
 es:{tag:'Descubre el futuro de KASPA con datos.',live:'ON-CHAIN EN VIVO',price:'Precio de KAS',addresses:'Total de direcciones con saldo',supply:'Suministro circulante',whales:'Participación de las 100 principales direcciones',holderScore:'Puntuación de tendencia Holder',scoreHelp:'Indicador on-chain propio de @TechBit. Combina cambios entre los niveles 1K+ y 1M+, tendencias de grandes holders, variación de concentración del Top 100 y divergencia entre precio y holders en una puntuación de 0 a 100. No es una métrica oficial de Kaspa ni una señal de trading.',tiers:'Direcciones por nivel de saldo',current:'Actual',d7:'Cambio 7D',d30:'Cambio 30D',trend:'Tendencia de direcciones 100K+',daily:'Cambio diario 100K+',compare:'Precio vs direcciones 100K+',signal:'Señal de mercado',noHistory:'Al acumularse el historial diario, se calcularán los cambios reales de 7D/30D/90D y la puntuación de tendencia.',acc:'ACUMULACIÓN',neutral:'NEUTRAL',dist:'DISTRIBUCIÓN',foot:'El número de direcciones no equivale al de holders. Una cartera puede usar varias direcciones. El Top 100 puede incluir direcciones de exchanges o servicios.',source:'Fuente de datos',updated:'Actualizado',home:'Inicio',charts:'Gráficos',holders:'Holders',alerts:'Alertas',more:'Más',top10:'Top 10',top100:'Top 100',top1000:'Top 1000',whaleHelp:'Top 10 / Top 100 / Top 1000 son valores acumulados. La franja inferior los separa en grupos sin solapamiento para mostrar la concentración.',insufficient:'Historial insuficiente',priceLive:'Datos de mercado en vivo de CoinGecko',ohlc:'Velas OHLC',open:'Apertura',close:'Cierre',dataUnavailable:'Datos de precio no disponibles',realData:'Solo datos reales',periodChange:'Cambio del periodo',high:'Máximo',low:'Mínimo',volume:'Volumen reciente',scoreBreakdown:'Desglose de puntuación',breadth:'Amplitud de holders',large:'Tendencia de grandes holders',concentration:'Mejora de concentración',divergence:'Divergencia de precio',scoreNote:'La puntuación permanece oculta hasta disponer de unos 30 días de historial.',other:'Otros',top11_100:'Puestos 11–100',top101_1000:'Puestos 101–1000',normalized:'Normalizado a 0% al inicio del periodo',priceLegend:'Precio KAS',holderLegend:'Direcciones 100K+',holderAnalysis:'Análisis de holders',holderPeriod:'Periodo de análisis',addresses100k:'Direcciones 100K+',addresses1m:'Direcciones 1M+',top100Change:'Cambio de participación del Top 100',momentum:'Momentum de holders',momentumHelp:'Aceleración del cambio en direcciones 100K+, comparando la primera y segunda mitad del periodo.',divergenceTitle:'Divergencia de precio',divAcc:'Precio baja / holders suben',divDist:'Precio sube / holders bajan',divConfirm:'Precio y holders alineados',historyCoverage:'Cobertura del historial',days:'días',observed:'observado',needMore:'No hay suficiente historial para evaluar este periodo.',realHistory:'Solo historial real de Supabase',pp:'p. p.',minAddressBalance:'Saldo ≥ 0.0001 KAS',networkWide:'Toda la red',oneKasPlus:'≥ 1 KAS'}
};
Object.assign(T.ja,{whales:'上位100アドレス保有比率',top100Change:'上位100アドレス保有比率の変化',liveUnavailable:'ライブ総数を取得できません',foot:'アドレス数＝保有者数ではありません。1ウォレットが複数アドレスを利用する場合があります。上位100アドレス保有比率には取引所・サービス用アドレスが含まれる可能性があります。'});
Object.assign(T.en,{whales:'Top 100 Address Share',top100Change:'Top 100 address-share change',minAddressBalance:'Balance ≥ 0.0001 KAS',networkWide:'Network-wide',oneKasPlus:'≥ 1 KAS',liveUnavailable:'Live total unavailable',foot:'Address count is not holder count. One wallet may use multiple addresses. The Top 100 address share may include exchange or service addresses.'});
Object.assign(T.ja,{last60:'直近60日',view60:'60日固定',change60:'60日騰落率',priceStatus:'価格',chartStatus:'チャート',updateDelayed:'更新遅延',autoRefresh:'自動更新',perpetual:'Bybit · KASUSDT 無期限',circulating:'KAS 流通中',heldTop100:'上位100アドレス',lessConcentrated:'分散方向',moreConcentrated:'集中方向',tier:'保有量',noHistoryYet:'履歴なし',priceScale:'価格目盛り',movingAverages:'移動平均線',liveUnavailable:'ライブ総数を取得できません'});
Object.assign(T.en,{last60:'Last 60 days',view60:'60-day view',change60:'60D change',priceStatus:'Price',chartStatus:'Chart',updateDelayed:'Update delayed',autoRefresh:'Auto refresh',perpetual:'Bybit · KASUSDT Perpetual',circulating:'KAS circulating',heldTop100:'held by Top 100',lessConcentrated:'Less concentrated',moreConcentrated:'More concentrated',tier:'Tier',noHistoryYet:'NO HISTORY YET',priceScale:'Price scale',movingAverages:'Moving averages'});
Object.assign(T.ko,{last60:'최근 60일',view60:'60일 고정',change60:'60일 등락률',priceStatus:'가격',chartStatus:'차트',updateDelayed:'업데이트 지연',autoRefresh:'자동 업데이트',perpetual:'Bybit · KASUSDT 무기한',circulating:'KAS 유통 중',heldTop100:'상위 100개 주소 보유',lessConcentrated:'집중도 하락',moreConcentrated:'집중도 상승',tier:'보유량',noHistoryYet:'아직 기록 없음',priceScale:'가격 눈금',movingAverages:'이동평균선',liveUnavailable:'실시간 총계를 가져올 수 없음'});
Object.assign(T.zh,{last60:'最近60天',view60:'固定60天',change60:'60日涨跌幅',priceStatus:'价格',chartStatus:'图表',updateDelayed:'更新延迟',autoRefresh:'自动更新',perpetual:'Bybit · KASUSDT 永续',circulating:'KAS 流通中',heldTop100:'由前100地址持有',lessConcentrated:'集中度下降',moreConcentrated:'集中度上升',tier:'持币量',noHistoryYet:'暂无历史数据',priceScale:'价格刻度',movingAverages:'移动平均线',liveUnavailable:'无法获取实时总数'});
Object.assign(T.es,{last60:'Últimos 60 días',view60:'Vista de 60 días',change60:'Cambio 60D',priceStatus:'Precio',chartStatus:'Gráfico',updateDelayed:'Actualización retrasada',autoRefresh:'Actualización automática',perpetual:'Bybit · KASUSDT perpetuo',circulating:'KAS en circulación',heldTop100:'en manos del Top 100',lessConcentrated:'Menos concentrado',moreConcentrated:'Más concentrado',tier:'Nivel',noHistoryYet:'SIN HISTORIAL',priceScale:'Escala de precios',movingAverages:'Medias móviles',liveUnavailable:'Total en vivo no disponible'});
Object.assign(T.ja,{minAddressBalance:'残高 0.01 KAS以上'});
Object.assign(T.en,{minAddressBalance:'Balance ≥ 0.01 KAS'});
Object.assign(T.ko,{minAddressBalance:'잔액 0.01 KAS 이상'});
Object.assign(T.zh,{minAddressBalance:'余额 ≥ 0.01 KAS'});
Object.assign(T.es,{minAddressBalance:'Saldo ≥ 0.01 KAS'});
Object.assign(T.ja,{last30:'直近30日',view30:'30日固定',change30Market:'30日騰落率'});
Object.assign(T.en,{last30:'Last 30 days',view30:'30-day view',change30Market:'30D change'});
Object.assign(T.ko,{last30:'최근 30일',view30:'30일 고정',change30Market:'30일 등락률'});
Object.assign(T.zh,{last30:'最近30天',view30:'固定30天',change30Market:'30日涨跌幅'});
Object.assign(T.es,{last30:'Últimos 30 días',view30:'Vista de 30 días',change30Market:'Cambio 30D'});
const PULSE_T={
 ja:{title:'KASPA MARKET PULSE',bull:'強気傾向',neutral:'中立・方向待ち',bear:'弱気傾向',price:'価格',derivatives:'先物',holders:'Holder',unavailable:'データ待ち',priceBull:'価格は主要MAの上側で推移',priceBear:'価格は主要MAの下側で推移',priceMixed:'価格は主要MAの間で推移',oiUp:'OIは24時間で増加',oiDown:'OIは24時間で減少',oiFlat:'OIは24時間で横ばい',fundingPos:'資金調達率はプラス',fundingNeg:'資金調達率はマイナス',fundingFlat:'資金調達率は中立圏',holderUp:'100K+アドレスは増加',holderDown:'100K+アドレスは減少',holderFlat:'100K+アドレスは横ばい',summaryBull:'買い圧力が優勢ですが、OI急増時は値動きの拡大に注意が必要です。',summaryBear:'売り圧力が優勢です。反転を判断するには価格とHolderの改善確認が必要です。',summaryNeutral:'方向感は限定的です。価格・OI・Holderの次の変化を確認したい局面です。',notice:'市場データの自動要約であり、投資助言ではありません。',oi:'現在のOI',oi24:'OI 24時間',funding:'資金調達率'},
 en:{title:'KASPA MARKET PULSE',bull:'Bullish bias',neutral:'Neutral / waiting',bear:'Bearish bias',price:'Price',derivatives:'Derivatives',holders:'Holders',unavailable:'Waiting for data',priceBull:'Price is above key MAs',priceBear:'Price is below key MAs',priceMixed:'Price is trading between key MAs',oiUp:'OI increased over 24 hours',oiDown:'OI decreased over 24 hours',oiFlat:'OI is flat over 24 hours',fundingPos:'Funding rate is positive',fundingNeg:'Funding rate is negative',fundingFlat:'Funding rate is neutral',holderUp:'100K+ addresses increased',holderDown:'100K+ addresses decreased',holderFlat:'100K+ addresses are flat',summaryBull:'Buying pressure leads, but a rapid OI increase can amplify volatility.',summaryBear:'Selling pressure leads. A price and holder recovery is needed to confirm a reversal.',summaryNeutral:'Direction is limited. Watch the next changes in price, OI, and holders.',notice:'Automated market-data summary, not investment advice.',oi:'Current OI',oi24:'OI 24H',funding:'Funding rate'},
 ko:{title:'KASPA MARKET PULSE',bull:'강세 경향',neutral:'중립 · 방향 대기',bear:'약세 경향',price:'가격',derivatives:'선물',holders:'홀더',unavailable:'데이터 대기 중',priceBull:'가격이 주요 이동평균선 위에 있음',priceBear:'가격이 주요 이동평균선 아래에 있음',priceMixed:'가격이 주요 이동평균선 사이에 있음',oiUp:'OI가 24시간 동안 증가',oiDown:'OI가 24시간 동안 감소',oiFlat:'OI가 24시간 동안 보합',fundingPos:'펀딩비가 플러스',fundingNeg:'펀딩비가 마이너스',fundingFlat:'펀딩비가 중립권',holderUp:'100K+ 주소 증가',holderDown:'100K+ 주소 감소',holderFlat:'100K+ 주소 보합',summaryBull:'매수 압력이 우세하지만 OI 급증 시 변동성 확대에 주의해야 합니다.',summaryBear:'매도 압력이 우세합니다. 반전을 확인하려면 가격과 홀더 개선이 필요합니다.',summaryNeutral:'방향성이 제한적입니다. 가격·OI·홀더의 다음 변화를 확인할 구간입니다.',notice:'시장 데이터 자동 요약이며 투자 조언이 아닙니다.',oi:'현재 OI',oi24:'OI 24시간',funding:'펀딩비'},
 zh:{title:'KASPA MARKET PULSE',bull:'偏多',neutral:'中性 · 等待方向',bear:'偏空',price:'价格',derivatives:'合约',holders:'持币者',unavailable:'等待数据',priceBull:'价格位于主要均线上方',priceBear:'价格位于主要均线下方',priceMixed:'价格在主要均线之间运行',oiUp:'OI在24小时内增加',oiDown:'OI在24小时内减少',oiFlat:'OI在24小时内持平',fundingPos:'资金费率为正',fundingNeg:'资金费率为负',fundingFlat:'资金费率处于中性区间',holderUp:'100K+地址增加',holderDown:'100K+地址减少',holderFlat:'100K+地址持平',summaryBull:'买盘压力占优，但OI快速增加时需注意波动扩大。',summaryBear:'卖盘压力占优。确认反转需要价格和持币者数据改善。',summaryNeutral:'方向性有限，请关注价格、OI和持币者数据的下一步变化。',notice:'市场数据自动摘要，不构成投资建议。',oi:'当前OI',oi24:'OI 24小时',funding:'资金费率'},
 es:{title:'KASPA MARKET PULSE',bull:'Sesgo alcista',neutral:'Neutral / en espera',bear:'Sesgo bajista',price:'Precio',derivatives:'Derivados',holders:'Holders',unavailable:'Esperando datos',priceBull:'El precio está sobre las medias clave',priceBear:'El precio está bajo las medias clave',priceMixed:'El precio cotiza entre las medias clave',oiUp:'El OI aumentó en 24 horas',oiDown:'El OI disminuyó en 24 horas',oiFlat:'El OI se mantiene estable en 24 horas',fundingPos:'La tasa de financiación es positiva',fundingNeg:'La tasa de financiación es negativa',fundingFlat:'La tasa de financiación es neutral',holderUp:'Aumentaron las direcciones 100K+',holderDown:'Disminuyeron las direcciones 100K+',holderFlat:'Las direcciones 100K+ están estables',summaryBull:'Predomina la presión compradora, pero un aumento rápido del OI puede ampliar la volatilidad.',summaryBear:'Predomina la presión vendedora. Se necesita una mejora del precio y los holders para confirmar un giro.',summaryNeutral:'La dirección es limitada. Conviene observar los próximos cambios en precio, OI y holders.',notice:'Resumen automático de datos de mercado; no es asesoramiento de inversión.',oi:'OI actual',oi24:'OI 24H',funding:'Tasa de financiación'}
};
const tiers=['1+','100+','1K+','10K+','100K+','1M+','10M+','100M+'];
const LOCALES={ja:'ja-JP',en:'en-US',ko:'ko-KR',zh:'zh-CN',es:'es-ES'};
function fmt(n){if(n==null)return '—';return Number(n).toLocaleString()}
function pct(n){if(n==null||!Number.isFinite(n))return '—';return `${n>=0?'+':''}${n.toFixed(2)}%`}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function mapRow(r,key){return ({'1+':r.total_1_plus,'100+':r.a_100_plus,'1K+':r.a_1k_plus,'10K+':r.a_10k_plus,'100K+':r.a_100k_plus,'1M+':r.a_1m_plus,'10M+':r.a_10m_plus,'100M+':r.a_100m_plus}[key]??null)}
function jstDay(iso){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))}
function dailyRows(rows=[]){const byDay=new Map();for(const r of rows){if(r?.captured_at)byDay.set(jstDay(r.captured_at),r)}return [...byDay.values()].sort((a,b)=>new Date(a.captured_at)-new Date(b.captured_at))}
function nearestChange(rows,key,days){if(!rows?.length)return null;const now=rows.at(-1),target=new Date(now.captured_at).getTime()-days*86400000;let prev=rows[0];for(const r of rows){if(Math.abs(new Date(r.captured_at)-target)<Math.abs(new Date(prev.captured_at)-target))prev=r}const a=mapRow(now,key),b=mapRow(prev,key);if(a==null||!b)return null;return {abs:a-b,pct:(a-b)/b*100,daysObserved:(new Date(now.captured_at)-new Date(prev.captured_at))/86400000}}
function compactUsd(v){if(!Number.isFinite(v))return '—';return new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1,style:'currency',currency:'USD'}).format(v)}
function lastSma(candles=[],period){if(candles.length<period)return null;return candles.slice(-period).reduce((sum,item)=>sum+Number(item.close),0)/period}
function buildMarketPulse(lang,candles=[],derivatives,holderChange){
 const p=PULSE_T[lang],close=Number(candles.at(-1)?.close),ma25=lastSma(candles,25),ma75=lastSma(candles,75);
 const priceReady=Number.isFinite(close)&&Number.isFinite(ma25)&&Number.isFinite(ma75),above=priceReady&&close>ma25&&close>ma75;
 const below=priceReady&&close<ma25&&close<ma75;
 const priceScore=above?1:below?-1:0,priceText=!priceReady?p.unavailable:above?p.priceBull:below?p.priceBear:p.priceMixed;
 const oi=derivatives?.oiChange24h,oiScore=Number.isFinite(oi)&&oi>2?priceScore:0;
 const oiText=!Number.isFinite(oi)?p.unavailable:oi>2?p.oiUp:oi<-2?p.oiDown:p.oiFlat;
 const funding=derivatives?.fundingRate;
 const fundingText=!Number.isFinite(funding)?p.unavailable:funding>.0001?p.fundingPos:funding<-.0001?p.fundingNeg:p.fundingFlat;
 const hp=holderChange?.pct,holderScore=Number.isFinite(hp)?(hp>.1?1:hp<-.1?-1:0):0;
 const holderText=!Number.isFinite(hp)?p.unavailable:hp>.1?p.holderUp:hp<-.1?p.holderDown:p.holderFlat;
 const score=priceScore+oiScore+holderScore,tone=score>=2?'bull':score<=-2?'bear':'neutral';
 return {tone,label:p[tone],summary:p[`summary${tone[0].toUpperCase()}${tone.slice(1)}`],priceText,oiText,fundingText,holderText};
}

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

const MA_CONFIG=[
 {period:10,color:'#58c8ff'},
 {period:25,color:'#ffd85a'},
 {period:75,color:'#ff5d6c'},
 {period:200,color:'#ffffff'}
];
function sliceByDays(series=[],days){
 if(!series.length)return [];
 const end=Number(series.at(-1)?.ts),start=end-Number(days)*86400000;
 return series.filter(item=>Number(item.ts)>=start);
}
function smaSeries(series=[],length){
 const result=[];let sum=0;
 for(let i=0;i<series.length;i++){
  sum+=series[i].value;
  if(i>=length)sum-=series[i-length].value;
  if(i>=length-1)result.push({ts:series[i].ts,value:sum/length});
 }
 return result;
}
function alignSeries(points,series){
 const aligned=[];let cursor=-1;
 for(const point of points){
  while(cursor+1<series.length&&series[cursor+1].ts<=point.ts)cursor++;
  aligned.push(cursor>=0?series[cursor].value:null);
 }
 return aligned;
}
function svgPath(values,x,y){
 let path='',drawing=false;
 values.forEach((value,i)=>{
  if(!Number.isFinite(value)){drawing=false;return;}
  path+=`${drawing?'L':'M'}${x(i)},${y(value)} `;drawing=true;
 });
 return path.trim();
}

function MarketChart({candles,prices,volumes,lang,t,displayDays=60}){
 const [hover,setHover]=useState(null);
 const [maVisible,setMaVisible]=useState(()=>Object.fromEntries(MA_CONFIG.map(ma=>[ma.period,true])));
 const W=720,H=244,AX=64,PL=8,PR=4,PT=14,PB=displayDays===30?18:30,VH=48,FUTURE_SLOTS=10;
 const hasCandles=Array.isArray(candles)&&candles.length>=2;
 const hasPrices=Array.isArray(prices)&&prices.length>=2;
 if(!hasCandles&&!hasPrices)return <div className="emptyChart marketEmpty"><div><b>{t.dataUnavailable}</b><span>{t.realData}</span></div></div>;

 // Fixed 4-hour candles: official CoinGecko OHLC where available, then real hourly observations.
 const allPoints=hasCandles?candles:prices.map(p=>({ts:p.ts,open:p.value,high:p.value,low:p.value,close:p.value}));
 const points=sliceByDays(allPoints,displayDays),maSource=allPoints.map(p=>({ts:p.ts,value:p.close}));
 const visibleVolumes=sliceByDays(volumes||[],displayDays);
 const maLines=MA_CONFIG.map(ma=>{
  const values=alignSeries(points,smaSeries(maSource,ma.period));
  return {...ma,values,available:values.filter(Number.isFinite).length>=2};
 });
 const shownMaValues=maLines.flatMap(ma=>ma.available&&maVisible[ma.period]?ma.values.filter(Number.isFinite):[]);
 const highs=[...points.map(x=>x.high),...shownMaValues],lows=[...points.map(x=>x.low),...shownMaValues];
 const rawMin=Math.min(...lows),rawMax=Math.max(...highs),pad=(rawMax-rawMin)*.07||rawMax*.01||.001,lo=rawMin-pad,hi=rawMax+pad;
 const plotBottom=H-PB-VH;
 const candleIntervals=Math.max(points.length-1,1),totalIntervals=candleIntervals+FUTURE_SLOTS;
 const candleStep=(W-PL-PR)/totalIntervals;
 const x=i=>PL+i*candleStep;
 const y=v=>PT+(hi-v)*(plotBottom-PT)/(hi-lo);
 const volVals=visibleVolumes.map(v=>v.value).filter(Number.isFinite),vmax=Math.max(...volVals,1);
 const idx=hover==null?points.length-1:clamp(hover,0,points.length-1),p=points[idx],cx=x(idx);
 const bodyW=Math.max(1.2,Math.min(7,candleStep*.62));
 const dataWidth=candleIntervals*candleStep;
 const onMove=e=>{const r=e.currentTarget.getBoundingClientRect(),px=((e.touches?.[0]?.clientX??e.clientX)-r.left)/r.width*W;setHover(clamp(Math.round((px-PL)/dataWidth*(points.length-1)),0,points.length-1))};
 const dateFmt=new Intl.DateTimeFormat(LOCALES[lang],{month:'short',day:'numeric'});
 const dtFmt=new Intl.DateTimeFormat(LOCALES[lang],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 const axis=[hi,(hi+lo)/2,lo];

 // Real market_chart line is used only when OHLC is unavailable; never synthetic.
 const fallbackPath=!hasCandles?points.map((q,i)=>`${i?'L':'M'}${x(i)},${y(q.close)}`).join(' '):null;
 return <div className="marketWrap">
  <div className="chartMode"><span className="realDot"/> <b>4H {hasCandles?t.ohlc:t.priceLive}</b><span className="chartRange">{displayDays===30?t.last30:t.last60}</span><em>{t.realData}</em></div>
  <div className="marketViewport">
  <div className="marketCanvas">
  <svg className="marketChart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={displayDays===30?'none':'xMidYMid meet'} onMouseMove={onMove} onMouseLeave={()=>setHover(null)} onTouchStart={onMove} onTouchMove={onMove}>
   {[0,.25,.5,.75,1].map((q,i)=>{const yy=PT+q*(plotBottom-PT);return <line key={i} x1={PL} y1={yy} x2={W-PR} y2={yy} className="mgrid"/>})}
   {visibleVolumes.slice(-points.length).map((v,i)=>{const bh=(v.value/vmax)*(VH-7),xx=x(i);return <rect key={v.ts||i} x={xx-.8} y={H-PB-bh} width="1.6" height={bh} className="volbar"/>})}
   {hasCandles ? points.map((q,i)=>{const xx=x(i),up=q.close>=q.open,top=y(Math.max(q.open,q.close)),bottom=y(Math.min(q.open,q.close)),bh=Math.max(1,bottom-top);return <g key={q.ts} className={up?'candleUp':'candleDown'}><line x1={xx} y1={y(q.high)} x2={xx} y2={y(q.low)} className="wick"/><rect x={xx-bodyW/2} y={top} width={bodyW} height={bh} rx=".6" className="body"/></g>}) :
    <path d={fallbackPath} fill="none" className="realPriceLine" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"/>}
   {maLines.map(ma=>ma.available&&maVisible[ma.period]?<path key={ma.period} d={svgPath(ma.values,x,y)} fill="none" stroke={ma.color} className="maLine"/>:null)}
   <line x1={x(points.length-1)} y1={y(points.at(-1).close)} x2={W-PR} y2={y(points.at(-1).close)} className="currentPriceGuide"/>
   {[0,Math.floor((points.length-1)/2),points.length-1].map((i,k)=><text key={k} x={x(i)} y={H-(displayDays===30?4:7)} textAnchor={k===0?'start':k===2?'end':'middle'} className="axisText">{dateFmt.format(new Date(points[i].ts))}</text>)}
   <line x1={cx} y1={PT} x2={cx} y2={H-PB} className="cross"/>
   <circle cx={cx} cy={y(p.close)} r="3.5" className="closeDot"/>
  </svg>
  </div>
  <svg className="fixedPriceAxis" viewBox={`0 0 ${AX} ${H}`} preserveAspectRatio={displayDays===30?'none':'xMidYMid meet'} aria-label={t.priceScale}>
   {axis.map((v,i)=><text key={i} x="5" y={PT+i*(plotBottom-PT)/2+4} className="axisText">${v.toFixed(v<.1?5:3)}</text>)}
   <rect x="2" y={clamp(y(p.close)-10,2,plotBottom-20)} width={AX-5} height="20" rx="4" className="priceTag"/>
   <text x="6" y={clamp(y(p.close)+4,16,plotBottom-6)} className="priceTagText">${p.close.toFixed(p.close<.1?5:3)}</text>
  </svg>
  </div>
  <div className="ohlcTooltip">
   <div className="ohlcTime">{dtFmt.format(new Date(p.ts))}</div>
   <span>O <b>${p.open.toFixed(5)}</b></span><span>H <b>${p.high.toFixed(5)}</b></span>
   <span>L <b>${p.low.toFixed(5)}</b></span><span>C <b>${p.close.toFixed(5)}</b></span>
  </div>
  <div className="maLegend" aria-label={t.movingAverages}>
   {maLines.map(ma=><button key={ma.period} type="button" className={`${maVisible[ma.period]?'active':''} ${ma.available?'':'unavailable'}`} onClick={()=>ma.available&&setMaVisible(v=>({...v,[ma.period]:!v[ma.period]}))} aria-pressed={maVisible[ma.period]&&ma.available} disabled={!ma.available}><i style={{background:ma.color}}/><b>{ma.period}MA</b>{!ma.available&&<span>{t.insufficient}</span>}</button>)}
  </div>
 </div>
}
function LineChart({values,t}){const W=420,H=130,p=8,all=values.filter(Number.isFinite);if(all.length<2)return <div className="emptyChart">{t.noHistoryYet}</div>;const min=Math.min(...all),max=Math.max(...all),range=max-min||1,path=values.map((v,i)=>`${i?'L':'M'}${p+i*(W-2*p)/(values.length-1)},${H-p-(v-min)*(H-2*p)/range}`).join(' ');return <svg className="chart" viewBox={`0 0 ${W} ${H}`}><g className="gridLines"><line x1="0" y1="32" x2={W} y2="32"/><line x1="0" y1="65" x2={W} y2="65"/><line x1="0" y1="98" x2={W} y2="98"/></g><path d={path} fill="none" stroke="#49eac1" strokeWidth="3" strokeLinecap="round"/></svg>}
function NormalizedCompare({holderValues,priceValues,t}){if(holderValues.length<2||priceValues.length<2)return <div className="emptyChart">{t.noHistoryYet}</div>;const n=Math.min(holderValues.length,priceValues.length),h=holderValues.slice(-n),p=priceValues.slice(-n),hn=h.map(v=>(v/h[0]-1)*100),pn=p.map(v=>(v/p[0]-1)*100),all=[...hn,...pn],min=Math.min(...all,0),max=Math.max(...all,0),range=max-min||1,W=420,H=145,px=8;const path=d=>d.map((v,i)=>`${i?'L':'M'}${px+i*(W-2*px)/(d.length-1)},${H-px-(v-min)*(H-2*px)/range}`).join(' '),zeroY=H-px-(0-min)*(H-2*px)/range;return <><svg className="chart compareChart" viewBox={`0 0 ${W} ${H}`}><line x1="0" y1={zeroY} x2={W} y2={zeroY} className="zeroLine"/><path d={path(pn)} fill="none" stroke="#f3faf8" strokeWidth="2.2"/><path d={path(hn)} fill="none" stroke="#49eac1" strokeWidth="3"/></svg><div className="legend"><span><i className="legendPrice"/> {t.priceLegend} {pct(pn.at(-1))}</span><span><i className="legendHolder"/> {t.holderLegend} {pct(hn.at(-1))}</span></div><div className="normalizedNote">{t.normalized}</div></>}
function BarChart({values,t}){const finite=values.filter(Number.isFinite);if(finite.length<1)return <div className="emptyChart">{t.noHistoryYet}</div>;const W=420,H=120,mid=60,max=Math.max(...finite.map(v=>Math.abs(v)),1);return <svg className="chart" viewBox={`0 0 ${W} ${H}`}><line x1="0" y1={mid} x2={W} y2={mid} stroke="#ffffff22"/>{values.map((v,i)=>{if(!Number.isFinite(v))return null;const bw=W/values.length*.55,scaled=Math.abs(v)/max*52,h=v===0?2:scaled,x=i*W/values.length+(W/values.length-bw)/2,y=v>0?mid-h:v<0?mid:mid-1;return <rect key={i} x={x} y={y} width={bw} height={h} rx="1.5" fill={v>=0?'#49eac1':'#ff6b6b'}/>})}</svg>}

export default function Dashboard(){
 const [lang,setLang]=useState('ja'),[holder,setHolder]=useState(null),[price,setPrice]=useState(null),[priceHistory,setPriceHistory]=useState({prices:[],volumes:[],candles:[],maPrices:[]}),[derivatives,setDerivatives]=useState(null),[history,setHistory]=useState({enabled:false,rows:[]}),[holderPeriod,setHolderPeriod]=useState(7),[scoreOpen,setScoreOpen]=useState(false),[priceUpdatedAt,setPriceUpdatedAt]=useState(null),[chartUpdatedAt,setChartUpdatedAt]=useState(null),[priceDelayed,setPriceDelayed]=useState(false),[chartDelayed,setChartDelayed]=useState(false),[isMobile,setIsMobile]=useState(false);const t=T[lang];
 useEffect(()=>{const browserLang=navigator.language.toLowerCase(),detected=browserLang.startsWith('ja')?'ja':browserLang.startsWith('ko')?'ko':browserLang.startsWith('zh')?'zh':browserLang.startsWith('es')?'es':'en',saved=localStorage.getItem('khm-lang'),l=T[saved]?saved:detected;setLang(l);document.documentElement.lang=l==='zh'?'zh-CN':l;if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});fetch('/api/holders').then(r=>{if(!r.ok)throw new Error(`holders ${r.status}`);return r.json()}).then(setHolder).catch(()=>{});},[]);
 useEffect(()=>{
  let active=true;
  const load=async()=>{try{const r=await fetch('/api/history?days=120',{cache:'no-store'});if(!r.ok)throw new Error(`history ${r.status}`);const data=await r.json();if(active)setHistory(data)}catch{}};
  const refresh=()=>{if(!document.hidden)load()};load();const timer=setInterval(refresh,900000);document.addEventListener('visibilitychange',refresh);
  return()=>{active=false;clearInterval(timer);document.removeEventListener('visibilitychange',refresh)};
 },[]);
 useEffect(()=>{
  let active=true;
  const load=async()=>{try{const r=await fetch('/api/price',{cache:'no-store'});if(!r.ok)throw new Error(`price ${r.status}`);const data=await r.json();if(!Number.isFinite(data?.usd))throw new Error('price unavailable');if(active){setPrice(data);setPriceUpdatedAt(data.capturedAt||new Date().toISOString());setPriceDelayed(false)}}catch{if(active)setPriceDelayed(true)}};
  const refresh=()=>{if(!document.hidden)load()};load();const timer=setInterval(refresh,60000);document.addEventListener('visibilitychange',refresh);
  return()=>{active=false;clearInterval(timer);document.removeEventListener('visibilitychange',refresh)};
 },[]);
 useEffect(()=>{const media=window.matchMedia('(max-width: 560px)'),sync=()=>setIsMobile(media.matches);sync();media.addEventListener?.('change',sync);return()=>media.removeEventListener?.('change',sync)},[]);
 useEffect(()=>{
  let active=true;
  const load=async()=>{try{const r=await fetch('/api/price/history?days=100',{cache:'no-store'});if(!r.ok)throw new Error(`history ${r.status}`);const data=await r.json();if(!(data?.prices?.length||data?.candles?.length))throw new Error('chart unavailable');if(active){setPriceHistory(previous=>({...data,prices:data.prices?.length?data.prices:previous.prices,volumes:data.volumes?.length?data.volumes:previous.volumes,candles:data.candles?.length?data.candles:previous.candles,maPrices:data.maPrices?.length?data.maPrices:previous.maPrices}));setChartUpdatedAt(data.capturedAt||new Date().toISOString());setChartDelayed(Object.values(data.errors||{}).some(Boolean))}}catch{if(active)setChartDelayed(true)}};
  const refresh=()=>{if(!document.hidden)load()};load();const timer=setInterval(refresh,900000);document.addEventListener('visibilitychange',refresh);
  return()=>{active=false;clearInterval(timer);document.removeEventListener('visibilitychange',refresh)};
 },[]);
 useEffect(()=>{
  let active=true;
  const load=async()=>{try{const r=await fetch('/api/derivatives',{cache:'no-store'});if(!r.ok)throw new Error(`derivatives ${r.status}`);const data=await r.json();if(active)setDerivatives(data)}catch{}};
  const refresh=()=>{if(!document.hidden)load()};load();const timer=setInterval(refresh,300000);document.addEventListener('visibilitychange',refresh);
  return()=>{active=false;clearInterval(timer);document.removeEventListener('visibilitychange',refresh)};
 },[]);
 const allDaily=useMemo(()=>dailyRows(history.rows||[]),[history.rows]),chartRows=useMemo(()=>allDaily.slice(-30),[allDaily]),chartPairs=chartRows.filter(r=>Number.isFinite(r.a_100k_plus)&&Number.isFinite(r.kas_price_usd));
 const h100=chartRows.map(r=>r.a_100k_plus).filter(Number.isFinite),compareH100=chartPairs.map(r=>r.a_100k_plus),priceSeries=chartPairs.map(r=>r.kas_price_usd),daily30Rows=allDaily.slice(-31),daily=daily30Rows.slice(1).map((row,i)=>{const previous=daily30Rows[i],gap=(new Date(row.captured_at)-new Date(previous.captured_at))/86400000;return gap<=1.5&&Number.isFinite(row.a_100k_plus)&&Number.isFinite(previous.a_100k_plus)?row.a_100k_plus-previous.a_100k_plus:null});
 const changes30=['1K+','10K+','100K+','1M+'].map(k=>nearestChange(allDaily,k,30)),latest=allDaily.at(-1),old30=allDaily.length?allDaily.reduce((best,r)=>Math.abs(new Date(r.captured_at)-(new Date(latest.captured_at).getTime()-30*86400000))<Math.abs(new Date(best.captured_at)-(new Date(latest.captured_at).getTime()-30*86400000))?r:best,allDaily[0]):null;
 const allPrices=priceHistory.prices||[],allVolumes=priceHistory.volumes||[],allCandles=priceHistory.candles||[],prices30=sliceByDays(allPrices,30);
 const concentrationChange=latest&&old30&&latest!==old30&&latest.top100_share!=null&&old30.top100_share!=null?latest.top100_share-old30.top100_share:null,livePrice30=prices30.length>1?(prices30.at(-1).value/prices30[0].value-1)*100:null,enoughHistory=changes30.every(c=>c&&c.daysObserved>=25);
 const scoreParts=useMemo(()=>{if(!enoughHistory)return null;const breadthAvg=changes30.reduce((s,c)=>s+c.pct,0)/4,largeAvg=((changes30[2]?.pct||0)+(changes30[3]?.pct||0))/2,breadth=scoreComponent(50+breadthAvg*10),large=scoreComponent(50+largeAvg*12.5),concentration=scoreComponent(50-(concentrationChange||0)*50);let divergence=50;if(livePrice30<0&&breadthAvg>0)divergence=85;else if(livePrice30>0&&breadthAvg>0)divergence=65;else if(livePrice30>0&&breadthAvg<0)divergence=20;else if(livePrice30<0&&breadthAvg<0)divergence=35;const total=Math.round(breadth*.35+large*.25+concentration*.20+divergence*.20);return {breadth,large,concentration,divergence,total}},[enoughHistory,changes30,concentrationChange,livePrice30]);
 const score=scoreParts?.total??null,signal=score==null?t.insufficient:score>=65?t.acc:score<=35?t.dist:t.neutral,change30=nearestChange(allDaily,'100K+',30),
 holder100k=nearestChange(allDaily,'100K+',holderPeriod),holder1m=nearestChange(allDaily,'1M+',holderPeriod),top100Delta=concentrationDelta(allDaily,holderPeriod),momentum=holderMomentum(allDaily,holderPeriod),
 holderEnough=holder100k&&holder100k.daysObserved>=holderPeriod*.80&&holder1m&&holder1m.daysObserved>=holderPeriod*.80,
 holderPrices=sliceByDays(allPrices,holderPeriod),holderPriceStart=holderPrices[0]?.value,holderPriceEnd=holderPrices.at(-1)?.value,
 holderPricePct=(holderPriceStart&&holderPriceEnd)?(holderPriceEnd/holderPriceStart-1)*100:null,
 divergenceLabel=holderEnough&&holderPricePct!=null?(holderPricePct<0&&holder100k.pct>0?t.divAcc:holderPricePct>0&&holder100k.pct<0?t.divDist:t.divConfirm):t.insufficient,
 changeLang=e=>{const n=e.target.value;setLang(n);localStorage.setItem('khm-lang',n);document.documentElement.lang=n==='zh'?'zh-CN':n},concentration=holder?.concentration||{};
 const marketDays=isMobile?30:60,ph=sliceByDays(allPrices,marketDays),pv=sliceByDays(allVolumes,marketDays),pc=sliceByDays(allCandles,marketDays),periodChange=ph.length>1?(ph.at(-1).value/ph[0].value-1)*100:null,periodHigh=pc.length?Math.max(...pc.map(x=>x.high)):null,periodLow=pc.length?Math.min(...pc.map(x=>x.low)):null,latestVol=pv.length?pv.at(-1).value:null;
 const pulse=buildMarketPulse(lang,allCandles,derivatives,nearestChange(allDaily,'100K+',7)),pulseText=PULSE_T[lang];
 const timeFmt=value=>value?new Date(value).toLocaleTimeString(LOCALES[lang],{hour:'2-digit',minute:'2-digit'}):'—',updateDelayed=priceDelayed||chartDelayed;
 const top10=Number(concentration.top10)||0,top100=Number(concentration.top100)||0,top1000=Number(concentration.top1000)||0,hasTop1000=Number.isFinite(concentration.top1000),segments=hasTop1000?[{label:t.top10,val:top10,cls:'seg10'},{label:t.top11_100,val:Math.max(0,top100-top10),cls:'seg100'},{label:t.top101_1000,val:Math.max(0,top1000-top100),cls:'seg1000'},{label:t.other,val:Math.max(0,100-top1000),cls:'segOther'}]:[{label:t.top10,val:top10,cls:'seg10'},{label:t.top11_100,val:Math.max(0,top100-top10),cls:'seg100'},{label:t.other,val:Math.max(0,100-top100),cls:'segOther'}];
 return <main className="shell">
  <header className="topbar"><div className="brandBlock"><img src="/kaspa-logo.svg" className="kaspaMark" alt="Kaspa"/><div><div className="kaspaWord">KASPA</div><div className="monitorWord">HOLDER MONITOR</div></div></div><div className="headerTools"><span className="versionBadge">v2.2.18</span><select className="lang" value={lang} onChange={changeLang} aria-label="Language"><option value="ja">日本語</option><option value="en">English</option><option value="ko">한국어</option><option value="zh">中文</option><option value="es">Español</option></select><img className="headerTechbitLogo" src="/techbit-logo.png" alt="TechBit · Crypto × Data × Future"/></div></header>
  <section className="hero"><div className="live"><i/> {t.live}</div><h1>{t.tag}</h1><p>Small Steps. A Bigger KASPA.</p></section>
  <section className="card priceCard"><div className="row"><div><div className="eyebrow">{t.price} (USD)</div><div className="price">{price?.usd?`$${price.usd.toFixed(price.usd<.1?5:3)}`:'—'}</div><div className={price?.change24h>=0?'up':'down'}>{price?.change24h!=null?pct(price.change24h):'—'} <span>24h</span></div></div><div className="fixedTimeframe"><b>4H</b><span>{marketDays===30?t.view30:t.view60}</span></div></div><MarketChart candles={allCandles} prices={allPrices} volumes={allVolumes} lang={lang} t={t} displayDays={marketDays}/><div className="marketStats"><div><span>{marketDays===30?t.change30Market:t.change60}</span><b className={periodChange>=0?'up':'down'}>{pct(periodChange)}</b></div><div><span>{t.high}</span><b>{periodHigh?`$${periodHigh.toFixed(5)}`:'—'}</b></div><div><span>{t.low}</span><b>{periodLow?`$${periodLow.toFixed(5)}`:'—'}</b></div><div><span>{t.volume}</span><b>{compactUsd(latestVol)}</b></div></div><div className="priceSource"><span className="realDot"/> {t.priceLive} · 4H OHLC · {t.realData}</div><div className={`updateStatus ${updateDelayed?'delayed':''}`}><span>{t.priceStatus} {timeFmt(priceUpdatedAt)}</span><span>{t.chartStatus} {timeFmt(chartUpdatedAt)}</span><b>{updateDelayed?t.updateDelayed:t.autoRefresh}</b></div></section>
  <section className={`card pulseCard ${pulse.tone}`}>
   <div className="pulseHead"><div><div className="eyebrow">{pulseText.title}</div><b>{pulse.label}</b></div><span>4H DATA</span></div>
   <p className="pulseSummary">{pulse.summary}</p>
   <div className="pulseSignals"><div><span>{pulseText.price}</span><b>{pulse.priceText}</b></div><div><span>{pulseText.derivatives}</span><b>{pulse.oiText} · {pulse.fundingText}</b></div><div><span>{pulseText.holders}</span><b>{pulse.holderText}</b></div></div>
   <div className="derivativesGrid"><div><span>{pulseText.oi}</span><b>{compactUsd(derivatives?.openInterestUsd)}</b></div><div><span>{pulseText.oi24}</span><b className={derivatives?.oiChange24h>=0?'up':'down'}>{pct(derivatives?.oiChange24h)}</b></div><div><span>{pulseText.funding}</span><b className={derivatives?.fundingRate>=0?'up':'down'}>{Number.isFinite(derivatives?.fundingRate)?pct(derivatives.fundingRate*100):'—'}</b></div></div>
   <div className="pulseFoot"><span>{pulseText.notice}</span><b>{t.perpetual}</b></div>
  </section>
  <div className="statsGrid overviewGrid"><section className="card stat"><div className="eyebrow">{t.addresses}</div><b>{fmt(holder?.totalBalanceAddresses)}</b><small>{holder?.totalBalanceAddresses!=null?t.minAddressBalance:(holder?.fallback?t.liveUnavailable:t.minAddressBalance)} · {t.networkWide}</small><div className="subStat"><span>{t.oneKasPlus}</span><b>{fmt(holder?.total1Plus)}</b></div></section><section className="card stat score"><div className="eyebrow scoreTitle">{t.holderScore}<button onClick={()=>setScoreOpen(v=>!v)}>?</button></div>{score==null?<div className="scoreMissing">—<small>{t.insufficient}</small></div>:<><div className="gauge" style={{'--score':`${score*3.6}deg`}}><b>{score}</b></div><small className="signalPill">{signal}</small></>}{scoreOpen&&<div className="scoreExplain"><b>{t.scoreBreakdown}</b><p>{t.scoreHelp}</p>{scoreParts&&<div className="scoreParts">{[[t.breadth,scoreParts.breadth,'35%'],[t.large,scoreParts.large,'25%'],[t.concentration,scoreParts.concentration,'20%'],[t.divergence,scoreParts.divergence,'20%']].map(([l,v,w])=><div key={l}><span>{l} <em>{w}</em></span><b>{v}</b></div>)}</div>}<small>{t.scoreNote}</small></div>}</section></div>
  <div className="statsGrid supplyGrid"><section className="card stat"><div className="eyebrow">{t.supply}</div><b>{holder?.circulating?`${(holder.circulating/1e9).toFixed(2)} B KAS`:'—'}</b><div className="supplyBar"><i style={{width:'100%'}}/></div><small>{t.circulating}</small></section><section className="card stat whaleCard"><div className="eyebrow">{t.whales}</div><div className="whaleHero"><b>{Number.isFinite(concentration.top100)?`${top100.toFixed(2)}%`:'—'}</b><span>{Number.isFinite(concentration.top100)?t.heldTop100:t.insufficient}</span></div>{Number.isFinite(concentration.top100)&&<><div className="whaleStack">{segments.map(s=><i key={s.label} className={s.cls} style={{width:`${s.val}%`}} title={`${s.label}: ${s.val.toFixed(2)}%`}/>)}</div><div className="whaleLegend">{segments.map(s=><span key={s.label}><i className={s.cls}/>{s.label}<b>{s.val.toFixed(2)}%</b></span>)}</div></>}<p className="whaleHelp">{t.whaleHelp}</p></section></div>
  <section className="card holderAnalysisCard">
   <div className="holderAnalysisHead"><div><div className="eyebrow">{t.holderAnalysis}</div><b>{t.realHistory}</b></div><div className="holderPeriods">{[7,30,90].map(x=><button key={x} className={holderPeriod===x?'active':''} onClick={()=>setHolderPeriod(x)}>{x}D</button>)}</div></div>
   <div className="coverage"><span>{t.historyCoverage}</span><b>{allDaily.length?`${Math.max(1,Math.round((new Date(allDaily.at(-1).captured_at)-new Date(allDaily[0].captured_at))/86400000)+1)} ${t.days}`:`0 ${t.days}`}</b></div>
   <div className="holderMetricGrid">
    <div className="holderMetric"><span>{t.addresses100k}</span><b>{holderEnough?`${holder100k.abs>=0?'+':''}${fmt(holder100k.abs)}`:'—'}</b><small className={holder100k?.pct>=0?'up':'down'}>{holderEnough?pct(holder100k.pct):t.insufficient}</small></div>
    <div className="holderMetric"><span>{t.addresses1m}</span><b>{holderEnough?`${holder1m.abs>=0?'+':''}${fmt(holder1m.abs)}`:'—'}</b><small className={holder1m?.pct>=0?'up':'down'}>{holderEnough?pct(holder1m.pct):t.insufficient}</small></div>
    <div className="holderMetric"><span>{t.top100Change}</span><b>{holderEnough&&top100Delta?`${top100Delta.delta>=0?'+':''}${top100Delta.delta.toFixed(2)} ${t.pp}`:'—'}</b><small>{holderEnough&&top100Delta?(top100Delta.delta<0?t.lessConcentrated:t.moreConcentrated):t.insufficient}</small></div>
    <div className="holderMetric"><span>{t.momentum}</span><b>{holderEnough&&momentum?`${momentum.acceleration>=0?'+':''}${fmt(momentum.acceleration)}`:'—'}</b><small>{t.momentumHelp}</small></div>
   </div>
   <div className={`divergenceBox ${holderEnough?'ready':''}`}><div><span>{t.divergenceTitle}</span><b>{divergenceLabel}</b></div><div className="divergenceNums"><span>KAS {holderEnough&&holderPricePct!=null?pct(holderPricePct):'—'}</span><span>100K+ {holderEnough?pct(holder100k.pct):'—'}</span></div></div>
   {!holderEnough&&<div className="holderNeedMore">{t.needMore}</div>}
  </section>
  <section className="card tiersCard"><div className="sectionTitle">{t.tiers}</div><div className="table head"><span>{t.tier}</span><span>{t.current}</span><span>{t.d7}</span><span>{t.d30}</span></div>{tiers.map(key=>{const c7=nearestChange(allDaily,key,7),c30=nearestChange(allDaily,key,30);return <div className="table" key={key}><span>{key==='1+'?'1 KAS+':key}</span><b>{fmt(holder?.cumulative?.[key])}</b><span className={c7?.abs>=0?'up':'down'}>{c7&&c7.daysObserved>=5?`${c7.abs>=0?'+':''}${fmt(c7.abs)}`:'—'}</span><span className={c30?.abs>=0?'up':'down'}>{c30&&c30.daysObserved>=25?`${c30.abs>=0?'+':''}${fmt(c30.abs)}`:'—'}</span></div>})}</section>
  <section className="card trendCard"><div className="chartHead"><b>{t.trend}</b><span>{change30&&change30.daysObserved>=25?pct(change30.pct):'—'}</span></div><LineChart values={h100} t={t}/>{allDaily.length<2&&<div className="historyNote">{t.noHistory}</div>}</section>
  <section className="card dailyCard"><div className="chartHead"><b>{t.daily}</b><span>30D · 100K+</span></div><BarChart values={daily} t={t}/></section>
  <section className="card compareCard"><div className="chartHead"><b>{t.compare}</b><span>30D</span></div><NormalizedCompare holderValues={compareH100} priceValues={priceSeries} t={t}/></section>
  <section className="card signalCard"><div><div className="eyebrow">{t.signal}</div><strong>{signal}</strong></div><div className="scoreNum">{score??'—'}<small>{score==null?'':'/100'}</small></div></section>
  <footer><div className="footerBrand"><img src="/kaspa-logo.svg" alt="Kaspa"/><div><b>@TechBit</b><span>KASPA ON-CHAIN ANALYTICS</span></div></div><p>{t.foot}</p><p>{t.source}: Kaspalytics · KasLens · CoinGecko<br/>{t.updated}: {holder?.capturedAt?new Date(holder.capturedAt).toLocaleString(LOCALES[lang]):'—'}</p></footer>
</main>
}
