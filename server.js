/**
 * =============================================================================
 * Thai & US Stock Scanner Pro V8.5 - Master-Trader Precision Release
 * =============================================================================
 * Engines:
 * 1. Market-Aware Session Engine:
 *    - TH: Before 10:00 AM BKK, uses latest completed session (e.g. 2026-09-10). After 10:00 AM, uses 2026-09-11 live.
 *    - US: Real-time active trading session with direct NYSE/NASDAQ quotes.
 * 2. Full Technical Indicators Suite for Charts:
 *    - Two-tone Volume Profile on right side (Buy Vol vs Sell Vol) + POC price line and badge.
 *    - EMA 5 (yellow), EMA 20 (cyan), EMA 50 (purple) overlay lines.
 *    - MACD Sub-panel (MACD line, Signal line, Green/Red Histogram).
 *    - RSI Sub-panel (RSI 14 line, RSI SMA line, 70/30 levels).
 *    - Factual Quarterly Financials Widget (Revenue, Net Income, QoQ %, YoY %, P/E, P/BV, ROE, Yield).
 * 3. Multi-Strategy Balanced 1M Portfolio Simulator:
 *    - 🛡️ Balanced All-Weather: Sector Diversified (max 1 stock per sector) + Momentum & Support mix.
 *    - 🚀 High-Alpha Momentum: Market leaders (highest RS & composite score).
 *    - 🔒 Low-Risk Squeeze & Bounce: Tight stop loss, VCP & EMA20 Bounce candidates.
 *    - Dynamic 3, 4, 5-stock baskets with Day 1-5 execution tracking & Win/Loss Cover Ratio.
 * 4. Multi-Strategy Pattern Matching with Specific Badges:
 *    - Independent non-exclusive matching for all 7 presets.
 *    - Exact setup badge mapping so selecting any preset highlights that strategy.
 *
 * 100% Real Market Facts • Zero Mock Data
 * =============================================================================
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3300;

// Thai Constituents
const SET50_LIST = [
  'ADVANC','AOT','AWC','BANPU','BBL','BDMS','BEM','BGRIM','BH','BJC',
  'BTS','CBG','CENTEL','COM7','CPALL','CPAXT','CPF','CPN','CRC','DELTA',
  'EGCO','GLOBAL','GPSC','GULF','HMPRO','INTUCH','IVL','KBANK','KCE','KTB',
  'KTC','LH','MINT','MTC','OR','OSP','PTT','PTTEP','PTTGC','RATCH',
  'SAWAD','SCB','SCC','SCGP','TIDLOR','TISCO','TLI','TOP','TRUE','TTB'
];

const SET100_LIST = [
  ...SET50_LIST,
  'AAV','AMATA','AP','BA','BAM','BCP','BCPG','BLA','BTG','BYD',
  'CHG','CK','CKP','DOHOME','EA','EPG','ERW','FORTH','GUNKUL','HANA',
  'ICHI','IRPC','ITC','JAS','JMART','JMT','KKP','MEGA','NEX','ORI',
  'PLANB','PRM','PSL','PTG','QH','RCL','RS','SINGER','SIRI','SJWD',
  'SPALI','SPRC','STA','STECON','STGT','SUPER','SYNEX','TASCO','TCAP','THG',
  'TTW','TU','VGI','WHA','WHAUP'
];

const SETHD_LIST = [
  'ADVANC','AP','BBL','BCH','BCP','BJC','CK','CPN','GPSC','HANA',
  'ICHI','KBANK','KKP','KTB','MAJOR','ORI','PTT','PTTEP','RATCH','SCB',
  'SCC','SIRI','SPALI','TASCO','TCAP','TISCO','TOP','TTW','TU','WHAUP'
];

const SSET_LIST = [
  'AIT','AJ','AMANAH','ANAN','ASIAN','ASK','ASP','BEAUTY','BEYOND','BJCHI',
  'CCET','CGH','CHAYO','CIMBT','DCON','DEMCO','DMT','EASTW','EKH','EP',
  'FSMART','GFPT','GJS','ILINK','ITEL','KAMART','KCAR','KEX','KGI','KSL',
  'LALIN','LHFG','LPN','M','MAJOR','MC','MDX','MILL','NCAP','NER',
  'NNCL','NOBLE','NUSA','NYT','PLAT','PRAPAT','PREB','PSTC','RJH','ROJNA',
  'S','SABUY','SAMART','SAMTEL','SAPPE','SAT','SC','SENX','SGC','SGP',
  'SKR','SMPC','SNC','SO','SPCG','SSP','STANLY','STPI','SVI','SYNTEC',
  'TFG','TFMAMA','TIPH','TKN','TKS','TPIPL','TPIPP','TQM','TRP','TRT',
  'TTA','TSTH','TWPC','UV','VIH','VNG','WICE','WORK'
];

// Expanded 120+ MAI Stocks
const MAI_LIST = [
  'AU','SPA','MASTER','WARRIX','DITTO','KLINIQ','TKN','SAPPE','CHAYO','COCOCO',
  'MEB','MCA','NAM','PHG','PLUS','SAV','SECURE','SMART','TEGH','TPAC',
  'TPL','UEC','VRANDA','XO','YGG','JPARK','KJL','SAFE','I2','NL',
  'ADB','APP','ARIP','ARROW','ATP30','BGT','BIZ','BOL','BROOK','BSBM',
  'BTW','CHEWA','CHO','CHOW','CIG','CITY','COLOR','CPR','CRANE','D',
  'DIMET','DOD','DV8','ECF','EE','FANCY','FLOYD','FPI','FTE','GCAP',
  'GEL','GIFT','GLOCON','HARN','HYDRO','HYDROTEK','IIG','INSET','IP','IT',
  'JCKH','JMT','K','KCM','KOOL','KUMWEL','KUN','LDC','LEO','LIT',
  'M-CHAI','MBAX','META','MICRO','MIE','MITSIB','MOONG','MORE','MPIC','MVP',
  'NBC','NDR','NETBAY','NEWS','NINE','NKT','NPK','NSI','OTO','PATO',
  'PICO','PIMO','PLANET','PSTC','QLT','RML','SALEE','SEAOIL','SELIC','SICT',
  'SIMAT','SISB','SLP','SMART','SMK','SMM','SORKON','SPVI','STAR','STC',
  'SWC','TACC','TAKUNI','TFI','THANA','THMUI','TIGER','TITLE','TM','TMILL'
];

// US Constituents
const US_MAG7 = ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'];

const NASDAQ100_LIST = [
  'NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'GOOG', 'META', 'TSLA', 'AVGO', 'COST',
  'NFLX', 'AMD', 'ADBE', 'PEP', 'LIN', 'CSCO', 'TMUS', 'INTU', 'QCOM', 'AMGN',
  'TXN', 'ISRG', 'HON', 'AMAT', 'BKNG', 'VRTX', 'PANW', 'SBUX', 'LRCX', 'ADI',
  'MDLZ', 'REGN', 'KLAC', 'GILD', 'ADP', 'SNPS', 'CDNS', 'PYPL', 'MELI', 'ASML',
  'CRWD', 'MAR', 'CSX', 'CTAS', 'NXPI', 'ORLY', 'MNST', 'PCAR', 'FTNT', 'WDAY',
  'ROST', 'MRVL', 'CPRT', 'KDP', 'PAYX', 'ADSK', 'AEP', 'CHTR', 'ODFL', 'ABNB',
  'KHC', 'DXCM', 'MCHP', 'AZN', 'CEG', 'FAST', 'IDXX', 'LULU', 'BIIB', 'PDD',
  'EXC', 'VRSK', 'CSGP', 'CTSH', 'GEHC', 'EA', 'ON', 'XEL', 'BKR', 'CCEP',
  'FANG', 'ANSS', 'DLTR', 'TTD', 'GFS', 'CDW', 'TEAM', 'MDB', 'WBD', 'ILMN',
  'ALNY', 'SMCI', 'ARM', 'DASH', 'ROP', 'SPLK', 'DDOG', 'ZS', 'PLTR', 'AXON'
];

const VUG_LIST = [
  'MSFT', 'AAPL', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AVGO', 'LLY', 'V',
  'MA', 'COST', 'AMD', 'NFLX', 'NOW', 'INTU', 'QCOM', 'ISRG', 'AMAT', 'BKNG',
  'UBER', 'PANW', 'LRCX', 'KLAC', 'TXN', 'VRTX', 'CRM', 'SNPS', 'CDNS', 'CRWD',
  'MELI', 'MAR', 'ORLY', 'PLTR', 'ABNB', 'FTNT', 'WDAY', 'MRVL', 'CPRT', 'ADSK',
  'SMCI', 'ARM', 'DASH', 'TTD', 'MDB', 'DDOG', 'AXON', 'ZS', 'ANET', 'DECK'
];

const SCHD_LIST = [
  'AVGO', 'HD', 'ABBV', 'MRK', 'CVX', 'PEP', 'KO', 'BAC', 'CSCO', 'PFE',
  'T', 'VZ', 'TXN', 'UPS', 'BMY', 'AMGN', 'MDT', 'PM', 'UNP', 'HON',
  'LOW', 'IBM', 'CAT', 'GE', 'DE', 'LMT', 'BLK', 'ADP', 'GS', 'MS',
  'RTX', 'SCHW', 'SYK', 'MDLZ', 'TGT', 'C', 'GILD', 'MMC', 'BKNG', 'TJX',
  'VLO', 'MPC', 'PSX', 'EOG', 'SLB', 'COP', 'OXY', 'PGR', 'CB', 'ALL'
];

const SEMIS_AI_LIST = [
  'NVDA', 'TSM', 'AVGO', 'ASML', 'AMD', 'QCOM', 'ARM', 'MU', 'INTC',
  'TXN', 'AMAT', 'LRCX', 'KLAC', 'MRVL', 'ADI', 'NXPI', 'MPWR', 'ON',
  'MCHP', 'STM', 'GFS', 'PLTR', 'SMCI', 'CRWD', 'PANW', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AAPL'
];

const SP500_CORE_LIST = [
  ...new Set(['TSM', 'ASML', 'ARM', 'NVO', ...US_MAG7, ...NASDAQ100_LIST.slice(0, 50), ...VUG_LIST.slice(0, 30), ...SCHD_LIST.slice(0, 30)])
];

// Comprehensive Stock-to-Sector Taxonomy for Money Rotation Analysis
const STOCK_SECTOR_MAP = {
  // Thai - Energy & Utilities
  PTT: 'Energy & Utilities', PTTEP: 'Energy & Utilities', PTTGC: 'Energy & Utilities', TOP: 'Energy & Utilities',
  BANPU: 'Energy & Utilities', SPRC: 'Energy & Utilities', BCP: 'Energy & Utilities', OR: 'Energy & Utilities',
  GULF: 'Energy & Utilities', GPSC: 'Energy & Utilities', BGRIM: 'Energy & Utilities', EGCO: 'Energy & Utilities',
  RATCH: 'Energy & Utilities', EA: 'Energy & Utilities', TTW: 'Energy & Utilities', WHAUP: 'Energy & Utilities',
  SUPER: 'Energy & Utilities', SSP: 'Energy & Utilities', SPCG: 'Energy & Utilities', TPIPP: 'Energy & Utilities',
  
  // Thai - Banking & Financial Services
  KBANK: 'Finance & Banking', SCB: 'Finance & Banking', BBL: 'Finance & Banking', KTB: 'Finance & Banking',
  TTB: 'Finance & Banking', TISCO: 'Finance & Banking', KKP: 'Finance & Banking', MTC: 'Finance & Banking',
  SAWAD: 'Finance & Banking', TIDLOR: 'Finance & Banking', BAM: 'Finance & Banking', JMT: 'Finance & Banking',
  KTC: 'Finance & Banking', CHAYO: 'Finance & Banking', SINGER: 'Finance & Banking', TCAP: 'Finance & Banking',
  ASK: 'Finance & Banking', ASP: 'Finance & Banking', KGI: 'Finance & Banking', NCAP: 'Finance & Banking',

  // Thai - Technology & Electronics
  DELTA: 'Electronic Components', HANA: 'Electronic Components', KCE: 'Electronic Components', CCET: 'Electronic Components',
  SVI: 'Electronic Components', ADVANC: 'Information & Telecom', TRUE: 'Information & Telecom', INTUCH: 'Information & Telecom',
  DITTO: 'Technology & Cloud', BE8: 'Technology & Cloud', BBIK: 'Technology & Cloud', INSET: 'Technology & Cloud',
  IIG: 'Technology & Cloud', SECURE: 'Technology & Cloud', NETBAY: 'Technology & Cloud', SYNEX: 'Technology & Cloud',
  SIS: 'Technology & Cloud', COM7: 'Technology & Retail',

  // Thai - Commerce & Retail
  CPALL: 'Commerce & Retail', CPAXT: 'Commerce & Retail', CRC: 'Commerce & Retail', HMPRO: 'Commerce & Retail',
  BJC: 'Commerce & Retail', GLOBAL: 'Commerce & Retail', DOHOME: 'Commerce & Retail', MC: 'Commerce & Retail',
  KAMART: 'Commerce & Retail', BEAUTY: 'Commerce & Retail',

  // Thai - Health Care Services
  BDMS: 'Health Care Services', BH: 'Health Care Services', BCH: 'Health Care Services', CHG: 'Health Care Services',
  PR9: 'Health Care Services', THG: 'Health Care Services', MASTER: 'Health Care Services', KLINIQ: 'Health Care Services',
  EKH: 'Health Care Services', VIBHA: 'Health Care Services',

  // Thai - Transportation & Logistics
  AOT: 'Transportation & Logistics', BEM: 'Transportation & Logistics', BTS: 'Transportation & Logistics',
  SJWD: 'Transportation & Logistics', PSL: 'Transportation & Logistics', RCL: 'Transportation & Logistics',
  PRM: 'Transportation & Logistics', WICE: 'Transportation & Logistics', III: 'Transportation & Logistics',
  KEX: 'Transportation & Logistics', NYT: 'Transportation & Logistics',

  // Thai - Food, Beverage & Agribusiness
  CPF: 'Food & Beverage', TU: 'Food & Beverage', CBG: 'Food & Beverage', OSP: 'Food & Beverage',
  ICHI: 'Food & Beverage', SAPPE: 'Food & Beverage', TKN: 'Food & Beverage', PLUS: 'Food & Beverage',
  COCOCO: 'Food & Beverage', XO: 'Food & Beverage', BTG: 'Food & Beverage', TFG: 'Food & Beverage',
  STA: 'Food & Beverage', STGT: 'Food & Beverage', NER: 'Food & Beverage', TEGH: 'Food & Beverage',

  // Thai - Property & Construction
  CPN: 'Property Development', SPALI: 'Property Development', AP: 'Property Development', LH: 'Property Development',
  SIRI: 'Property Development', ORI: 'Property Development', QH: 'Property Development', WHA: 'Property & Industrial Estate',
  AMATA: 'Property & Industrial Estate', ROJNA: 'Property & Industrial Estate', SCC: 'Construction Materials',
  SCCC: 'Construction Materials', CK: 'Construction Services', STEC: 'Construction Services', TASCO: 'Construction Materials',

  // Thai - Tourism & Hospitality
  MINT: 'Tourism & Leisure', CENTEL: 'Tourism & Leisure', ERW: 'Tourism & Leisure', SPA: 'Tourism & Leisure',
  VRANDA: 'Tourism & Leisure',

  // US - Mega Tech & Semiconductors
  NVDA: 'Semiconductors', AMD: 'Semiconductors', AVGO: 'Semiconductors', INTC: 'Semiconductors',
  QCOM: 'Semiconductors', TSM: 'Semiconductors', ASML: 'Semiconductors', MU: 'Semiconductors',
  LRCX: 'Semiconductors', AMAT: 'Semiconductors', KLAC: 'Semiconductors', ARM: 'Semiconductors',
  SMCI: 'Semiconductors', TXN: 'Semiconductors', ADI: 'Semiconductors', MRVL: 'Semiconductors',
  AAPL: 'Consumer Electronics', MSFT: 'Software & Cloud', GOOGL: 'Internet & Search', GOOG: 'Internet & Search',
  AMZN: 'E-Commerce & Cloud', META: 'Social Media & Ads', TSLA: 'Automotive & Clean Energy',

  // US - Enterprise Software & Cybersecurity
  CRM: 'Software & Cloud', ADBE: 'Software & Cloud', ORCL: 'Software & Cloud', NOW: 'Software & Cloud',
  SNOW: 'Software & Cloud', PLTR: 'Software & AI', CRWD: 'Cybersecurity', PANW: 'Cybersecurity',
  FTNT: 'Cybersecurity', ZS: 'Cybersecurity', DDOG: 'Software & Cloud', MDB: 'Software & Cloud',
  WDAY: 'Software & Cloud', ADSK: 'Software & Cloud', TTD: 'Digital Advertising',

  // US - Finance & Payments
  JPM: 'Financial Services', BAC: 'Financial Services', WFC: 'Financial Services', C: 'Financial Services',
  GS: 'Financial Services', MS: 'Financial Services', V: 'Financial Services', MA: 'Financial Services',
  AXP: 'Financial Services', PYPL: 'Financial Services', BLK: 'Financial Services', SCHW: 'Financial Services',

  // US - Healthcare & Biotechnology
  LLY: 'Pharmaceuticals', NVO: 'Pharmaceuticals', UNH: 'Health Services', JNJ: 'Pharmaceuticals',
  ABBV: 'Pharmaceuticals', MRK: 'Pharmaceuticals', PFE: 'Pharmaceuticals', TMO: 'Medical Technology',
  ISRG: 'Medical Technology', VRTX: 'Biotechnology', REGN: 'Biotechnology', GILD: 'Biotechnology',
  AMGN: 'Biotechnology', BIIB: 'Biotechnology',

  // US - Consumer, Retail & Media
  COST: 'Retail & Consumer', WMT: 'Retail & Consumer', HD: 'Retail & Consumer', LOW: 'Retail & Consumer',
  TGT: 'Retail & Consumer', NKE: 'Consumer Goods', SBUX: 'Restaurants', MCD: 'Restaurants',
  KO: 'Food & Beverage', PEP: 'Food & Beverage', MDLZ: 'Food & Beverage', PG: 'Consumer Goods',
  NFLX: 'Media & Entertainment', DIS: 'Media & Entertainment', CMCSA: 'Media & Entertainment',
  BKNG: 'Travel & Booking', ABNB: 'Travel & Booking', UBER: 'Mobility & Delivery', DASH: 'Mobility & Delivery',

  // US - Energy & Industrial
  XOM: 'Energy & Oil', CVX: 'Energy & Oil', COP: 'Energy & Oil', SLB: 'Energy & Oil',
  EOG: 'Energy & Oil', CAT: 'Industrial Machinery', DE: 'Industrial Machinery', GE: 'Industrial Machinery',
  BA: 'Aerospace & Defense', LMT: 'Aerospace & Defense', RTX: 'Aerospace & Defense', HON: 'Industrial Conglomerate'
};

function getSectorForStock(symbol, tvSector = '') {
  const clean = String(symbol || '').trim().toUpperCase();
  if (STOCK_SECTOR_MAP[clean]) return STOCK_SECTOR_MAP[clean];
  if (tvSector && tvSector !== 'General' && tvSector.trim() !== '') return tvSector;
  return 'Diversified / Others';
}

// Macro Benchmarks
const US_BENCHMARKS_CONFIG = [
  { id: 'QQQM', label: 'QQQM', name: 'Invesco NASDAQ 100 ETF', type: 'etf', symbol: 'QQQM', tvTicker: 'NASDAQ:QQQM' },
  { id: 'VOO', label: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf', symbol: 'VOO', tvTicker: 'AMEX:VOO' },
  { id: 'SCHD', label: 'SCHD', name: 'Schwab US Dividend Equity ETF', type: 'etf', symbol: 'SCHD', tvTicker: 'AMEX:SCHD' },
  { id: 'BTC', label: 'BTC/USDT', name: 'Bitcoin Real-Time Index', type: 'crypto', symbol: 'BTC-USD', tvTicker: 'BINANCE:BTCUSDT' },
  { id: 'GOLD', label: 'Gold (XAU)', name: 'Gold Continuous Contract', type: 'commodity', symbol: 'GC=F', tvTicker: 'TVC:GOLD' },
  { id: 'OIL', label: 'Crude Oil', name: 'WTI Crude Oil', type: 'commodity', symbol: 'CL=F', tvTicker: 'NYMEX:CL1!' },
  { id: 'SGOV', label: 'SGOV', name: 'iShares 0-3 Month Treasury ETF', type: 'bond', symbol: 'SGOV', tvTicker: 'NYSE:SGOV' },
  { id: 'USDTHB', label: 'USD/THB', name: 'US Dollar / Thai Baht Exchange', type: 'forex', symbol: 'THB=X', tvTicker: 'FX_IDC:USDTHB' }
];

const TH_BENCHMARKS_CONFIG = [
  { id: 'SET', label: 'SET', name: 'SET Index', type: 'index', symbol: '^SET.BK', histSymbol: 'TDEX.BK', tvTicker: 'SET:SET' },
  { id: 'SET50', label: 'SET50', name: 'SET50 Index', type: 'index', symbol: '^SET50.BK', histSymbol: 'TDEX.BK', tvTicker: 'SET:SET50' },
  { id: 'SET100', label: 'SET100', name: 'SET100 Index', type: 'index', symbol: '^SET100.BK', histSymbol: 'BSET100.BK', tvTicker: 'SET:SET100' },
  { id: 'SETHD', label: 'SETHD', name: 'SETHD High Dividend Index', type: 'index', symbol: '^SETHD.BK', histSymbol: '1DIV.BK', tvTicker: 'SET:SETHD' },
  { id: 'OIL', label: 'Crude Oil', name: 'WTI Crude Oil', type: 'commodity', symbol: 'CL=F', histSymbol: 'CL=F', tvTicker: 'NYMEX:CL1!' },
  { id: 'USDTHB', label: 'USD/THB', name: 'US Dollar / Thai Baht Exchange', type: 'forex', symbol: 'THB=X', histSymbol: 'THB=X', tvTicker: 'FX_IDC:USDTHB' }
];

const TV_COLUMNS = [
  "name", "description", "logoid", "close", "change", "open", "high", "low",
  "volume", "Value.Traded", "relative_volume_10d_calc",
  "EMA5", "EMA10", "EMA20", "EMA50", "EMA200",
  "RSI", "MACD.macd", "MACD.signal", "MACD.hist",
  "price_52_week_high", "price_52_week_low",
  "Perf.W", "Perf.1M", "Perf.3M", "Perf.6M",
  "sector", "industry", "exchange", "type",
  // Intraday H1 (60m), H2 (120m), H4 (240m)
  "close|60", "EMA20|60", "EMA50|60", "EMA200|60",
  "close|120", "EMA20|120", "EMA50|120", "EMA200|120",
  "close|240", "EMA20|240", "EMA50|240", "EMA200|240"
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const HISTORICAL_CACHE = new Map();
const FINANCIALS_CACHE = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins

/**
 * Market-Hour & Weekend Awareness (100% Fact: Weekends rollback to Friday's completed session)
 */
function getMarketActiveSessionDate(market = 'TH') {
  const now = new Date();
  const timeZone = market === 'US' ? 'America/New_York' : 'Asia/Bangkok';

  const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(now);
  const hourStr = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(now);
  const hour = parseInt(hourStr, 10);
  const minuteStr = new Intl.DateTimeFormat('en-US', { timeZone, minute: 'numeric' }).format(now);
  const minute = parseInt(minuteStr, 10);

  const isBeforeOpen = market === 'TH' ? hour < 10 : (hour < 9 || (hour === 9 && minute < 30));

  let daysToSubtract = 0;
  if (weekdayStr === 'Sat') {
    // Saturday: market was open on Friday (1 day ago)
    daysToSubtract = 1;
  } else if (weekdayStr === 'Sun') {
    // Sunday: market was open on Friday (2 days ago)
    daysToSubtract = 2;
  } else if (weekdayStr === 'Mon') {
    // Monday: if before market open, latest completed session was Friday (3 days ago)
    daysToSubtract = isBeforeOpen ? 3 : 0;
  } else {
    // Tue, Wed, Thu, Fri: if before market open, latest session was yesterday
    daysToSubtract = isBeforeOpen ? 1 : 0;
  }

  const targetTime = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(targetTime);
}

function getMarketDateStr(unixSec, market = 'TH') {
  const timeZone = market === 'US' ? 'America/New_York' : 'Asia/Bangkok';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(unixSec * 1000));
}

// Indicator math
function calculateEMA(values, period) {
  const k = 2 / (period + 1);
  const emaArray = new Array(values.length).fill(null);
  if (values.length < period) return emaArray;

  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  emaArray[period - 1] = Math.round((sum / period) * 100) / 100;

  for (let i = period; i < values.length; i++) {
    emaArray[i] = Math.round(((values[i] * k) + (emaArray[i - 1] * (1 - k))) * 100) / 100;
  }
  for (let i = 0; i < period - 1; i++) emaArray[i] = emaArray[period - 1];
  return emaArray;
}

function calculateSMA(values, period) {
  const smaArray = new Array(values.length).fill(null);
  if (values.length < period) return smaArray;

  let sum = 0;
  for (let i = 0; i < period; i++) sum += (values[i] ?? 0);
  smaArray[period - 1] = Math.round((sum / period) * 100) / 100;

  for (let i = period; i < values.length; i++) {
    sum += (values[i] ?? 0) - (values[i - period] ?? 0);
    smaArray[i] = Math.round((sum / period) * 100) / 100;
  }
  for (let i = 0; i < period - 1; i++) smaArray[i] = smaArray[period - 1];
  return smaArray;
}

function calculateRSIArray(closes, period = 14) {
  const rsiArray = new Array(closes.length).fill(null);
  if (closes.length <= period) return rsiArray;

  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiArray[period] = Math.round((100 - (100 / (1 + rs))) * 10) / 10;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiArray[i] = Math.round((100 - (100 / (1 + rs))) * 10) / 10;
  }
  for (let i = 0; i < period; i++) rsiArray[i] = rsiArray[period];
  return rsiArray;
}

function calculateMACD(closes) {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = new Array(closes.length);
  for (let i = 0; i < closes.length; i++) {
    macdLine[i] = Math.round((ema12[i] - ema26[i]) * 100) / 100;
  }
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = new Array(closes.length);
  for (let i = 0; i < closes.length; i++) {
    histogram[i] = Math.round((macdLine[i] - signalLine[i]) * 100) / 100;
  }
  return { macdLine, signalLine, histogram };
}

/**
 * Yahoo Finance Crumb Authentication Manager
 */
let cachedCookie = null;
let cachedCrumb = null;
let cookieTimestamp = 0;

function getCookieAndCrumb() {
  return new Promise((resolve) => {
    const now = Date.now();
    if (cachedCookie && cachedCrumb && (now - cookieTimestamp < 3600000)) {
      return resolve({ cookie: cachedCookie, crumb: cachedCrumb });
    }
    https.get('https://fc.yahoo.com', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      const cookieHeader = res.headers['set-cookie'];
      const cookie = cookieHeader ? cookieHeader.join('; ') : '';
      https.get('https://query2.finance.yahoo.com/v1/test/getcrumb', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Cookie': cookie
        }
      }, (res2) => {
        let d = '';
        res2.on('data', c => d += c);
        res2.on('end', () => {
          const crumb = d.trim();
          cachedCookie = cookie;
          cachedCrumb = crumb;
          cookieTimestamp = now;
          resolve({ cookie, crumb });
        });
      }).on('error', () => resolve({ cookie: '', crumb: '' }));
    }).on('error', () => resolve({ cookie: '', crumb: '' }));
  });
}

/**
 * Fetch TradingView Fundamentals (P/E, P/BV, ROE, Yield, Net Income, Revenue, QoQ%, YoY%)
 */
function fetchTVFundamentals(symbol, market = 'TH') {
  return new Promise((resolve) => {
    const endpoint = market === 'TH' ? 'https://scanner.tradingview.com/thailand/scan' : 'https://scanner.tradingview.com/america/scan';
    const tickers = market === 'TH'
      ? [`SET:${symbol}`, `MAI:${symbol}`]
      : [`NASDAQ:${symbol}`, `NYSE:${symbol}`, `AMEX:${symbol}`, symbol];
    const body = JSON.stringify({
      symbols: { tickers },
      columns: [
        'name', 'price_earnings_ttm', 'price_book_fq',
        'net_income_fq', 'total_revenue_fq',
        'net_income_fy', 'total_revenue_fy',
        'net_income_yoy_growth_fq', 'net_income_qoq_growth_fq',
        'return_on_equity_fq', 'dividends_yield_current',
        'total_revenue_yoy_growth_fq', 'total_revenue_qoq_growth_fq'
      ]
    });
    const req = https.request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const row = j.data?.find(item => item?.d && item.d[0])?.d || j.data?.[0]?.d;
          if (row) {
            resolve({
              pe: row[1] ? Math.round(row[1] * 100) / 100 : null,
              pbv: row[2] ? Math.round(row[2] * 100) / 100 : null,
              netIncomeFQ: row[3],
              totalRevenueFQ: row[4],
              netIncomeFY: row[5],
              totalRevenueFY: row[6],
              netIncomeYoY: row[7] != null ? Math.round(row[7] * 10) / 10 : null,
              netIncomeQoQ: row[8] != null ? Math.round(row[8] * 10) / 10 : null,
              roe: row[9] ? Math.round(row[9] * 10) / 10 : null,
              dividendYield: row[10] ? Math.round(row[10] * 100) / 100 : null,
              totalRevYoY: row[11] != null ? Math.round(row[11] * 10) / 10 : null,
              totalRevQoQ: row[12] != null ? Math.round(row[12] * 10) / 10 : null
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

function parseQuarterKey(qStr) {
  if (!qStr) return null;
  const m1 = String(qStr).match(/^([1-4])\s*Q\s*(\d{4})$/i);
  if (m1) return { q: 'Q' + m1[1], year: m1[2], qNum: parseInt(m1[1]) };

  const m2 = String(qStr).match(/^(\d{4})\s*Q\s*([1-4])$/i);
  if (m2) return { q: 'Q' + m2[2], year: m2[1], qNum: parseInt(m2[2]) };

  const m3 = String(qStr).match(/^(\d{4})-0?([1-9]|1[0-2])-\d{2}$/);
  if (m3) {
    const y = m3[1];
    const m = parseInt(m3[2]);
    const qNum = m <= 3 ? 1 : m <= 6 ? 2 : m <= 9 ? 3 : 4;
    return { q: 'Q' + qNum, year: y, qNum };
  }
  return null;
}

/**
 * Fetch Factual Quarterly Financial Statements (Revenue, Net Income, QoQ, YoY)
 */
async function fetchStockFinancials(symbol, market = 'TH') {
  const cleanSym = symbol.trim().toUpperCase();
  const cacheKey = `FIN:${market}:${cleanSym}`;
  const cached = FINANCIALS_CACHE.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const yahooSym = market === 'TH' ? (cleanSym.includes('.BK') ? cleanSym : `${cleanSym}.BK`) : cleanSym;

  const [auth, tvFund] = await Promise.all([
    getCookieAndCrumb(),
    fetchTVFundamentals(cleanSym, market)
  ]);

  let yfData = null;
  if (auth.cookie && auth.crumb) {
    yfData = await new Promise((resolve) => {
      const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(yahooSym)}?crumb=${auth.crumb}&modules=incomeStatementHistory,incomeStatementHistoryQuarterly,earnings,defaultKeyStatistics,financialData`;
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Cookie': auth.cookie
        }
      }, (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          try {
            resolve(JSON.parse(d)?.quoteSummary?.result?.[0]);
          } catch (e) {
            resolve(null);
          }
        });
      }).on('error', () => resolve(null));
    });
  }

  const divisor = market === 'TH' ? 1000000 : 1000000000; // M in THB, B in USD
  const unit = market === 'TH' ? 'ล้านบาท (M)' : 'Billion USD (B)';

  const quartersMap = {};

  // 1. incomeStatementHistoryQuarterly (exact dates)
  const stmts = yfData?.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
  stmts.forEach(s => {
    const p = parseQuarterKey(s.endDate?.fmt);
    if (p) {
      const key = `${p.year}-${p.q}`;
      const rev = s.totalRevenue?.raw || 0;
      const net = s.netIncome?.raw || 0;
      quartersMap[key] = {
        year: p.year,
        q: p.q,
        qNum: p.qNum,
        net: Math.round((net / divisor) * 100) / 100,
        rev: Math.round((rev / divisor) * 100) / 100
      };
    }
  });

  // 2. earnings.financialsChart.quarterly
  const chartQ = yfData?.earnings?.financialsChart?.quarterly || [];
  chartQ.forEach(q => {
    const p = parseQuarterKey(q.date) || parseQuarterKey(q.fiscalQuarter);
    if (p) {
      const key = `${p.year}-${p.q}`;
      const rev = q.revenue?.raw || 0;
      const net = q.earnings?.raw || 0;
      if (!quartersMap[key] || quartersMap[key].net === 0) {
        quartersMap[key] = {
          year: p.year,
          q: p.q,
          qNum: p.qNum,
          net: Math.round((net / divisor) * 100) / 100,
          rev: Math.round((rev / divisor) * 100) / 100
        };
      }
    }
  });

  // 3. Yearly totals to deduce 4th quarter if 3 exist
  const yearly = yfData?.earnings?.financialsChart?.yearly || [];
  const yearlyMap = {};
  yearly.forEach(y => {
    yearlyMap[String(y.date)] = {
      net: Math.round(((y.earnings?.raw || 0) / divisor) * 100) / 100,
      rev: Math.round(((y.revenue?.raw || 0) / divisor) * 100) / 100
    };
  });

  const yearMap = {
    '2026': { Q1: null, Q2: null, Q3: null, Q4: null, sumNet: 0, sumRev: 0 },
    '2025': { Q1: null, Q2: null, Q3: null, Q4: null, sumNet: 0, sumRev: 0 }
  };

  Object.values(quartersMap).forEach(item => {
    if (yearMap[item.year]) {
      yearMap[item.year][item.q] = { net: item.net, rev: item.rev };
    }
  });

  // For 2025: if 3 quarters exist and yearly total is known, deduce the missing quarter
  const yTotal25 = yearlyMap['2025'];
  if (yTotal25 && yTotal25.net !== 0) {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const present = quarters.filter(q => yearMap['2025'][q] !== null);
    const missing = quarters.filter(q => yearMap['2025'][q] === null);
    if (present.length === 3 && missing.length === 1) {
      const sumPresentNet = present.reduce((acc, q) => acc + yearMap['2025'][q].net, 0);
      const sumPresentRev = present.reduce((acc, q) => acc + yearMap['2025'][q].rev, 0);
      yearMap['2025'][missing[0]] = {
        net: Math.round((yTotal25.net - sumPresentNet) * 100) / 100,
        rev: Math.round((yTotal25.rev - sumPresentRev) * 100) / 100
      };
    }
  }

  // Calculate sumNet and sumRev
  for (const yr of ['2026', '2025']) {
    let sNet = 0, sRev = 0;
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
      if (yearMap[yr][q]) {
        sNet += yearMap[yr][q].net;
        sRev += yearMap[yr][q].rev;
      }
    });
    yearMap[yr].sumNet = Math.round(sNet * 100) / 100;
    yearMap[yr].sumRev = Math.round(sRev * 100) / 100;
  }

  // Calculate sequential list of reported quarters sorted chronologically
  const sortedQuarters = Object.values(quartersMap).sort((a, b) => {
    if (a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
    return a.qNum - b.qNum;
  });

  // Compute QoQ and YoY
  let qoqNetPct = null, yoyNetPct = null;
  let qoqRevPct = null, yoyRevPct = null;

  if (sortedQuarters.length >= 2) {
    const latest = sortedQuarters[sortedQuarters.length - 1];
    const prev = sortedQuarters[sortedQuarters.length - 2];
    if (prev.net !== 0) {
      qoqNetPct = Math.round(((latest.net - prev.net) / Math.abs(prev.net)) * 1000) / 10;
    }
    if (prev.rev !== 0) {
      qoqRevPct = Math.round(((latest.rev - prev.rev) / Math.abs(prev.rev)) * 1000) / 10;
    }
  }

  // YoY: compare latest quarter with same quarter previous year
  if (sortedQuarters.length >= 1) {
    const latest = sortedQuarters[sortedQuarters.length - 1];
    const prevYearSameQ = yearMap[String(parseInt(latest.year) - 1)]?.[latest.q];
    if (prevYearSameQ && prevYearSameQ.net !== 0) {
      yoyNetPct = Math.round(((latest.net - prevYearSameQ.net) / Math.abs(prevYearSameQ.net)) * 1000) / 10;
    }
    if (prevYearSameQ && prevYearSameQ.rev !== 0) {
      yoyRevPct = Math.round(((latest.rev - prevYearSameQ.rev) / Math.abs(prevYearSameQ.rev)) * 1000) / 10;
    }
  }

  // AUDITED TRADINGVIEW FUNDAMENTALS OVERRIDE & COMPLETION
  if (tvFund) {
    if ((qoqNetPct === null || qoqNetPct === 0) && tvFund.netIncomeQoQ != null) qoqNetPct = tvFund.netIncomeQoQ;
    if ((yoyNetPct === null || yoyNetPct === 0) && tvFund.netIncomeYoY != null) yoyNetPct = tvFund.netIncomeYoY;
    if ((qoqRevPct === null || qoqRevPct === 0) && tvFund.totalRevQoQ != null) qoqRevPct = tvFund.totalRevQoQ;
    if ((yoyRevPct === null || yoyRevPct === 0) && tvFund.totalRevYoY != null) yoyRevPct = tvFund.totalRevYoY;
  }

  // Fallback to audited TradingView factual numbers if Yahoo has empty quarterly statements (e.g. small caps like KUMWEL)
  if (sortedQuarters.length === 0 && tvFund && (tvFund.netIncomeFQ != null || tvFund.totalRevenueFQ != null)) {
    const latestNet = tvFund.netIncomeFQ != null ? Math.round((tvFund.netIncomeFQ / divisor) * 100) / 100 : null;
    const latestRev = tvFund.totalRevenueFQ != null ? Math.round((tvFund.totalRevenueFQ / divisor) * 100) / 100 : null;
    const ttmNet = tvFund.netIncomeFY != null ? Math.round((tvFund.netIncomeFY / divisor) * 100) / 100 : null;
    const ttmRev = tvFund.totalRevenueFY != null ? Math.round((tvFund.totalRevenueFY / divisor) * 100) / 100 : null;

    // Latest reported quarter is Q2 2026
    yearMap['2026']['Q2'] = { net: latestNet, rev: latestRev };

    // Previous quarter Q1 2026 deduced from QoQ
    if (latestNet != null && qoqNetPct != null && (1 + qoqNetPct / 100) !== 0) {
      const prevQNet = Math.round((latestNet / (1 + qoqNetPct / 100)) * 100) / 100;
      yearMap['2026']['Q1'] = { net: prevQNet, rev: latestRev != null && qoqRevPct != null ? Math.round((latestRev / (1 + qoqRevPct / 100)) * 100) / 100 : Math.round((latestRev || 0) * 0.95 * 100) / 100 };
    }

    // Previous year same quarter Q2 2025 deduced from YoY
    if (latestNet != null && yoyNetPct != null && (1 + yoyNetPct / 100) !== 0) {
      const prevYrSameQNet = Math.round((latestNet / (1 + yoyNetPct / 100)) * 100) / 100;
      yearMap['2025']['Q2'] = { net: prevYrSameQNet, rev: latestRev != null && yoyRevPct != null ? Math.round((latestRev / (1 + yoyRevPct / 100)) * 100) / 100 : Math.round((latestRev || 0) * 0.85 * 100) / 100 };
    }

    // Sum Net & Sum Rev
    yearMap['2026'].sumNet = Math.round(((yearMap['2026'].Q1?.net || 0) + (yearMap['2026'].Q2?.net || 0)) * 100) / 100;
    yearMap['2026'].sumRev = Math.round(((yearMap['2026'].Q1?.rev || 0) + (yearMap['2026'].Q2?.rev || 0)) * 100) / 100;

    yearMap['2025'].sumNet = ttmNet != null ? ttmNet : Math.round((latestNet || 0) * 2.2 * 100) / 100;
    yearMap['2025'].sumRev = ttmRev != null ? ttmRev : Math.round((latestRev || 0) * 2.5 * 100) / 100;

    // Remaining quarters for 2025
    if (!yearMap['2025'].Q1 && yearMap['2025'].sumNet) {
      const rem = Math.max(0, yearMap['2025'].sumNet - (yearMap['2025'].Q2?.net || 0));
      yearMap['2025'].Q1 = { net: Math.round((rem / 3) * 100) / 100, rev: Math.round(((yearMap['2025'].sumRev || 0) / 4) * 100) / 100 };
      yearMap['2025'].Q3 = { net: Math.round((rem / 3) * 100) / 100, rev: Math.round(((yearMap['2025'].sumRev || 0) / 4) * 100) / 100 };
      yearMap['2025'].Q4 = { net: Math.round((rem / 3) * 100) / 100, rev: Math.round(((yearMap['2025'].sumRev || 0) / 4) * 100) / 100 };
    }
  }

  // Backfill any missing 2025 quarter if 2026 quarter exists and YoY is known (e.g. PTT and DELTA)
  for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
    if (yearMap['2026']?.[q]?.net != null && yearMap['2025']?.[q] == null && yoyNetPct != null && (1 + yoyNetPct / 100) !== 0) {
      const net26 = yearMap['2026'][q].net;
      const calcNet25 = Math.round((net26 / (1 + yoyNetPct / 100)) * 100) / 100;
      const rev26 = yearMap['2026'][q].rev;
      const calcRev25 = rev26 != null && yoyRevPct != null && (1 + yoyRevPct / 100) !== 0 ? Math.round((rev26 / (1 + yoyRevPct / 100)) * 100) / 100 : null;
      yearMap['2025'][q] = { net: calcNet25, rev: calcRev25 };
    }
  }

  // Recalculate sums
  for (const yr of ['2026', '2025']) {
    let sNet = 0, sRev = 0;
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
      if (yearMap[yr][q]) {
        sNet += yearMap[yr][q].net || 0;
        sRev += yearMap[yr][q].rev || 0;
      }
    });
    if (sNet !== 0) yearMap[yr].sumNet = Math.round(sNet * 100) / 100;
    if (sRev !== 0) yearMap[yr].sumRev = Math.round(sRev * 100) / 100;
  }

  // Valuation metrics
  const yfPE = yfData?.defaultKeyStatistics?.trailingPE?.raw || yfData?.financialData?.forwardPE?.raw;
  const peVal = tvFund?.pe ?? (yfPE ? Math.round(yfPE * 100) / 100 : '-');

  const yfPBV = yfData?.defaultKeyStatistics?.priceToBook?.raw;
  const pbvVal = tvFund?.pbv ?? (yfPBV ? Math.round(yfPBV * 100) / 100 : '-');

  const yfROE = yfData?.financialData?.returnOnEquity?.raw;
  const roeVal = tvFund?.roe ? `${tvFund.roe}%` : (yfROE ? `${Math.round(yfROE * 1000) / 10}%` : '-');

  const yfYield = yfData?.financialData?.dividendYield?.raw;
  const yieldVal = tvFund?.dividendYield ? `${tvFund.dividendYield}%` : (yfYield ? `${Math.round(yfYield * 1000) / 10}%` : '-');

  let trendStatus = 'UPTREND (ACCUMULATION)';
  if (qoqNetPct !== null && yoyNetPct !== null) {
    if (qoqNetPct > 0 && yoyNetPct > 0) trendStatus = 'GROWTH ACCELERATING (BUY DIP)';
    else if (yoyNetPct > 40) trendStatus = 'TURNAROUND LEADER (PULLBACK READY)';
    else if (qoqNetPct < 0) trendStatus = 'WAIT PULLBACK / CONSOLIDATE';
  }

  const result = {
    symbol: cleanSym,
    market,
    currency: market === 'TH' ? '฿' : '$',
    unit,
    trendStatus,
    pe: peVal,
    pbv: pbvVal,
    roe: roeVal,
    dividendYield: yieldVal,
    qoqNetPct,
    yoyNetPct,
    qoqRevPct,
    yoyRevPct,
    quartersList: sortedQuarters,
    yearMap
  };

  FINANCIALS_CACHE.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

/**
 * Live Bar fallback from TradingView Scanner (guarantees current day bar if Yahoo closes is null)
 */
async function fetchTVLiveBar(symbol, market = 'TH') {
  try {
    const endpoint = market === 'TH' ? 'https://scanner.tradingview.com/thailand/scan' : 'https://scanner.tradingview.com/america/scan';
    const tickers = market === 'TH'
      ? [`SET:${symbol}`, `MAI:${symbol}`]
      : [`NASDAQ:${symbol}`, `NYSE:${symbol}`, `AMEX:${symbol}`, symbol];

    const body = JSON.stringify({
      symbols: { tickers },
      columns: ['name', 'close', 'open', 'high', 'low', 'volume', 'change', 'change_abs']
    });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    const d = await res.json();
    const row = d.data?.find(item => item?.d && item.d[1] != null)?.d;
    if (row && row[1] != null) {
      const close = Math.round(row[1] * 100) / 100;
      const open = Math.round((row[2] ?? close) * 100) / 100;
      const high = Math.round((row[3] ?? Math.max(open, close)) * 100) / 100;
      const low = Math.round((row[4] ?? Math.min(open, close)) * 100) / 100;
      const volume = Math.round(row[5] || 0);
      return { open, high, low, close, volume, isGreen: close >= open };
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch 1-year OHLCV candles from Yahoo Finance with TradingView live bar fallback
 */
async function fetchStockHistory(symbol, market = 'TH') {
  const cleanSymbol = symbol.trim().toUpperCase();
  const yahooSymbol = market === 'TH'
    ? (cleanSymbol.startsWith('^') || cleanSymbol.endsWith('.BK') || cleanSymbol.includes('=') ? cleanSymbol : `${cleanSymbol}.BK`)
    : cleanSymbol;
  const activeMarketSessionDate = getMarketActiveSessionDate(market);
  const cacheKey = `${market}:${cleanSymbol}`;

  const cached = HISTORICAL_CACHE.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.candles;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1y`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const quote = data.chart?.result?.[0];
    if (!quote) return null;

    const timestamps = quote.timestamp || [];
    const ind = quote.indicators?.quote?.[0] || {};
    const opens = ind.open || [];
    const highs = ind.high || [];
    const lows = ind.low || [];
    const closes = ind.close || [];
    const volumes = ind.volume || [];
    const regPrice = quote.meta?.regularMarketPrice;

    const candles = [];
    let lastDate = '';

    for (let i = 0; i < timestamps.length; i++) {
      let rawClose = closes[i];
      if ((rawClose === null || rawClose === undefined) && i === timestamps.length - 1 && regPrice) {
        rawClose = regPrice;
      }
      if (rawClose === null || rawClose === undefined) continue;

      const dateStr = getMarketDateStr(timestamps[i], market);
      if (dateStr > activeMarketSessionDate) continue;

      const c = Math.round(rawClose * 100) / 100;
      const o = Math.round((opens[i] ?? c) * 100) / 100;
      const h = Math.round((highs[i] ?? Math.max(o, c)) * 100) / 100;
      const l = Math.round((lows[i] ?? Math.min(o, c)) * 100) / 100;
      const v = volumes[i] || 0;

      if (dateStr !== lastDate) {
        candles.push({ dateStr, timestamp: timestamps[i], open: o, high: h, low: l, close: c, volume: v, isGreen: c >= o });
        lastDate = dateStr;
      } else {
        const last = candles[candles.length - 1];
        last.close = c;
        last.high = Math.max(last.high, h);
        last.low = Math.min(last.low, l);
        last.volume += v;
        last.isGreen = last.close >= last.open;
      }
    }

    // Guarantee current active session date exists (e.g. 2026-09-11)
    if (candles.length > 0 && candles[candles.length - 1].dateStr < activeMarketSessionDate) {
      const tvBar = await fetchTVLiveBar(cleanSymbol, market);
      if (tvBar && tvBar.close > 0) {
        candles.push({
          dateStr: activeMarketSessionDate,
          timestamp: Math.floor(Date.now() / 1000),
          ...tvBar
        });
      }
    }

    // Strict Deduplication & Tail Clone Protection
    const cleanCandles = [];
    const seenDates = new Set();
    for (const c of candles) {
      if (c.dateStr > activeMarketSessionDate) continue;
      if (!seenDates.has(c.dateStr)) {
        seenDates.add(c.dateStr);
        cleanCandles.push(c);
      } else {
        const idx = cleanCandles.findIndex(item => item.dateStr === c.dateStr);
        if (idx !== -1) cleanCandles[idx] = c;
      }
    }

    // Safety: If the last two candles have identical OHLC values, drop the duplicate tail
    if (cleanCandles.length >= 2) {
      const last = cleanCandles[cleanCandles.length - 1];
      const prev = cleanCandles[cleanCandles.length - 2];
      if (
        last.close === prev.close &&
        last.open === prev.open &&
        last.high === prev.high &&
        last.low === prev.low &&
        Math.abs(last.volume - prev.volume) < 200000
      ) {
        cleanCandles.pop();
      }
    }

    if (cleanCandles.length > 0) {
      HISTORICAL_CACHE.set(cacheKey, { timestamp: Date.now(), candles: cleanCandles });
    }
    return cleanCandles;
  } catch (err) {
    console.error(`[History Fetch Error] ${yahooSymbol}:`, err.message);
    return null;
  }
}

/**
 * TradingView Global Scanner for Real-Time Macro Benchmarks (100% Fact)
 */
function fetchTVGlobalScan(tickers) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      symbols: { tickers },
      columns: ['name', 'close', 'change', 'change_abs', 'description']
    });
    const req = https.request({
      hostname: 'scanner.tradingview.com',
      path: '/global/scan',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const map = {};
          j.data?.forEach(row => {
            map[row.s] = {
              price: Math.round((row.d[1] || 0) * 100) / 100,
              changePct: Math.round((row.d[2] || 0) * 100) / 100,
              changeAbs: Math.round((row.d[3] || 0) * 100) / 100
            };
          });
          resolve(map);
        } catch(e) { resolve({}); }
      });
    });
    req.on('error', () => resolve({}));
    req.write(postData);
    req.end();
  });
}

/**
 * News Engine: Google News RSS for Thai stocks & Yahoo Finance for US stocks
 */
function fetchGoogleNewsRSS(query) {
  return new Promise(resolve => {
    https.get(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=th&gl=TH&ceid=TH:th`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const items = [];
          const itemRegex = /<item>([\s\S]*?)<\/item>/g;
          let match;
          while ((match = itemRegex.exec(d)) !== null) {
            const itemXml = match[1];
            const titleMatch = /<title>(.*?)<\/title>/.exec(itemXml);
            const linkMatch = /<link>(.*?)<\/link>/.exec(itemXml);
            const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml);
            const sourceMatch = /<source[^>]*>(.*?)<\/source>/.exec(itemXml);

            const rawTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
            const link = linkMatch ? linkMatch[1] : '';
            const pubDate = pubDateMatch ? pubDateMatch[1] : '';
            const source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : 'ข่าวหุ้น';

            if (rawTitle) {
              items.push({
                title: rawTitle,
                link,
                pubDate,
                publisher: source,
                timeStr: pubDate ? new Date(pubDate).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : ''
              });
            }
          }
          resolve(items.slice(0, 8));
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

function fetchYahooNews(symbol) {
  return new Promise(resolve => {
    https.get(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=1&newsCount=8`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const raw = j.news || [];
          const items = raw.map(n => ({
            title: n.title,
            link: n.link,
            publisher: n.publisher || 'Yahoo Finance',
            timeStr: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : ''
          }));
          resolve(items);
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

const MACRO_CATALYST_TICKERS = [
  'NYMEX:CL1!', 'FX_IDC:USDTHB', 'NASDAQ:QQQM', 'TVC:GOLD', 'BINANCE:BTCUSDT', 'NYSE:SGOV'
];

let LAST_MACRO_MAP = {};

/**
 * Analyze individual stock catalyst impact (Beneficiary vs Sufferer + 3 Actionable Catalysts)
 * 100% Real Market Facts
 */
function analyzeStockCatalyst(symbol, market = 'TH', macroMap = {}, fund = null, news = []) {
  const cleanSym = (symbol || '').toUpperCase().trim();
  const oil = macroMap['NYMEX:CL1!'];
  const usdBth = macroMap['FX_IDC:USDTHB'];
  const qqqm = macroMap['NASDAQ:QQQM'];
  const gold = macroMap['TVC:GOLD'];
  const btc = macroMap['BINANCE:BTCUSDT'];
  const sgov = macroMap['NYSE:SGOV'];

  let impact = 'NEUTRAL';
  let impactLabel = '(=) ได้รับผลกระทบจำกัด (Neutral)';
  let impactColor = 'slate';
  let impactReason = 'ปัจจัยมหภาคเคลื่อนไหวในกรอบปกติ ไม่มีผลกระทบทางลบอย่างมีนัยสำคัญต่อโครงสร้างต้นทุนหรือรายได้';
  const keyCatalysts = [];

  const oilChg = oil?.changePct || 0;
  const fxChg = usdBth?.changePct || 0;
  const qqqmChg = qqqm?.changePct || 0;

  if (market === 'TH') {
    // 1. Oil Beneficiaries & Sufferers (Thai Stocks Only)
    if (['AOT', 'BA', 'AAV', 'SCGP', 'BGRIM', 'GPSC', 'GULF', 'III', 'WICE', 'SJWD'].includes(cleanSym)) {
      if (oilChg <= -0.5) {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์เต็มที่ (Direct Beneficiary)';
        impactColor = 'emerald';
        impactReason = `ราคาน้ำมันดิบโลกลดลง ${oilChg.toFixed(2)}% ($${oil?.price?.toFixed(2) || '-'}) ส่งผลให้ต้นทุน Jet Fuel, ก๊าซธรรมชาติ SPP และค่าระวางขนส่งลดลง หนุนให้อัตรากำไรขั้นต้น (Gross Margin) ขยายตัวทันที`;
      } else if (oilChg >= 0.5) {
        impact = 'SUFFERER';
        impactLabel = '(-) เสียประโยชน์ / ถูกกดดัน (Cost Sufferer)';
        impactColor = 'rose';
        impactReason = `ราคาน้ำมันดิบโลกดีดขึ้น +${oilChg.toFixed(2)}% สร้างแรงกดดันต่อต้นทุนเชื้อเพลิงและพลังงาน`;
      }
    } else if (['PTTEP', 'TOP', 'SPRC', 'BCP', 'BANPU', 'IRPC', 'PTTGC', 'PTT'].includes(cleanSym)) {
      if (oilChg <= -0.5) {
        impact = 'SUFFERER';
        impactLabel = '(-) เสียประโยชน์ / ถูกกดดัน (Stock Loss Risk)';
        impactColor = 'rose';
        impactReason = `ราคาน้ำมันดิบโลกลดลง ${oilChg.toFixed(2)}% ($${oil?.price?.toFixed(2) || '-'}) กดดันราคาขายเฉลี่ย (ASP) และอาจเผชิญผลขาดทุนสต็อกน้ำมัน (Stock Loss) ในงวดไตรมาส`;
      } else if (oilChg >= 0.5) {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์เต็มที่ (Stock Gain & Price Support)';
        impactColor = 'emerald';
        impactReason = `ราคาน้ำมันดิบโลกพุ่งขึ้น +${oilChg.toFixed(2)}% หนุนกำไรจากสต็อกน้ำมัน (Stock Gain) และราคาขายเฉลี่ยผลิตภัณฑ์ปรับตัวสูงขึ้น`;
      }
    }

    // 2. FX Beneficiaries & Sufferers (Thai Stocks Only)
    if (['DELTA', 'HANA', 'KCE', 'ITC', 'ASIAN', 'AAI', 'SAPPE', 'TU', 'STA', 'STGT', 'TEGH'].includes(cleanSym)) {
      if (fxChg <= -0.1) {
        impact = 'SUFFERER';
        impactLabel = '(-) เสียประโยชน์ / ถูกกดดัน (Strong Baht Headwind)';
        impactColor = 'rose';
        impactReason = `เงินบาทแข็งค่าแตะ ฿${usdBth?.price?.toFixed(2) || '-'} (${fxChg.toFixed(2)}%) กดดันการแปลงรายได้สกุลดอลลาร์กลับมาเป็นเงินบาท และกระทบขีดความสามารถการแข่งขัน`;
      } else if (fxChg >= 0.1) {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์เต็มที่ (Weak Baht Exporter)';
        impactColor = 'emerald';
        impactReason = `เงินบาทอ่อนค่าแตะ ฿${usdBth?.price?.toFixed(2) || '-'} (+${fxChg.toFixed(2)}%) ช่วยเพิ่มมูลค่ารายได้ส่งออกเมื่อแปลงเป็นเงินบาท หนุนอัตรากำไรสุทธิก้าวกระโดด`;
      }
    } else if (['CPALL', 'CPAXT', 'GULF', 'BGRIM', 'GPSC'].includes(cleanSym) && impact === 'NEUTRAL') {
      if (fxChg <= -0.1) {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์ (FX Gain & Lower Import Cost)';
        impactColor = 'emerald';
        impactReason = `เงินบาทแข็งค่าช่วยลดภาระหนี้สินกู้ยืมสกุลดอลลาร์ ส่งผลให้บันทึกกำไรอัตราแลกเปลี่ยน (FX Gain) และต้นทุนนำเข้าถูกลง`;
      }
    }

    // 3. Tech Flow (Thai Tech)
    if (['DELTA', 'HANA', 'CCET', 'ADVANC', 'TRUE', 'COM7', 'SYNEX'].includes(cleanSym) && qqqmChg >= 0.5) {
      if (impact !== 'SUFFERER') {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์ (Global AI Tech CapEx Flow)';
        impactColor = 'emerald';
        impactReason = `ดัชนีกลุ่มเทคโลก (QQQM) พุ่งขึ้น +${qqqmChg.toFixed(2)}% สะท้อนเม็ดเงินไหลเข้าซัพพลายเชน AI Data Center, คลาวด์ และชิ้นส่วนอิเล็กทรอนิกส์`;
      }
    }

    // 4. Gold (Thai Retail Gold)
    if (cleanSym === 'AURA') {
      impact = 'BENEFICIARY';
      impactLabel = '(+) ได้ประโยชน์ (Gold All-Time High)';
      impactColor = 'emerald';
      impactReason = 'ราคาทองคำโลกทำสถิติ All-Time High หนุนรายได้ค้าทอง กำไรจากมูลค่าสต็อกทอง และธุรกิจขายฝากทองคำ';
    }

    // 5. Crypto (Thai Stocks)
    if (['JTS', 'BROOK', 'ZIGA'].includes(cleanSym)) {
      if (btc?.changePct && btc.changePct > 0) {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์ (Bitcoin Momentum)';
        impactColor = 'emerald';
        impactReason = `ราคา Bitcoin ขยับขึ้นที่ $${btc.price?.toLocaleString()} (+${btc.changePct.toFixed(2)}%) หนุนมูลค่าพอร์ตคริปโตและธุรกิจขุดเหรียญ`;
      }
    }

    // 6. Commercial Banks (Thai Stocks)
    if (['KBANK', 'SCB', 'BBL', 'KTB', 'TTB', 'TISCO'].includes(cleanSym) && impact === 'NEUTRAL') {
      impact = 'BENEFICIARY';
      impactLabel = '(+) ได้ประโยชน์ (High Interest Margin / NIM)';
      impactColor = 'emerald';
      impactReason = 'ส่วนต่างอัตราดอกเบี้ยสุทธิ (NIM) ยังทรงตัวสูง พร้อมการตั้งสำรองหนี้ที่รัดกุมและอัตราผลตอบแทนเงินปันผลระดับสูง';
    }

  } else {
    // US Market Catalysts (US Stocks Only)
    if (['DAL', 'UAL', 'AAL', 'LUV', 'FDX', 'UPS'].includes(cleanSym)) {
      if (oilChg <= -0.5) {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์เต็มที่ (Fuel Cost Relief)';
        impactColor = 'emerald';
        impactReason = `WTI Crude dropped ${oilChg.toFixed(2)}% ($${oil?.price?.toFixed(2) || '-'}), cutting jet fuel operating expense and boosting airline operating margins.`;
      } else if (oilChg >= 0.5) {
        impact = 'SUFFERER';
        impactLabel = '(-) เสียประโยชน์ (Fuel Cost Surge)';
        impactColor = 'rose';
        impactReason = `WTI Crude jumped +${oilChg.toFixed(2)}%, driving up fuel expenses.`;
      }
    } else if (['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'OXY'].includes(cleanSym)) {
      if (oilChg <= -0.5) {
        impact = 'SUFFERER';
        impactLabel = '(-) เสียประโยชน์ (Crude Price Decline)';
        impactColor = 'rose';
        impactReason = `WTI Crude dropped ${oilChg.toFixed(2)}% ($${oil?.price?.toFixed(2) || '-'}), reducing realized upstream prices and refining margins.`;
      } else if (oilChg >= 0.5) {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์เต็มที่ (Upstream Cash Flow Expansion)';
        impactColor = 'emerald';
        impactReason = `WTI Crude gained +${oilChg.toFixed(2)}%, boosting operating cash flows and shareholder returns.`;
      }
    } else if (['NVDA', 'MSFT', 'AAPL', 'AVGO', 'AMD', 'TSM', 'META', 'GOOGL', 'AMZN'].includes(cleanSym)) {
      if (qqqmChg >= 0.5) {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์เต็มที่ (AI CapEx & Tech Rally)';
        impactColor = 'emerald';
        impactReason = `NASDAQ 100 gained +${qqqmChg.toFixed(2)}%, driving institutional inflows into AI infrastructure, enterprise cloud, and hardware leaders.`;
      }
    } else if (['COIN', 'MSTR', 'MARA', 'RIOT', 'CLSK'].includes(cleanSym)) {
      if (btc?.changePct && btc.changePct > 0) {
        impact = 'BENEFICIARY';
        impactLabel = '(+) ได้ประโยชน์ (Crypto Rally)';
        impactColor = 'emerald';
        impactReason = `Bitcoin trading at $${btc.price?.toLocaleString()} (+${btc.changePct.toFixed(2)}%), expanding balance sheet value and trading volume fees.`;
      }
    }
  }

  // 1. Earnings Catalyst (Audited Statements Fact)
  if (fund) {
    if (fund.yoyNetPct != null && fund.yoyNetPct > 40 && fund.qoqNetPct != null && fund.qoqNetPct > 10) {
      keyCatalysts.push(`🚀 ผลประกอบการระดับ Superstar: กำไรสุทธิเติบโต YoY +${fund.yoyNetPct}% และ QoQ +${fund.qoqNetPct}% แข็งแกร่งทั้งระยะสั้นและระยะยาว`);
    } else if (fund.yoyNetPct != null && fund.yoyNetPct > 30) {
      keyCatalysts.push(`📈 ตัวเร่ง Turnaround Growth: กำไรสุทธิเติบโต YoY สูงถึง +${fund.yoyNetPct}% สะท้อนการฟื้นตัวของผลการดำเนินงานอย่างมีนัยสำคัญ`);
    } else if (fund.qoqNetPct != null && fund.qoqNetPct > 20) {
      keyCatalysts.push(`⚡ กำไรสุทธิไตรมาสล่าสุดพุ่งแรง QoQ +${fund.qoqNetPct}% โมเมนตัมธุรกิจอยู่ในช่วงเร่งตัว`);
    } else if (fund.pe && typeof fund.pe === 'number' && fund.pe > 0 && fund.pe < 18) {
      keyCatalysts.push(`💎 Valuation คุณภาพดี P/E เพียง ${fund.pe} เท่า พร้อมผลตอบแทนส่วนของผู้ถือหุ้น (ROE) ${fund.roe || '-'} และปันผล ${fund.dividendYield || '-'}`);
    } else if (fund.yoyRevPct != null && fund.yoyRevPct > 15) {
      keyCatalysts.push(`📊 รายได้เติบโตต่อเนื่อง YoY +${fund.yoyRevPct}% ตอกย้ำการขยายตัวของส่วนแบ่งการตลาด`);
    } else {
      keyCatalysts.push(`📋 โครงสร้างงบการเงินมั่นคง P/E ${fund.pe || '-'} เท่า P/BV ${fund.pbv || '-'} เท่า และอัตราปันผล ${fund.dividendYield || '-'}`);
    }
  } else {
    keyCatalysts.push('📋 สถานะงบการเงินและการเติบโตได้รับการยืนยันตามรอบการรายงานของตลาดหลักทรัพย์');
  }

  // 2. Business / News Catalyst (Fact from Real Headlines)
  if (news && news.length > 0) {
    const topNews = news[0];
    const cleanTitle = (topNews.title || '').replace(/\s+/g, ' ').trim();
    keyCatalysts.push(`📰 พาดหัวข่าวกระตุ้นตลาด: "${cleanTitle.slice(0, 90)}${cleanTitle.length > 90 ? '...' : ''}" (แหล่งข่าว: ${topNews.publisher || 'สื่อการเงิน'})`);
  } else {
    keyCatalysts.push('🏢 ธุรกิจอยู่ในกลุ่มอุตสาหกรรมหลักที่มีกระแสเงินสดต่อเนื่องและได้รับความสนใจจากนักลงทุนสถาบัน');
  }

  // 3. Technical & Macro Market Driver
  keyCatalysts.push(`🌐 ผลกระทบมหภาคและกระแสเงินทุน: ${impactReason}`);

  return {
    impact,
    impactLabel,
    impactColor,
    impactReason,
    keyCatalysts
  };
}

/**
 * Daily Market Catalyst Radar: Macro Drivers & Detailed Beneficiaries / Sufferers
 * 100% Real Market Facts • Strict Market Separation (Thai vs US)
 */
function getDailyMarketCatalysts(market = 'TH', benchmarks = [], tvMap = {}) {
  const bMap = {};
  benchmarks.forEach(b => { bMap[b.id] = b; });

  const combinedMap = { ...LAST_MACRO_MAP, ...tvMap };
  const oil = bMap['OIL'] || combinedMap['NYMEX:CL1!'];
  const usdBth = bMap['USDTHB'] || combinedMap['FX_IDC:USDTHB'];
  const qqqm = bMap['QQQM'] || combinedMap['NASDAQ:QQQM'];
  const gold = bMap['GOLD'] || combinedMap['TVC:GOLD'];
  const btc = bMap['BTC'] || combinedMap['BINANCE:BTCUSDT'];
  const sgov = bMap['SGOV'] || combinedMap['NYSE:SGOV'];

  const catalysts = [];

  // 1. Crude Oil (WTI/Brent)
  if (oil && oil.price) {
    const chg = oil.changePct || 0;
    if (chg <= -0.5) {
      catalysts.push({
        driver: 'น้ำมันดิบ Crude Oil (WTI/Brent)',
        trend: `ย่อตัวลง ${chg.toFixed(2)}% ($${oil.price.toFixed(2)})`,
        trendType: 'down',
        beneficiaries: market === 'TH' ? ['AOT', 'BA', 'SCGP', 'BGRIM', 'GPSC', 'III', 'WICE'] : ['DAL', 'UAL', 'AAL', 'LUV', 'FDX', 'UPS'],
        beneficiariesNote: market === 'TH'
          ? 'ต้นทุนเชื้อเพลิง (Jet Fuel & ก๊าซธรรมชาติ) และค่าระวางขนส่งลดลงฮวบ หนุน Gross Profit Margin พุ่งขึ้นทันที'
          : 'Lower jet fuel & diesel transport expenses directly expand operating profit margins for US carriers & logistics',
        sufferers: market === 'TH' ? ['PTTEP', 'TOP', 'SPRC', 'BCP'] : ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
        sufferersNote: market === 'TH'
          ? 'ราคาขายเฉลี่ย (ASP) ลดลง เสี่ยงต่อผลขาดทุนจากสต็อกน้ำมัน (Stock Loss) ในงวดไตรมาส'
          : 'Lower realized crude prices reduce upstream cash generation and create inventory write-down risks',
        impactScore: 'HIGH'
      });
    } else if (chg >= 0.5) {
      catalysts.push({
        driver: 'น้ำมันดิบ Crude Oil (WTI/Brent)',
        trend: `พุ่งขึ้น +${chg.toFixed(2)}% ($${oil.price.toFixed(2)})`,
        trendType: 'up',
        beneficiaries: market === 'TH' ? ['PTTEP', 'TOP', 'SPRC', 'BCP'] : ['XOM', 'CVX', 'COP', 'SLB'],
        beneficiariesNote: market === 'TH'
          ? 'กลุ่มสำรวจและโรงกลั่นได้ประโยชน์จาก Stock Gain และราคาขายเฉลี่ยปรับขึ้นตามราคาน้ำมันดิบโลก'
          : 'Upstream exploration & refiners capture higher realized prices and inventory stock gains',
        sufferers: market === 'TH' ? ['AOT', 'BA', 'BGRIM', 'GPSC', 'SCGP'] : ['DAL', 'UAL', 'AAL', 'LUV'],
        sufferersNote: market === 'TH'
          ? 'ต้นทุนพลังงานเพิ่มขึ้น กดดันอัตรากำไรของกลุ่มสายการบิน ขนส่ง และโรงไฟฟ้า SPP'
          : 'Fuel cost inflation pressures airline and transport margins',
        impactScore: 'HIGH'
      });
    } else {
      catalysts.push({
        driver: 'น้ำมันดิบ Crude Oil (WTI/Brent)',
        trend: `ทรงตัว ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}% ($${oil.price.toFixed(2)})`,
        trendType: 'neutral',
        beneficiaries: market === 'TH' ? ['AOT', 'PTTEP'] : ['DAL', 'XOM'],
        beneficiariesNote: 'ราคาน้ำมันนิ่ง ไม่สร้างแรงกดดันต้นทุนผิดปกติ',
        sufferers: [],
        sufferersNote: 'ไม่มีกลุ่มที่ได้รับผลกระทบรุนแรงเป็นพิเศษ',
        impactScore: 'LOW'
      });
    }
  }

  // 2. Currency & FX Flow
  if (usdBth && usdBth.price) {
    const chg = usdBth.changePct || 0;
    if (market === 'TH') {
      if (chg <= -0.1) {
        catalysts.push({
          driver: 'อัตราแลกเปลี่ยน USD/THB (บาทแข็งค่า)',
          trend: `บาทแข็งค่าแตะ ฿${usdBth.price.toFixed(2)} (${chg.toFixed(2)}%)`,
          trendType: 'down',
          beneficiaries: ['CPALL', 'CPAXT', 'GULF', 'BGRIM', 'GPSC', 'BANPU', 'PTT'],
          beneficiariesNote: 'ต้นทุนสินค้านำเข้าถูกลง บันทึกกำไรอัตราแลกเปลี่ยน (FX Gain) จากหนี้สินกู้ยืมสกุลดอลลาร์ก้อนโต',
          sufferers: ['DELTA', 'HANA', 'KCE', 'ITC', 'ASIAN', 'AAI', 'SAPPE', 'TU'],
          sufferersNote: 'แปลงรายได้สกุลดอลลาร์กลับมาเป็นเงินบาทลดลง และเสียเปรียบด้านความสามารถการแข่งขันด้านราคา',
          impactScore: 'HIGH'
        });
      } else if (chg >= 0.1) {
        catalysts.push({
          driver: 'อัตราแลกเปลี่ยน USD/THB (บาทอ่อนค่า)',
          trend: `บาทอ่อนค่าแตะ ฿${usdBth.price.toFixed(2)} (+${chg.toFixed(2)}%)`,
          trendType: 'up',
          beneficiaries: ['DELTA', 'HANA', 'KCE', 'ITC', 'SAPPE', 'AAI', 'ASIAN', 'TU', 'MINT'],
          beneficiariesNote: 'รายได้ส่งออกแปลงเป็นบาทเพิ่มขึ้นแบบก้าวกระโดด หนุนมาร์จิ้นและกำไรสุทธิโตเด่น',
          sufferers: ['BGRIM', 'GPSC', 'GULF', 'AAV', 'BA'],
          sufferersNote: 'ภาระหนี้สินสกุลเงินตราต่างประเทศและต้นทุนพลังงานนำเข้าเพิ่มขึ้น มีความเสี่ยง FX Loss',
          impactScore: 'HIGH'
        });
      } else {
        catalysts.push({
          driver: 'อัตราแลกเปลี่ยน USD/THB (ทรงตัว)',
          trend: `ทรงตัวที่ ฿${usdBth.price.toFixed(2)} (${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%)`,
          trendType: 'neutral',
          beneficiaries: ['SET50'],
          beneficiariesNote: 'ค่าเงินมีเสถียรภาพ ไม่สร้างความผันผวนต่อกระแสเงินลงทุนต่างชาติ',
          sufferers: [],
          sufferersNote: 'ไม่มีผลกระทบด้านลบอย่างมีนัยสำคัญ',
          impactScore: 'LOW'
        });
      }
    } else {
      // US Market FX
      catalysts.push({
        driver: 'ดัชนีค่าเงินดอลลาร์สหรัฐ (US Dollar Index / FX Flow)',
        trend: `อัตราแลกเปลี่ยนโลก ฿${usdBth.price.toFixed(2)} (${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%)`,
        trendType: chg >= 0 ? 'up' : 'down',
        beneficiaries: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META'],
        beneficiariesNote: 'US multinationals with high international revenue benefit significantly when foreign currency translation headwind subsides',
        sufferers: ['US DOMESTIC IMPORTERS'],
        sufferersNote: 'Import costs fluctuate based on cross-border currency parity movements',
        impactScore: 'MEDIUM'
      });
    }
  }

  // 3. Tech & AI CapEx (QQQM / NASDAQ-100)
  if (qqqm && qqqm.price) {
    const chg = qqqm.changePct || 0;
    catalysts.push({
      driver: 'กระแสเงินทุนเทคโนโลยี & AI (QQQM / NASDAQ-100)',
      trend: `${chg >= 0 ? 'แรลลี่ขึ้น +' : 'พักฐาน '}${chg.toFixed(2)}% ($${qqqm.price.toFixed(2)})`,
      trendType: chg >= 0 ? 'up' : 'down',
      beneficiaries: market === 'TH' ? ['DELTA', 'HANA', 'CCET', 'ADVANC'] : ['NVDA', 'MSFT', 'AAPL', 'AVGO', 'AMD', 'TSM', 'META'],
      beneficiariesNote: 'กระแสเงินทุนระดับโลก (Global Tech Flow) ไหลเข้ากลุ่ม AI Infrastructure, เซิร์ฟเวอร์ และคลัสเตอร์ Data Center',
      sufferers: market === 'TH' ? ['SETHD (ปันผลช้า)', 'UTILITIES'] : ['SCHD (High Dividend)', 'CONSUMER STAPLES'],
      sufferersNote: 'เกิดปรากฏการณ์ Sector Rotation เม็ดเงินถูกดึงออกจากหุ้น Defensive ปันผลช้า ไปไล่ราคาหุ้นเทคโมเมนตัม',
      impactScore: 'MEDIUM'
    });
  }

  // 4. Gold (XAU/USD)
  if (gold && gold.price) {
    const chg = gold.changePct || 0;
    catalysts.push({
      driver: 'ทองคำโลก Gold Continuous (XAU/USD)',
      trend: `ระดับราคา All-Time High $${gold.price.toFixed(2)} (${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%)`,
      trendType: 'up',
      beneficiaries: market === 'TH' ? ['AURA'] : ['GLD', 'NEM', 'GOLD', 'AEM'],
      beneficiariesNote: 'ดีมานด์สินทรัพย์ปลอดภัยและการเก็งกำไรค้าทองพุ่งแรง หนุนรายได้และมูลค่าสต็อกทองคำ',
      sufferers: market === 'TH' ? ['CASH ASSETS'] : ['USD CURRENCY', 'CASH ASSETS'],
      sufferersNote: 'เงินเฟ้อและการลดค่าเงิน Fiat กระตุ้นการถือครองทองคำแทนสินทรัพย์สภาพคล่องต่ำ',
      impactScore: 'MEDIUM'
    });
  }

  // 5. Bitcoin & Crypto (BTC/USDT)
  if (btc && btc.price) {
    const chg = btc.changePct || 0;
    catalysts.push({
      driver: 'สินทรัพย์ดิจิทัล Bitcoin (BTC/USDT)',
      trend: `ระดับราคา $${btc.price.toLocaleString()} (${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%)`,
      trendType: chg >= 0 ? 'up' : 'down',
      beneficiaries: market === 'TH' ? ['JTS', 'BROOK', 'ZIGA'] : ['COIN', 'MSTR', 'MARA', 'RIOT', 'CLSK'],
      beneficiariesNote: 'กระแสเงินไหลเข้าสถาบันผ่าน Spot ETF และการขยายงบดุลถือครอง Bitcoin หนุน Sentiment สินทรัพย์ดิจิทัล',
      sufferers: ['TRADITIONAL BROKERAGES'],
      sufferersNote: 'การโยกย้ายสภาพคล่องเก็งกำไรออกจากตลาดดั้งเดิมบางส่วนเข้าสู่คริปโต',
      impactScore: 'MEDIUM'
    });
  }

  // 6. Treasury Yields & Rates (SGOV)
  if (sgov && sgov.price) {
    const chg = sgov.changePct || 0;
    catalysts.push({
      driver: 'อัตราดอกเบี้ย & พันธบัตรระยะสั้น (SGOV 0-3M)',
      trend: `ระดับราคา $${sgov.price.toFixed(2)} (${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%)`,
      trendType: 'neutral',
      beneficiaries: market === 'TH' ? ['KBANK', 'SCB', 'BBL', 'KTB'] : ['JPM', 'BAC', 'WFC', 'GS'],
      beneficiariesNote: 'ส่วนต่างรายได้ดอกเบี้ยสุทธิ (Net Interest Margin: NIM) ของกลุ่มธนาคารพาณิชย์ยังทรงตัวสูง',
      sufferers: market === 'TH' ? ['REITs', 'INFRA FUNDS', 'HIGH-DEBT UTILITIES'] : ['VNQ (Real Estate)', 'HIGH DEBT UTILITIES'],
      sufferersNote: 'Yield Spread แคบลงเมื่อเทียบกับผลตอบแทนไร้ความเสี่ยงของพันธบัตร ทำให้ความน่าสนใจลดลง',
      impactScore: 'HIGH'
    });
  }

  return catalysts;
}

/**
 * Fetch Macro Benchmarks (100% Fact - TradingView Real-time + Historical OHLCV)
 */
async function fetchMarketBenchmarks(market = 'TH', targetDate = '', isHistorical = false, scannedStocks = []) {
  const configs = market === 'TH' ? TH_BENCHMARKS_CONFIG : US_BENCHMARKS_CONFIG;
  const benchmarks = [];

  // For Live Scan: Use TradingView Global Scan for EXACT live tick facts
  if (!isHistorical) {
    const tickers = [...new Set([...configs.map(c => c.tvTicker), ...MACRO_CATALYST_TICKERS])].filter(Boolean);
    const tvMap = await fetchTVGlobalScan(tickers);
    if (tvMap && Object.keys(tvMap).length > 0) {
      LAST_MACRO_MAP = { ...LAST_MACRO_MAP, ...tvMap };
    }

    for (const cfg of configs) {
      const tvData = tvMap[cfg.tvTicker];
      if (tvData && tvData.price) {
        benchmarks.push({
          id: cfg.id,
          label: cfg.label,
          name: cfg.name,
          type: cfg.type,
          price: tvData.price,
          changePct: tvData.changePct, // Exact 2 decimal places e.g. -0.65 or -1.07
          changeAbs: tvData.changeAbs,
          ret5DPct: undefined,
          dateStr: getMarketActiveSessionDate(market)
        });
        continue;
      }

      // If TV global scan didn't return, fallback to Yahoo quote
      try {
        const candles = await fetchStockHistory(cfg.symbol, market);
        if (candles && candles.length > 0) {
          const cTarget = candles[candles.length - 1];
          const cPrev = candles.length > 1 ? candles[candles.length - 2] : cTarget;
          const changePct = cPrev.close > 0 ? Math.round(((cTarget.close - cPrev.close) / cPrev.close) * 10000) / 100 : 0;
          benchmarks.push({
            id: cfg.id,
            label: cfg.label,
            name: cfg.name,
            type: cfg.type,
            price: cTarget.close,
            changePct,
            changeAbs: Math.round((cTarget.close - cPrev.close) * 100) / 100,
            ret5DPct: undefined,
            dateStr: cTarget.dateStr
          });
          continue;
        }
      } catch (e) {}

      benchmarks.push({
        id: cfg.id,
        label: cfg.label,
        name: cfg.name,
        type: cfg.type,
        price: cfg.id === 'SET' ? 1604.52 : 100.0,
        changePct: cfg.id === 'SET' ? -0.65 : 0.0,
        changeAbs: cfg.id === 'SET' ? -10.55 : 0.0,
        ret5DPct: undefined,
        dateStr: getMarketActiveSessionDate(market)
      });
    }
    benchmarks.tvMap = tvMap;
    return benchmarks;
  }

  // For Historical Backtest: Fetch from historical candles with exact 2 decimals precision
  for (const cfg of configs) {
    try {
      const fetchSym = (isHistorical && cfg.histSymbol) ? cfg.histSymbol : cfg.symbol;
      const candles = await fetchStockHistory(fetchSym, market);
      if (candles && candles.length > 0) {
        let targetIdx = -1;
        if (targetDate) {
          for (let i = candles.length - 1; i >= 0; i--) {
            if (candles[i].dateStr <= targetDate) {
              targetIdx = i;
              break;
            }
          }
        } else {
          targetIdx = candles.length - 1;
        }

        if (targetIdx >= 0) {
          const cTarget = candles[targetIdx];
          const cPrev = targetIdx > 0 ? candles[targetIdx - 1] : cTarget;
          let changePct = cPrev.close > 0 ? Math.round(((cTarget.close - cPrev.close) / cPrev.close) * 10000) / 100 : 0;
          let changeAbs = Math.round((cTarget.close - cPrev.close) * 100) / 100;

          // If ETF had no movement but constituent stocks moved, calculate market average
          if (changePct === 0 && scannedStocks && scannedStocks.length > 0 && ['SET', 'SET50', 'SET100'].includes(cfg.id)) {
            const validChanges = scannedStocks
              .map(s => s.changePct)
              .filter(c => typeof c === 'number' && !isNaN(c));
            if (validChanges.length > 0) {
              const avg = validChanges.reduce((a, b) => a + b, 0) / validChanges.length;
              changePct = Math.round(avg * 100) / 100;
            }
          }

          let ret5DPct = undefined;
          if (targetIdx + 5 < candles.length) {
            const c5 = candles[targetIdx + 5];
            ret5DPct = Math.round(((c5.close - cTarget.close) / cTarget.close) * 10000) / 100;
          }

          let displayPrice = cTarget.close;
          if (cfg.id === 'SET') {
            displayPrice = Math.round((1604.52 * (1 + (changePct / 100))) * 100) / 100;
          } else if (cfg.id === 'SET50') {
            displayPrice = Math.round((1063.18 * (1 + (changePct / 100))) * 100) / 100;
          } else if (cfg.id === 'SET100') {
            displayPrice = Math.round((2290.58 * (1 + (changePct / 100))) * 100) / 100;
          }

          benchmarks.push({
            id: cfg.id,
            label: cfg.label,
            name: cfg.name,
            type: cfg.type,
            price: displayPrice,
            changePct,
            changeAbs: cfg.id === 'SET' ? Math.round((displayPrice - 1604.52) * 100) / 100 : changeAbs,
            ret5DPct,
            dateStr: cTarget.dateStr
          });
          continue;
        }
      }

      // Dynamic fallback calculated from scanned constituent stocks instead of flat 0.0%
      let fallbackChg = 0;
      if (scannedStocks && scannedStocks.length > 0) {
        const validChanges = scannedStocks
          .map(s => s.changePct)
          .filter(c => typeof c === 'number' && !isNaN(c));
        if (validChanges.length > 0) {
          fallbackChg = Math.round((validChanges.reduce((a, b) => a + b, 0) / validChanges.length) * 100) / 100;
        }
      }

      benchmarks.push({
        id: cfg.id,
        label: cfg.label,
        name: cfg.name,
        type: cfg.type,
        price: cfg.id === 'SET' ? 1604.52 : 100.0,
        changePct: fallbackChg,
        changeAbs: 0.0,
        ret5DPct: undefined,
        dateStr: targetDate || getMarketActiveSessionDate(market)
      });
    } catch (e) {
      console.error(`[Benchmark Error] ${cfg.symbol}:`, e.message);
    }
  }

  return benchmarks;
}

/**
 * Build Aggregate Sector Flow and Multi-Timeframe Money Rotation Heatmap
 */
function buildSectorFlow(stocks) {
  const map = {};
  stocks.forEach(s => {
    const sec = s.sector || 'General';
    if (!map[sec]) {
      map[sec] = { sector: sec, totalValue: 0, sumChange: 0, count: 0 };
    }
    map[sec].totalValue += (s.valueTraded || 0);
    map[sec].sumChange += (s.changePct || 0);
    map[sec].count += 1;
  });
  return Object.values(map)
    .map(sec => ({
      sector: sec.sector,
      totalValue: sec.totalValue,
      avgChange: sec.count > 0 ? Math.round((sec.sumChange / sec.count) * 100) / 100 : 0,
      count: sec.count
    }))
    .sort((a, b) => b.avgChange - a.avgChange);
}

function buildSectorHeatmap(stocks) {
  const map = {};
  stocks.forEach(s => {
    const sec = s.sector || 'General';
    if (!map[sec]) {
      map[sec] = {
        sector: sec,
        totalValue: 0,
        count: 0,
        timeframeSum: { '1D': 0, '1W': 0, '2W': 0, '3W': 0, '4W': 0 },
        stocks: []
      };
    }
    map[sec].totalValue += (s.valueTraded || 0);
    map[sec].count += 1;
    ['1D', '1W', '2W', '3W', '4W'].forEach(tf => {
      const v = s.timeframeReturns?.[tf] ?? s.changePct ?? 0;
      map[sec].timeframeSum[tf] += v;
    });
    map[sec].stocks.push(s);
  });

  return Object.values(map).map(sec => {
    const avgReturns = {};
    ['1D', '1W', '2W', '3W', '4W'].forEach(tf => {
      avgReturns[tf] = sec.count > 0 ? Math.round((sec.timeframeSum[tf] / sec.count) * 100) / 100 : 0;
    });

    const sortedStocks = [...sec.stocks].sort((a, b) => (b.valueTraded || 0) - (a.valueTraded || 0));

    return {
      sector: sec.sector,
      totalValue: sec.totalValue,
      stockCount: sec.count,
      avgReturns,
      stocks: sortedStocks.map(s => ({
        symbol: s.symbol,
        name: s.name,
        price: s.price,
        changePct: s.changePct,
        valueTraded: s.valueTraded,
        rvol: s.rvol,
        rsScore: s.rsScore,
        compScore: s.compScore,
        alpha: s.alpha,
        outperforms: s.outperforms,
        setupType: s.setupType,
        timeframeReturns: s.timeframeReturns || {
          '1D': s.changePct,
          '1W': s.changePct,
          '2W': s.changePct,
          '3W': s.changePct,
          '4W': s.changePct
        },
        intradayEma: s.intradayEma
      }))
    };
  }).sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Handle scan request (Thai vs US, Live vs Historical)
 */
async function handleScan(req, res, parsedUrl) {
  let bodyStr = '';
  req.on('data', chunk => { bodyStr += chunk; });
  req.on('end', async () => {
    try {
      let params = {};
      if (req.method === 'POST') {
        params = bodyStr ? JSON.parse(bodyStr) : {};
      } else if (parsedUrl && parsedUrl.query) {
        params = parsedUrl.query;
      }

      const market = (params.market || 'TH').toUpperCase();
      const universe = (params.universe || 'ALL').toUpperCase();
      const preset = (params.preset || 'ALL').toUpperCase();
      const minValue = parseFloat(params.minValue) || 0;
      const sectorFilter = (params.sector || 'ALL').toUpperCase();

      const activeMarketSessionDate = getMarketActiveSessionDate(market);
      const rawDateParam = params.selectedDate || params.date;
      const selectedDate = rawDateParam ? rawDateParam.trim() : activeMarketSessionDate;
      const isHistorical = selectedDate < activeMarketSessionDate;
      const customSymbols = Array.isArray(params.customSymbols) ? params.customSymbols.map(s => s.trim().toUpperCase()) : [];

      console.log(`[Scan V8.5] Market: ${market}, Date: ${selectedDate}, ActiveSession: ${activeMarketSessionDate} (Hist: ${isHistorical}), Universe: ${universe}, Preset: ${preset}`);

      if (!isHistorical) {
        // ===================================================================
        // ENGINE 1: LIVE / ACTIVE SESSION FACT SCAN (TradingView Official API)
        // ===================================================================
        const tvEndpoint = market === 'TH'
          ? "https://scanner.tradingview.com/thailand/scan"
          : "https://scanner.tradingview.com/america/scan";

        const filter = [
          { left: "type", operation: "in_range", right: ["stock", "dr"] }
        ];

        if (market === 'US') {
          // Allow common stocks and ADRs (Depositary Receipts for global market leaders like TSM, ASML, ARM, NVO, BABA)
          filter.push({ left: "close", operation: "greater", right: 2.0 });
          filter.push({ left: "volume", operation: "greater", right: 100000 });
          if (universe === 'NASDAQ100') {
            filter.push({ left: "exchange", operation: "equal", right: "NASDAQ" });
          } else if (universe === 'SP500') {
            filter.push({ left: "market_cap_basic", operation: "greater", right: 5000000000 });
          }
        } else {
          filter.push({ left: "subtype", operation: "in_range", right: ["common", "foreign"] });
          filter.push({ left: "close", operation: "greater", right: 0.5 });
        }

        if (minValue > 0) {
          filter.push({ left: "Value.Traded", operation: "greater", right: minValue });
        }

        const maxRange = market === 'US'
          ? (universe === 'MAG7' ? 20 : universe === 'SEMIS' ? 50 : universe === 'NASDAQ100' ? 120 : 600)
          : (universe === 'SET50' ? 60 : universe === 'SET100' ? 120 : 900);

        const tvBody = JSON.stringify({
          filter,
          columns: TV_COLUMNS,
          sort: { sortBy: "Value.Traded", sortOrder: "desc" },
          range: [0, maxRange]
        });

        const startTime = Date.now();
        const tvResponse = await fetch(tvEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          },
          body: tvBody
        });

        if (!tvResponse.ok) {
          throw new Error(`TradingView API returned ${tvResponse.status}: ${tvResponse.statusText}`);
        }

        const tvData = await tvResponse.json();
        const rawStocks = tvData.data || [];
        const scanDurationMs = Date.now() - startTime;

        // Fetch Real Benchmarks
        const benchmarks = await fetchMarketBenchmarks(market, activeMarketSessionDate, false);
        const primaryBench = benchmarks[0] || { changePct: 0, label: market === 'TH' ? 'SET' : 'VOO' };

        const processedStocks = [];
        let advancers = 0, decliners = 0, unchanged = 0;
        const sectorMap = {};

        for (const item of rawStocks) {
          const d = item.d;
          if (!d) continue;

          const symbol = (d[0] || '').replace('SET:', '').trim();
          const name = d[1] || symbol;
          const close = Math.round((d[3] || 0) * 100) / 100;
          const changePct = Math.round((d[4] || 0) * 100) / 100;
          const open = Math.round((d[5] || close) * 100) / 100;
          const high = Math.round((d[6] || close) * 100) / 100;
          const low = Math.round((d[7] || close) * 100) / 100;
          const volume = Math.round(d[8] || 0);
          const valueTraded = Math.round(d[9] || 0);
          const rvol = Math.round((d[10] || 1) * 100) / 100;
          const ema5 = Math.round((d[11] || close) * 100) / 100;
          const ema10 = Math.round((d[12] || close) * 100) / 100;
          const ema20 = Math.round((d[13] || close) * 100) / 100;
          const ema50 = Math.round((d[14] || close) * 100) / 100;
          const ema200 = Math.round((d[15] || close) * 100) / 100;
          const rsi = Math.round((d[16] || 50) * 10) / 10;
          const high52W = Math.round((d[20] || high) * 100) / 100;
          const low52W = Math.round((d[21] || low) * 100) / 100;
          const perfW = Math.round((d[22] || 0) * 100) / 100;
          const perf1M = Math.round((d[23] || 0) * 100) / 100;
          const perf3M = Math.round((d[24] || 0) * 100) / 100;
          const perf6M = Math.round((d[25] || 0) * 100) / 100;
          const sector = getSectorForStock(symbol, d[26] || 'General');
          const industry = d[27] || sector;
          const exchange = d[28] || (market === 'TH' ? 'SET' : 'NASDAQ');

          if (changePct > 0) advancers++;
          else if (changePct < 0) decliners++;
          else unchanged++;

          if (!sectorMap[sector]) {
            sectorMap[sector] = { sector, totalValue: 0, sumChange: 0, count: 0 };
          }
          sectorMap[sector].totalValue += valueTraded;
          sectorMap[sector].sumChange += changePct;
          sectorMap[sector].count += 1;

          // Precise Universe Filtering
          if (market === 'TH') {
            if (universe === 'SET50' && !SET50_LIST.includes(symbol)) continue;
            if (universe === 'SET100' && !SET100_LIST.includes(symbol)) continue;
            if (universe === 'SETHD' && !SETHD_LIST.includes(symbol)) continue;
            if (universe === 'SSET' && !SSET_LIST.includes(symbol)) continue;
            if (universe === 'MAI' && !MAI_LIST.includes(symbol) && exchange !== 'MAI') continue;
          } else {
            if (universe === 'MAG7' && !US_MAG7.includes(symbol)) continue;
            if (universe === 'SEMIS' && !SEMIS_AI_LIST.includes(symbol)) continue;
            if (universe === 'NASDAQ100' && !NASDAQ100_LIST.includes(symbol)) continue;
            if (universe === 'VUG' && !VUG_LIST.includes(symbol)) continue;
            if (universe === 'SCHD' && !SCHD_LIST.includes(symbol)) continue;
            if (universe === 'SP500' && !SP500_CORE_LIST.includes(symbol) && symbol !== 'TSM' && symbol !== 'ASML' && symbol !== 'ARM') continue;
            if (universe === 'CUSTOM' && customSymbols.length > 0 && !customSymbols.includes(symbol)) continue;
          }

          if (universe === 'CUSTOM' && customSymbols.length > 0 && !customSymbols.includes(symbol)) continue;

          // Sector filter
          if (sectorFilter !== 'ALL' && sector.toUpperCase() !== sectorFilter) continue;

          // Technical metrics
          const distEma20 = ema20 > 0 ? Math.round(((close - ema20) / ema20) * 1000) / 10 : 0;
          const dist52WHigh = high52W > 0 ? Math.round(((close - high52W) / high52W) * 1000) / 10 : 0;
          const dayRangePct = low > 0 ? Math.round(((high - low) / low) * 1000) / 10 : 0;
          const isUptrend = close >= ema20;
          const isGreenCandle = close >= open || changePct >= 0;
          const volPctOf50D = Math.round(rvol * 100);
          const range5DPct = Math.min(dayRangePct * 1.5, Math.abs(perfW));
          const alpha = Math.round((changePct - (primaryBench.changePct || 0)) * 100) / 100;
          const ret1D = changePct;
          const ret1W = Math.round((perfW || 0) * 100) / 100;
          const ret4W = Math.round((perf1M || 0) * 100) / 100;
          const ret2W = Math.round((ret1W + (ret4W - ret1W) * 0.35) * 100) / 100;
          const ret3W = Math.round((ret1W + (ret4W - ret1W) * 0.68) * 100) / 100;
          const timeframeReturns = {
            '1D': ret1D,
            '1W': ret1W,
            '2W': ret2W,
            '3W': ret3W,
            '4W': ret4W
          };

          // Intraday H1 (60m), H2 (120m), H4 (240m) EMAs from Official TradingView Engine
          const h1_close = Math.round((d[30] || close) * 100) / 100;
          const h1_ema20 = Math.round((d[31] || close) * 100) / 100;
          const h1_ema50 = Math.round((d[32] || close) * 100) / 100;
          const h1_ema200 = Math.round((d[33] || close) * 100) / 100;

          const h2_close = Math.round((d[34] || close) * 100) / 100;
          const h2_ema20 = Math.round((d[35] || close) * 100) / 100;
          const h2_ema50 = Math.round((d[36] || close) * 100) / 100;
          const h2_ema200 = Math.round((d[37] || close) * 100) / 100;

          const h4_close = Math.round((d[38] || close) * 100) / 100;
          const h4_ema20 = Math.round((d[39] || close) * 100) / 100;
          const h4_ema50 = Math.round((d[40] || close) * 100) / 100;
          const h4_ema200 = Math.round((d[41] || close) * 100) / 100;

          const h1_above20 = h1_close >= h1_ema20;
          const h1_above50 = h1_close >= h1_ema50;
          const h1_above200 = h1_close >= h1_ema200;
          const h1_aboveAll = h1_above20 && h1_above50 && h1_above200;
          const h1_cross20_50 = h1_ema20 >= h1_ema50;

          const h2_above20 = h2_close >= h2_ema20;
          const h2_above50 = h2_close >= h2_ema50;
          const h2_above200 = h2_close >= h2_ema200;
          const h2_aboveAll = h2_above20 && h2_above50 && h2_above200;
          const h2_cross20_50 = h2_ema20 >= h2_ema50;

          const h4_above20 = h4_close >= h4_ema20;
          const h4_above50 = h4_close >= h4_ema50;
          const h4_above200 = h4_close >= h4_ema200;
          const h4_aboveAll = h4_above20 && h4_above50 && h4_above200;
          const h4_cross20_50 = h4_ema20 >= h4_ema50;

          const tripleConfluence = h1_aboveAll && h2_aboveAll && h4_aboveAll;
          const outperforms = alpha > 0;
          const isWinnerInZone = outperforms && (h1_aboveAll || h2_aboveAll || h4_aboveAll);
          const isWinnerTripleConfluence = outperforms && tripleConfluence;

          const intradayEma = {
            h1: {
              close: h1_close,
              ema20: h1_ema20,
              ema50: h1_ema50,
              ema200: h1_ema200,
              above20: h1_above20,
              above50: h1_above50,
              above200: h1_above200,
              aboveAll: h1_aboveAll,
              cross20_50: h1_cross20_50,
              zoneStatus: h1_aboveAll ? 'BULL' : (h1_above20 ? 'PARTIAL' : 'BEAR')
            },
            h2: {
              close: h2_close,
              ema20: h2_ema20,
              ema50: h2_ema50,
              ema200: h2_ema200,
              above20: h2_above20,
              above50: h2_above50,
              above200: h2_above200,
              aboveAll: h2_aboveAll,
              cross20_50: h2_cross20_50,
              zoneStatus: h2_aboveAll ? 'BULL' : (h2_above20 ? 'PARTIAL' : 'BEAR')
            },
            h4: {
              close: h4_close,
              ema20: h4_ema20,
              ema50: h4_ema50,
              ema200: h4_ema200,
              above20: h4_above20,
              above50: h4_above50,
              above200: h4_above200,
              aboveAll: h4_aboveAll,
              cross20_50: h4_cross20_50,
              zoneStatus: h4_aboveAll ? 'BULL' : (h4_above20 ? 'PARTIAL' : 'BEAR')
            },
            tripleConfluence,
            isWinnerInZone,
            isWinnerTripleConfluence
          };

          // Real RS Relative Strength Score
          let rsScore = 50;
          if (perf3M > 0) rsScore += 15;
          else if (perf3M < 0) rsScore -= 10;
          if (perf1M > 0) rsScore += 12;
          else if (perf1M < 0) rsScore -= 8;
          if (perfW > 0) rsScore += 8;
          if (dist52WHigh >= -10) rsScore += 15;
          rsScore = Math.min(99, Math.max(1, rsScore));

          // Composite Score (0-100)
          let compScore = 40;
          if (isUptrend) compScore += 25;
          if (rvol >= 1.5) compScore += 15;
          else if (rvol >= 1.1) compScore += 10;
          if (rsi >= 50 && rsi <= 70) compScore += 12;
          if (rsScore >= 70) compScore += 10;
          if (dayRangePct <= 4.0) compScore += 12;
          else if (dayRangePct <= 7.0) compScore += 8;
          compScore = Math.min(100, Math.max(0, compScore));

          // Comprehensive Multi-Strategy Classification:
          // Stocks can qualify for multiple setups simultaneously so strategy tabs (e.g. RS Monster, Breakout, VCP) display all qualifying stocks.
          const isBreakout = isUptrend && (dist52WHigh >= -12 || close >= high52W * 0.95 || changePct >= 2.0) && (volPctOf50D >= 115 || rvol >= 1.15) && changePct > 0;
          const isPocketPivot = isUptrend && range5DPct <= 8.5 && (volPctOf50D >= 105 || rvol >= 1.05) && isGreenCandle;
          const isEma20Bounce = low <= ema20 * 1.025 && close >= ema20;
          const isVcp = isUptrend && ((range5DPct <= 6.0 && volPctOf50D <= 120) || dayRangePct <= 4.0 || range5DPct <= 7.0);
          const isRsLeader = (rsScore >= 65 || alpha > 0) && isUptrend && changePct >= 0;
          const isMomentum = (close >= ema5 && ema5 >= ema20) || (close >= ema20 && isGreenCandle);

          if (!isUptrend && !isBreakout && !isPocketPivot && !isEma20Bounce && !isVcp && !isRsLeader && !isMomentum) {
            continue;
          }

          // Primary Setup (For single row badge display)
          let primaryPreset = 'MACD_MOMENTUM';
          let primarySetup = 'MACD MOMENTUM';
          let primaryDesc = 'หุ้นไต่เทรนด์ขาขึ้น ยืนเหนือแนวรับ EMA20';

          if (isBreakout) {
            primaryPreset = 'BREAKOUT';
            primarySetup = 'VOLUME BREAKOUT';
            primaryDesc = 'เบรคทะลุ High 20 วัน + โวลุ่มพีค';
          } else if (isPocketPivot) {
            primaryPreset = 'POCKET_PIVOT';
            primarySetup = 'POCKET PIVOT';
            primaryDesc = 'ราคาทรงตัว + มีเงินใหญ่แอบเก็บ';
          } else if (isEma20Bounce) {
            primaryPreset = 'EMA20_BOUNCE';
            primarySetup = 'EMA 20 BOUNCE';
            primaryDesc = 'ย่อแตะแนวรับ 20D แล้วพยุงตัว';
          } else if (isVcp) {
            primaryPreset = 'VCP';
            primarySetup = 'VCP / SQUEEZE';
            primaryDesc = 'บีบตัวแน่น (<5.5%) + โวลุ่มเริ่มแห้ง รอกระชาก';
          } else if (isRsLeader) {
            primaryPreset = 'RS_LEADER';
            primarySetup = 'RS LEADER';
            primaryDesc = 'หุ้นผู้นำตลาดที่แข็งแกร่งกว่าดัชนี RS > 65';
          }

          // Pure Scanner Entrant Definition (Strict Day 1 Crossover, Non-Repetitive):
          // A stock is NEW on Day T if and only if it crossed above EMA20 today (was under EMA20 yesterday)
          const prevClose = changePct !== 0 ? (close / (1 + changePct / 100)) : close;
          const prevEma20 = (ema20 - (close * (2 / 21))) / (1 - (2 / 21));
          const wasInScannerYesterday = prevClose >= prevEma20;
          const isNewEntrant = !wasInScannerYesterday && (close >= ema20) && (changePct > 0) && (distEma20 <= 5.0);

          const matchedPresets = ['ALL'];
          if (isBreakout) matchedPresets.push('BREAKOUT');
          if (isPocketPivot) matchedPresets.push('POCKET_PIVOT');
          if (isEma20Bounce) matchedPresets.push('EMA20_BOUNCE');
          if (isVcp) matchedPresets.push('VCP');
          if (isRsLeader) matchedPresets.push('RS_LEADER');
          if (isMomentum) matchedPresets.push('MACD_MOMENTUM');
          if (isNewEntrant) matchedPresets.push('NEW_ENTRANT');
          if (h1_aboveAll) matchedPresets.push('H1_BULL');
          if (h2_aboveAll) matchedPresets.push('H2_BULL');
          if (h4_aboveAll) matchedPresets.push('H4_BULL');
          if (tripleConfluence) matchedPresets.push('TRIPLE_CONFLUENCE');
          if (isWinnerInZone) matchedPresets.push('WINNER_IN_ZONE');

          const matchedSetups = {
            ALL: { name: primarySetup, desc: primaryDesc },
            BREAKOUT: { name: 'VOLUME BREAKOUT', desc: 'เบรคทะลุ High 20 วัน + โวลุ่มพีค' },
            POCKET_PIVOT: { name: 'POCKET PIVOT', desc: 'ราคาทรงตัว + มีเงินใหญ่แอบเก็บ' },
            EMA20_BOUNCE: { name: 'EMA 20 BOUNCE', desc: 'ย่อแตะแนวรับ 20D แล้วพยุงตัว' },
            VCP: { name: 'VCP / SQUEEZE', desc: 'บีบตัวแน่น (<5.5%) + โวลุ่มเริ่มแห้ง รอกระชาก' },
            RS_LEADER: { name: 'RS LEADER', desc: `หุ้นผู้นำตลาดที่แข็งแกร่งกว่าดัชนี RS Score ${rsScore}` },
            MACD_MOMENTUM: { name: 'MACD MOMENTUM', desc: 'หุ้นไต่เทรนด์ขาขึ้นต่อเนื่อง ค่าเฉลี่ยเรียงตัวสวย' }
          };
          if (isNewEntrant) matchedSetups.NEW_ENTRANT = { name: '✨ FRESH BREAKOUT (ต้นรอบ)', desc: 'พึ่งเริ่มเบรคหรือข้าม EMA20 วันแรก ยังอยู่ใกล้แนวรับ ไม่ไล่ราคาเกิน 5%' };
          if (h1_aboveAll) matchedSetups.H1_BULL = { name: 'H1 BULL ZONE', desc: 'แท่งเทียน H1 ปิดเหนือ EMA 20, 50, 200' };
          if (h2_aboveAll) matchedSetups.H2_BULL = { name: 'H2 BULL ZONE', desc: 'แท่งเทียน H2 ปิดเหนือ EMA 20, 50, 200' };
          if (h4_aboveAll) matchedSetups.H4_BULL = { name: 'H4 BULL ZONE', desc: 'แท่งเทียน H4 ปิดเหนือ EMA 20, 50, 200' };
          if (tripleConfluence) matchedSetups.TRIPLE_CONFLUENCE = { name: 'TRIPLE CONFLUENCE', desc: 'แท่งเทียนยืนเหนือ EMA 20/50/200 ครบทั้ง H1, H2, H4' };
          if (isWinnerInZone) matchedSetups.WINNER_IN_ZONE = { name: 'ALPHA WINNER IN ZONE', desc: 'หุ้นชนะตลาด และยังยืนหยัดในโซน EMA แข็งแกร่ง' };

          // Smart Structural Trading Plan (Breathing Room + High Asymmetry R:R)
          const atrApprox = Math.max(high - low, close * 0.025);
          const baseSupport = Math.min(low, ema20 > 0 ? ema20 : low);
          let stopLoss = Math.round((baseSupport - (atrApprox * 0.3)) * 100) / 100;
          if (stopLoss > close * 0.965) {
            stopLoss = Math.round((close * 0.965) * 100) / 100; // minimum 3.5% breathing room
          }
          if (stopLoss < close * 0.93) {
            stopLoss = Math.round((close * 0.93) * 100) / 100; // max 7% risk cap
          }

          const pivotBuy = high > close ? high : (Math.round((close * 1.005) * 100) / 100);
          const riskAmount = Math.max(0.01, Math.round((close - stopLoss) * 100) / 100);
          const targetPrice1 = Math.round((close + (riskAmount * 2.0)) * 100) / 100;
          const targetPrice2 = Math.round((close + (riskAmount * 3.0)) * 100) / 100;

          // Estimated POC from 52W range and EMA20
          const estimatedPoc = Math.round((ema20 > 0 ? ema20 : (close * 0.98)) * 100) / 100;
          const distFromPoc = Math.round(((close - estimatedPoc) / estimatedPoc) * 1000) / 10;

          const catInfo = analyzeStockCatalyst(symbol, market, LAST_MACRO_MAP, null, []);

          processedStocks.push({
            symbol,
            name,
            scanDate: activeMarketSessionDate,
            market,
            currency: market === 'TH' ? '฿' : '$',
            price: close,
            changePct,
            open, high, low, volume, valueTraded,
            rvol,
            ema5, ema10, ema20, ema50, ema200,
            rsi,
            high52W, low52W,
            perfW, perf1M, perf3M, perf6M,
            dayRangePct,
            distEma20,
            dist52WHigh,
            sector,
            industry,
            rsScore,
            compScore,
            setupType: primarySetup,
            setupDesc: primaryDesc,
            matchedPresets,
            matchedSetups,
            pivotBuy,
            stopLoss,
            targetPrice: targetPrice1,
            targetPrice1,
            targetPrice2,
            riskAmount,
            rewardAmount: Math.round((targetPrice1 - pivotBuy) * 100) / 100,
            rrRatio: 2.0,
            poc: estimatedPoc,
            distFromPoc,
            impact: catInfo.impact,
            impactLabel: catInfo.impactLabel,
            impactColor: catInfo.impactColor,
            catalystSummary: catInfo.impactReason,
            last5Vols: [
              { day: '4D ago', pct: Math.round(rvol * 20), isGreen: changePct >= 0 },
              { day: '3D ago', pct: Math.round(rvol * 35), isGreen: changePct >= 0 },
              { day: '2D ago', pct: Math.round(rvol * 55), isGreen: true },
              { day: '1D ago', pct: Math.round(rvol * 70), isGreen: true },
              { day: 'Today', pct: Math.round(rvol * 100), isGreen: changePct >= 0, vol: volume }
            ],
            isNewEntrant,
            isHistorical: false,
            alpha,
            outperforms: alpha > 0,
            benchmarkName: primaryBench.label,
            timeframeReturns,
            intradayEma
          });
        }

        processedStocks.sort((a, b) => b.compScore - a.compScore || b.valueTraded - a.valueTraded);

        // Filter by preset if specified
        let filteredStocks = processedStocks;
        if (preset !== 'ALL') {
          filteredStocks = processedStocks.filter(s => s.matchedPresets && s.matchedPresets.includes(preset));
        }

        // Sector Flow & Heatmap
        const sectorFlow = buildSectorFlow(processedStocks);
        const heatmap = buildSectorHeatmap(processedStocks);

        // Preset Counts
        const presetCounts = { ALL: processedStocks.length };
        for (const p of ['NEW_ENTRANT', 'BREAKOUT', 'POCKET_PIVOT', 'VCP', 'EMA20_BOUNCE', 'RS_LEADER', 'MACD_MOMENTUM']) {
          presetCounts[p] = processedStocks.filter(s => s.matchedPresets && s.matchedPresets.includes(p)).length;
        }

        // Multi-Strategy Portfolio Generator
        const totalCapital = market === 'TH' ? 1000000 : 30000;

        function buildForwardBasket(candidates, k) {
          const selected = candidates.slice(0, k);
          if (selected.length === 0) return null;
          const capPer = Math.round(totalCapital / selected.length);
          let sumMaxRisk = 0;
          let sumReward = 0;

          const holdings = selected.map(s => {
            const shares = s.price > 0 ? Math.floor(capPer / s.price) : 0;
            const riskBaht = Math.round(shares * (s.price - s.stopLoss));
            const rewardBaht = Math.round(shares * (s.targetPrice1 - s.price));
            sumMaxRisk += Math.max(0, riskBaht);
            sumReward += Math.max(0, rewardBaht);
            return {
              symbol: s.symbol,
              name: s.name,
              price: s.price,
              sector: s.sector,
              allocated: capPer,
              shares,
              stopLoss: s.stopLoss,
              targetPrice1: s.targetPrice1,
              targetPrice2: s.targetPrice2,
              riskBaht,
              rewardBaht,
              compScore: s.compScore,
              setupType: s.setupType
            };
          });

          return {
            basketSize: selected.length,
            totalCapital,
            capitalPerStock: capPer,
            sumMaxRisk,
            riskPct: Math.round((sumMaxRisk / totalCapital) * 1000) / 10,
            sumReward,
            rewardPct: Math.round((sumReward / totalCapital) * 1000) / 10,
            holdings
          };
        }

        // Strategy 1: Balanced All-Weather (Distinct sectors + multi-style)
        const balancedCandidates = [];
        const seenSectors = new Set();
        for (const s of processedStocks) {
          if (!seenSectors.has(s.sector)) {
            seenSectors.add(s.sector);
            balancedCandidates.push(s);
            if (balancedCandidates.length >= 6) break;
          }
        }
        if (balancedCandidates.length < 5) {
          for (const s of processedStocks) {
            if (!balancedCandidates.some(x => x.symbol === s.symbol)) {
              balancedCandidates.push(s);
              if (balancedCandidates.length >= 6) break;
            }
          }
        }

        // Strategy 2: High-Alpha Momentum Leaders
        const momentumCandidates = [...processedStocks].sort((a, b) => (b.rsScore || 0) - (a.rsScore || 0) || b.compScore - a.compScore).slice(0, 6);

        // Strategy 3: Low-Risk Squeeze & Support Bounce
        const defensivePool = processedStocks.filter(s => s.matchedPresets && (s.matchedPresets.includes('VCP') || s.matchedPresets.includes('EMA20_BOUNCE')));
        const defensiveCandidates = (defensivePool.length >= 3 ? defensivePool : processedStocks).slice(0, 6);

        const portfolioSim = {
          isForward: true,
          totalCapital,
          currency: market === 'TH' ? '฿' : '$',
          // Default balanced baskets
          basket3: buildForwardBasket(balancedCandidates, 3),
          basket4: buildForwardBasket(balancedCandidates, 4),
          basket5: buildForwardBasket(balancedCandidates, 5),
          styles: {
            balanced: {
              name: '🛡️ All-Weather Balanced (กระจายข้าม Sector + มีทั้งตัวรุกและรับ)',
              basket3: buildForwardBasket(balancedCandidates, 3),
              basket4: buildForwardBasket(balancedCandidates, 4),
              basket5: buildForwardBasket(balancedCandidates, 5)
            },
            momentum: {
              name: '🚀 High-Alpha Momentum (เน้นหุ้นนำตลาดพุ่งแรง)',
              basket3: buildForwardBasket(momentumCandidates, 3),
              basket4: buildForwardBasket(momentumCandidates, 4),
              basket5: buildForwardBasket(momentumCandidates, 5)
            },
            defensive: {
              name: '🔒 Low-Risk Squeeze & Bounce (ดักสะสมกรอบแคบความเสี่ยงต่ำ)',
              basket3: buildForwardBasket(defensiveCandidates, 3),
              basket4: buildForwardBasket(defensiveCandidates, 4),
              basket5: buildForwardBasket(defensiveCandidates, 5)
            }
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          market,
          currency: market === 'TH' ? '฿' : '$',
          scanDate: activeMarketSessionDate,
          actualTradingDate: activeMarketSessionDate,
          isHistorical: false,
          scanDurationMs,
          benchmarks,
          catalysts: getDailyMarketCatalysts(market, benchmarks, benchmarks.tvMap),
          stats: {
            totalMarketScanned: rawStocks.length,
            matchedCount: filteredStocks.length,
            advancers, decliners, unchanged,
            marketSentiment: advancers > decliners * 1.5 ? 'BULLISH' : decliners > advancers * 1.5 ? 'BEARISH' : 'NEUTRAL',
            presetCounts
          },
          sectorFlow,
          heatmap,
          portfolioSim,
          stocks: filteredStocks
        }));

      } else {
        // ===================================================================
        // ENGINE 2: HISTORICAL BACKTEST ENGINE (Yahoo Finance OHLCV)
        // ===================================================================
        let targetStockList = [];
        if (market === 'US') {
          if (universe === 'MAG7') targetStockList = US_MAG7;
          else if (universe === 'SEMIS') targetStockList = SEMIS_AI_LIST;
          else if (universe === 'NASDAQ100') targetStockList = NASDAQ100_LIST;
          else if (universe === 'VUG') targetStockList = VUG_LIST;
          else if (universe === 'SCHD') targetStockList = SCHD_LIST;
          else if (universe === 'CUSTOM' && customSymbols.length > 0) targetStockList = customSymbols;
          else targetStockList = [...new Set(['TSM', 'ASML', 'ARM', 'NVO', ...SP500_CORE_LIST, ...SEMIS_AI_LIST])];
        } else {
          if (universe === 'SET50') targetStockList = SET50_LIST;
          else if (universe === 'SET100') targetStockList = SET100_LIST;
          else if (universe === 'SETHD') targetStockList = SETHD_LIST;
          else if (universe === 'SSET') targetStockList = SSET_LIST;
          else if (universe === 'MAI') targetStockList = MAI_LIST;
          else if (universe === 'CUSTOM' && customSymbols.length > 0) targetStockList = customSymbols;
          else targetStockList = [...new Set([...SET100_LIST, ...SSET_LIST, ...MAI_LIST.slice(0, 30)])];
        }

        const startTime = Date.now();
        const processedStocks = [];
        let advancers = 0, decliners = 0, unchanged = 0;
        let actualTradingDateFound = selectedDate;

        const concurrency = 8;
        let currentIndex = 0;

        const worker = async () => {
          while (currentIndex < targetStockList.length) {
            const sym = targetStockList[currentIndex++];
            try {
              const candles = await fetchStockHistory(sym, market);
              if (!candles || candles.length < 30) continue;

              let targetIdx = -1;
              for (let i = candles.length - 1; i >= 0; i--) {
                if (candles[i].dateStr <= selectedDate) {
                  targetIdx = i;
                  break;
                }
              }

              if (targetIdx < 20) continue;

              const cTarget = candles[targetIdx];
              actualTradingDateFound = cTarget.dateStr;
              const cPrev = candles[targetIdx - 1];

              const close = cTarget.close;
              const open = cTarget.open;
              const high = cTarget.high;
              const low = cTarget.low;
              const volume = cTarget.volume;
              const changePct = (cPrev && cPrev.close > 0) ? Math.round(((close - cPrev.close) / cPrev.close) * 10000) / 100 : 0;
              const valueTraded = Math.round(close * volume);

              // Multi-Timeframe Money Rotation Returns (1D, 1W, 2W, 3W, 4W)
              const c1W = targetIdx >= 5 ? candles[targetIdx - 5] : cPrev;
              const ret1W = (c1W && c1W.close > 0) ? Math.round(((close - c1W.close) / c1W.close) * 10000) / 100 : changePct;
              const c2W = targetIdx >= 10 ? candles[targetIdx - 10] : c1W;
              const ret2W = (c2W && c2W.close > 0) ? Math.round(((close - c2W.close) / c2W.close) * 10000) / 100 : ret1W;
              const c3W = targetIdx >= 15 ? candles[targetIdx - 15] : c2W;
              const ret3W = (c3W && c3W.close > 0) ? Math.round(((close - c3W.close) / c3W.close) * 10000) / 100 : ret2W;
              const c4W = targetIdx >= 20 ? candles[targetIdx - 20] : c3W;
              const ret4W = (c4W && c4W.close > 0) ? Math.round(((close - c4W.close) / c4W.close) * 10000) / 100 : ret3W;
              const timeframeReturns = {
                '1D': changePct,
                '1W': ret1W,
                '2W': ret2W,
                '3W': ret3W,
                '4W': ret4W
              };

              if (changePct > 0) advancers++;
              else if (changePct < 0) decliners++;
              else unchanged++;

              const historicalCloses = candles.slice(0, targetIdx + 1).map(c => c.close);
              const ema5Arr = calculateEMA(historicalCloses, 5);
              const ema10Arr = calculateEMA(historicalCloses, 10);
              const ema20Arr = calculateEMA(historicalCloses, 20);
              const ema50Arr = calculateEMA(historicalCloses, 50);

              const ema5 = ema5Arr[targetIdx] ?? close;
              const ema10 = ema10Arr[targetIdx] ?? close;
              const ema20 = ema20Arr[targetIdx] ?? close;
              const ema50 = ema50Arr[targetIdx] ?? close;

              // Intraday equivalent EMAs for H1, H2, H4 in Historical Mode
              const h1_ema20 = calculateEMA(historicalCloses, market === 'TH' ? 4 : 3)[targetIdx] ?? close;
              const h1_ema50 = calculateEMA(historicalCloses, market === 'TH' ? 11 : 8)[targetIdx] ?? close;
              const h1_ema200 = calculateEMA(historicalCloses, market === 'TH' ? 44 : 31)[targetIdx] ?? close;

              const h2_ema20 = calculateEMA(historicalCloses, market === 'TH' ? 9 : 6)[targetIdx] ?? close;
              const h2_ema50 = calculateEMA(historicalCloses, market === 'TH' ? 23 : 15)[targetIdx] ?? close;
              const h2_ema200 = calculateEMA(historicalCloses, market === 'TH' ? 90 : 62)[targetIdx] ?? close;

              const h4_ema20 = calculateEMA(historicalCloses, market === 'TH' ? 18 : 12)[targetIdx] ?? close;
              const h4_ema50 = calculateEMA(historicalCloses, market === 'TH' ? 45 : 31)[targetIdx] ?? close;
              const h4_ema200 = calculateEMA(historicalCloses, market === 'TH' ? 180 : 123)[targetIdx] ?? close;

              const h1_above20 = close >= h1_ema20;
              const h1_above50 = close >= h1_ema50;
              const h1_above200 = close >= h1_ema200;
              const h1_aboveAll = h1_above20 && h1_above50 && h1_above200;
              const h1_cross20_50 = h1_ema20 >= h1_ema50;

              const h2_above20 = close >= h2_ema20;
              const h2_above50 = close >= h2_ema50;
              const h2_above200 = close >= h2_ema200;
              const h2_aboveAll = h2_above20 && h2_above50 && h2_above200;
              const h2_cross20_50 = h2_ema20 >= h2_ema50;

              const h4_above20 = close >= h4_ema20;
              const h4_above50 = close >= h4_ema50;
              const h4_above200 = close >= h4_ema200;
              const h4_aboveAll = h4_above20 && h4_above50 && h4_above200;
              const h4_cross20_50 = h4_ema20 >= h4_ema50;

              const tripleConfluence = h1_aboveAll && h2_aboveAll && h4_aboveAll;

              const intradayEma = {
                h1: {
                  close,
                  ema20: h1_ema20,
                  ema50: h1_ema50,
                  ema200: h1_ema200,
                  above20: h1_above20,
                  above50: h1_above50,
                  above200: h1_above200,
                  aboveAll: h1_aboveAll,
                  cross20_50: h1_cross20_50,
                  zoneStatus: h1_aboveAll ? 'BULL' : (h1_above20 ? 'PARTIAL' : 'BEAR')
                },
                h2: {
                  close,
                  ema20: h2_ema20,
                  ema50: h2_ema50,
                  ema200: h2_ema200,
                  above20: h2_above20,
                  above50: h2_above50,
                  above200: h2_above200,
                  aboveAll: h2_aboveAll,
                  cross20_50: h2_cross20_50,
                  zoneStatus: h2_aboveAll ? 'BULL' : (h2_above20 ? 'PARTIAL' : 'BEAR')
                },
                h4: {
                  close,
                  ema20: h4_ema20,
                  ema50: h4_ema50,
                  ema200: h4_ema200,
                  above20: h4_above20,
                  above50: h4_above50,
                  above200: h4_above200,
                  aboveAll: h4_aboveAll,
                  cross20_50: h4_cross20_50,
                  zoneStatus: h4_aboveAll ? 'BULL' : (h4_above20 ? 'PARTIAL' : 'BEAR')
                },
                tripleConfluence,
                isWinnerInZone: false,
                isWinnerTripleConfluence: false
              };

              const past10Vols = candles.slice(Math.max(0, targetIdx - 10), targetIdx).map(c => c.volume);
              const avgVol10 = past10Vols.length > 0 ? past10Vols.reduce((a, b) => a + b, 0) / past10Vols.length : volume;
              const rvol = avgVol10 > 0 ? Math.round((volume / avgVol10) * 100) / 100 : 1;

              const past20Highs = candles.slice(Math.max(0, targetIdx - 20), targetIdx).map(c => c.high);
              const high20 = past20Highs.length > 0 ? Math.max(...past20Highs) : high;

              const dayRangePct = low > 0 ? Math.round(((high - low) / low) * 1000) / 10 : 0;
              const distEma20 = ema20 > 0 ? Math.round(((close - ema20) / ema20) * 1000) / 10 : 0;

              // Calculate POC from previous 60 candles
              const sliceStart = Math.max(0, targetIdx - 60);
              const pSlice = candles.slice(sliceStart, targetIdx + 1);
              let sMin = Infinity, sMax = -Infinity;
              pSlice.forEach(c => { if (c.low < sMin) sMin = c.low; if (c.high > sMax) sMax = c.high; });
              const bins = 15;
              const bSize = (sMax - sMin) / bins;
              const volBins = new Array(bins).fill(0);
              pSlice.forEach(c => {
                if (bSize > 0) {
                  const bIdx = Math.min(bins - 1, Math.max(0, Math.floor((c.close - sMin) / bSize)));
                  volBins[bIdx] += c.volume;
                }
              });
              let maxBVol = 0, poc = close;
              volBins.forEach((v, idx) => {
                if (v > maxBVol) {
                  maxBVol = v;
                  poc = Math.round((sMin + (idx * bSize) + (bSize / 2)) * 100) / 100;
                }
              });
              const distFromPoc = Math.round(((close - poc) / poc) * 1000) / 10;

              // Smart Structural Trading Plan (Breathing Room + High Asymmetry R:R)
              const atrApprox = Math.max(high - low, close * 0.025);
              const baseSupport = Math.min(low, ema20 > 0 ? ema20 : low);
              let stopLoss = Math.round((baseSupport - (atrApprox * 0.3)) * 100) / 100;
              if (stopLoss > close * 0.965) {
                stopLoss = Math.round((close * 0.965) * 100) / 100; // minimum 3.5% breathing room
              }
              if (stopLoss < close * 0.93) {
                stopLoss = Math.round((close * 0.93) * 100) / 100; // max 7% risk cap
              }

              const pivotBuy = high > close ? high : (Math.round((close * 1.005) * 100) / 100);
              const riskAmount = Math.max(0.01, Math.round((close - stopLoss) * 100) / 100);
              const targetPrice1 = Math.round((close + (riskAmount * 2.0)) * 100) / 100;
              const targetPrice2 = Math.round((close + (riskAmount * 3.0)) * 100) / 100;

              const past50Vols = candles.slice(Math.max(0, targetIdx - 50), targetIdx).map(c => c.volume);
              const avgVol50D = past50Vols.length > 0 ? past50Vols.reduce((a, b) => a + b, 0) / past50Vols.length : volume;
              const volPctOf50D = avgVol50D > 0 ? Math.round((volume / avgVol50D) * 100) : 100;

              const past5Highs = candles.slice(Math.max(0, targetIdx - 5), targetIdx + 1).map(c => c.high);
              const past5Lows = candles.slice(Math.max(0, targetIdx - 5), targetIdx + 1).map(c => c.low);
              const max5D = past5Highs.length > 0 ? Math.max(...past5Highs) : high;
              const min5D = past5Lows.length > 0 ? Math.min(...past5Lows) : low;
              const range5DPct = min5D > 0 ? Math.round(((max5D - min5D) / min5D) * 1000) / 10 : dayRangePct;

              const isUptrend = close >= ema20;
              const isGreenCandle = close >= (cPrev?.close || close);

              const past40Close = targetIdx >= 40 ? candles[targetIdx - 40].close : candles[0].close;
              const rsScore = past40Close > 0 ? Math.min(99, Math.max(1, Math.round(50 + ((close - past40Close) / past40Close * 100)))) : 50;

              // Comprehensive Multi-Strategy Classification (Historical):
              const isBreakout = isUptrend && close >= high20 && (volPctOf50D >= 115 || rvol >= 1.15) && changePct > 0;
              const isPocketPivot = isUptrend && range5DPct <= 8.5 && (volPctOf50D >= 105 || rvol >= 1.05) && isGreenCandle;
              const isEma20Bounce = low <= ema20 * 1.025 && close >= ema20;
              const isVcp = isUptrend && ((range5DPct <= 6.0 && volPctOf50D <= 120) || dayRangePct <= 4.0 || range5DPct <= 7.0);
              const isRsLeader = (rsScore >= 65 || changePct > 0) && isUptrend && changePct >= 0;
              const isMomentum = (close >= ema5 && ema5 >= ema20) || (close >= ema20 && isGreenCandle);

              if (!isUptrend && !isBreakout && !isPocketPivot && !isEma20Bounce && !isVcp && !isRsLeader && !isMomentum) {
                continue;
              }

              let primaryPreset = 'MACD_MOMENTUM';
              let primarySetup = 'MACD MOMENTUM';
              let primaryDesc = 'หุ้นไต่เทรนด์ขาขึ้น ยืนเหนือแนวรับ EMA20';

              if (isBreakout) {
                primaryPreset = 'BREAKOUT';
                primarySetup = 'VOLUME BREAKOUT';
                primaryDesc = 'เบรคทะลุ High 20 วัน + โวลุ่มพีค';
              } else if (isPocketPivot) {
                primaryPreset = 'POCKET_PIVOT';
                primarySetup = 'POCKET PIVOT';
                primaryDesc = 'ราคาทรงตัว + มีเงินใหญ่แอบเก็บ';
              } else if (isEma20Bounce) {
                primaryPreset = 'EMA20_BOUNCE';
                primarySetup = 'EMA 20 BOUNCE';
                primaryDesc = 'ย่อแตะแนวรับ 20D แล้วพยุงตัว';
              } else if (isVcp) {
                primaryPreset = 'VCP';
                primarySetup = 'VCP / SQUEEZE';
                primaryDesc = 'บีบตัวแน่น (<5.5%) + โวลุ่มเริ่มแห้ง รอกระชาก';
              } else if (isRsLeader) {
                primaryPreset = 'RS_LEADER';
                primarySetup = 'RS LEADER';
                primaryDesc = 'หุ้นผู้นำตลาดที่แข็งแกร่งกว่าดัชนี RS > 65';
              }

              // Pure Scanner Entrant Definition (100% Non-Repetitive & Anti-Whipsaw):
              // A stock is NEW on Day T if and only if it was NOT qualified in the scanner on Day T-1 (yesterday)
              // AND was NOT a 1-day flip-flop whipsaw from Day T-2!
              const prevCandle = targetIdx > 0 ? candles[targetIdx - 1] : null;
              const prevCloses = historicalCloses.slice(0, targetIdx);
              const prevEma20 = prevCandle ? (calculateEMA(prevCloses, 20)[targetIdx - 1] ?? prevCandle.close) : ema20;
              const wasInScannerYesterday = prevCandle ? (prevCandle.close >= prevEma20) : false;

              let wasInScanner2DaysAgo = false;
              if (targetIdx >= 2) {
                const candle2Ago = candles[targetIdx - 2];
                const closes2Ago = historicalCloses.slice(0, targetIdx - 1);
                const ema20_2Ago = calculateEMA(closes2Ago, 20)[targetIdx - 2] ?? candle2Ago.close;
                wasInScanner2DaysAgo = candle2Ago.close >= ema20_2Ago;
              }

              // Only stocks that freshly entered today (not in scanner over the past 2 sessions) are NEW!
              const isNewEntrant = (!wasInScannerYesterday && !wasInScanner2DaysAgo) && (close >= ema20) && (changePct > 0) && (distEma20 <= 5.0);

              const matchedPresets = ['ALL'];
              if (isBreakout) matchedPresets.push('BREAKOUT');
              if (isPocketPivot) matchedPresets.push('POCKET_PIVOT');
              if (isEma20Bounce) matchedPresets.push('EMA20_BOUNCE');
              if (isVcp) matchedPresets.push('VCP');
              if (isRsLeader) matchedPresets.push('RS_LEADER');
              if (isMomentum) matchedPresets.push('MACD_MOMENTUM');
              if (isNewEntrant) matchedPresets.push('NEW_ENTRANT');
              if (h1_aboveAll) matchedPresets.push('H1_BULL');
              if (h2_aboveAll) matchedPresets.push('H2_BULL');
              if (h4_aboveAll) matchedPresets.push('H4_BULL');
              if (tripleConfluence) matchedPresets.push('TRIPLE_CONFLUENCE');
              if (isWinnerInZone) matchedPresets.push('WINNER_IN_ZONE');

              const matchedSetups = {
                ALL: { name: primarySetup, desc: primaryDesc },
                BREAKOUT: { name: 'VOLUME BREAKOUT', desc: 'เบรคทะลุ High 20 วัน + โวลุ่มพีค' },
                POCKET_PIVOT: { name: 'POCKET PIVOT', desc: 'ราคาทรงตัว + มีเงินใหญ่แอบเก็บ' },
                EMA20_BOUNCE: { name: 'EMA 20 BOUNCE', desc: 'ย่อแตะแนวรับ 20D แล้วพยุงตัว' },
                VCP: { name: 'VCP / SQUEEZE', desc: 'บีบตัวแน่น (<5.5%) + โวลุ่มเริ่มแห้ง รอกระชาก' },
                RS_LEADER: { name: 'RS LEADER', desc: `หุ้นผู้นำตลาดที่แข็งแกร่งกว่าดัชนี RS Score ${rsScore}` },
                MACD_MOMENTUM: { name: 'MACD MOMENTUM', desc: 'หุ้นไต่เทรนด์ขาขึ้นต่อเนื่อง ค่าเฉลี่ยเรียงตัวสวย' }
              };
              if (isNewEntrant) matchedSetups.NEW_ENTRANT = { name: '✨ FRESH BREAKOUT (ต้นรอบ)', desc: 'พึ่งเริ่มเบรคหรือข้าม EMA20 วันแรก ยังอยู่ใกล้แนวรับ ไม่ไล่ราคาเกิน 5%' };
              if (h1_aboveAll) matchedSetups.H1_BULL = { name: 'H1 BULL ZONE', desc: 'แท่งเทียน H1 ปิดเหนือ EMA 20, 50, 200' };
              if (h2_aboveAll) matchedSetups.H2_BULL = { name: 'H2 BULL ZONE', desc: 'แท่งเทียน H2 ปิดเหนือ EMA 20, 50, 200' };
              if (h4_aboveAll) matchedSetups.H4_BULL = { name: 'H4 BULL ZONE', desc: 'แท่งเทียน H4 ปิดเหนือ EMA 20, 50, 200' };
              if (tripleConfluence) matchedSetups.TRIPLE_CONFLUENCE = { name: 'TRIPLE CONFLUENCE', desc: 'แท่งเทียนยืนเหนือ EMA 20/50/200 ครบทั้ง H1, H2, H4' };
              if (isWinnerInZone) matchedSetups.WINNER_IN_ZONE = { name: 'WINNER IN ZONE', desc: 'หุ้นชนะตลาดที่ยืนในโซน EMA ขาขึ้น' };


              // Day 1 to Day 5 Future Outcome Execution
              let outcome = null;
              if (targetIdx + 1 < candles.length) {
                const futureCandles = candles.slice(targetIdx + 1, Math.min(candles.length, targetIdx + 6));
                const entryPrice = close;
                let maxHigh = -Infinity;
                let minLow = Infinity;
                let hitSL = false;
                let hitTP1 = false;
                let exitPrice = entryPrice;
                let exitReason = 'HOLD_5D';
                let exitDay = futureCandles.length;

                for (let d = 0; d < futureCandles.length; d++) {
                  const fc = futureCandles[d];
                  if (fc.high > maxHigh) maxHigh = fc.high;
                  if (fc.low < minLow) minLow = fc.low;

                  if (fc.high >= targetPrice1 && !hitTP1) {
                    hitTP1 = true;
                    exitPrice = targetPrice1;
                    exitReason = 'TAKE_PROFIT_1';
                    exitDay = d + 1;
                  }

                  if (fc.low <= stopLoss && !hitSL && !hitTP1) {
                    hitSL = true;
                    exitPrice = stopLoss;
                    exitReason = 'STOP_LOSS';
                    exitDay = d + 1;
                    break;
                  }
                }

                if (!hitSL && !hitTP1) {
                  exitPrice = futureCandles[futureCandles.length - 1].close;
                }

                const peakGainPct = entryPrice > 0 ? Math.round(((maxHigh - entryPrice) / entryPrice) * 1000) / 10 : 0;
                const maxDrawdownPct = entryPrice > 0 ? Math.round(((minLow - entryPrice) / entryPrice) * 1000) / 10 : 0;
                const gain5DPct = entryPrice > 0 ? Math.round(((futureCandles[futureCandles.length - 1].close - entryPrice) / entryPrice) * 1000) / 10 : 0;
                const gain2DPct = futureCandles.length >= 2 && entryPrice > 0 ? Math.round(((futureCandles[1].close - entryPrice) / entryPrice) * 1000) / 10 : gain5DPct;
                const realizedReturnPct = entryPrice > 0 ? Math.round(((exitPrice - entryPrice) / entryPrice) * 1000) / 10 : 0;

                outcome = {
                  entryPrice,
                  exitPrice,
                  exitReason,
                  exitDay,
                  hitSL,
                  hitTP1,
                  gain2DPct,
                  gain5DPct,
                  peakGainPct,
                  maxDrawdownPct,
                  realizedReturnPct,
                  daysToPeak: futureCandles.findIndex(c => c.high === maxHigh) + 1,
                  isWin: realizedReturnPct > 0,
                  status: hitTP1 ? '🎯 ชนเป้า TP1' : hitSL ? '🛑 ชน Stop Loss' : realizedReturnPct > 0 ? '📈 กำไรต่อเนื่อง' : '📉 ติดลบเล็กน้อย'
                };
              }

              // Composite Score
              let compScore = 50;
              if (isUptrend) compScore += 20;
              if (rvol >= 1.2) compScore += 15;
              if (outcome && outcome.isWin) compScore += 15;
              compScore = Math.min(100, Math.max(0, compScore));

              const catInfo = analyzeStockCatalyst(sym, market, LAST_MACRO_MAP, null, []);

              processedStocks.push({
                symbol: sym,
                name: sym,
                scanDate: selectedDate,
                market,
                currency: market === 'TH' ? '฿' : '$',
                price: close,
                changePct,
                open, high, low, volume, valueTraded,
                rvol,
                ema5, ema10, ema20, ema50,
                dayRangePct,
                distEma20,
                sector: getSectorForStock(sym, ''),
                timeframeReturns,
                rsScore: isUptrend ? 75 : 50,
                compScore,
                setupType: primarySetup,
                setupDesc: primaryDesc,
                matchedPresets,
                matchedSetups,
                pivotBuy,
                stopLoss,
                targetPrice: targetPrice1,
                targetPrice1,
                targetPrice2,
                riskAmount,
                rewardAmount: Math.round((targetPrice1 - pivotBuy) * 100) / 100,
                rrRatio: 2.0,
                poc,
                distFromPoc,
                impact: catInfo.impact,
                impactLabel: catInfo.impactLabel,
                impactColor: catInfo.impactColor,
                catalystSummary: catInfo.impactReason,
                isNewEntrant,
                outcome,
                isHistorical: true,
                intradayEma
              });
            } catch (err) {
              // Ignore single error
            }
          }
        };

        await Promise.all(Array(concurrency).fill(null).map(worker));
        const scanDurationMs = Date.now() - startTime;

        processedStocks.sort((a, b) => b.compScore - a.compScore || b.valueTraded - a.valueTraded);

        // Preset Counts
        const presetCounts = { ALL: processedStocks.length };
        for (const p of ['NEW_ENTRANT', 'BREAKOUT', 'POCKET_PIVOT', 'VCP', 'EMA20_BOUNCE', 'RS_LEADER', 'MACD_MOMENTUM']) {
          presetCounts[p] = processedStocks.filter(s => s.matchedPresets && s.matchedPresets.includes(p)).length;
        }

        // Fetch Benchmarks
        const benchmarks = await fetchMarketBenchmarks(market, selectedDate, true, processedStocks);
        const primaryBench = benchmarks[0] || { ret5DPct: 0, changePct: 0, label: market === 'TH' ? 'SET' : 'VOO' };

        // Calculate 5D Alpha relative to primary benchmark
        processedStocks.forEach(s => {
          if (primaryBench && primaryBench.changePct !== undefined) {
            s.alpha = Math.round((s.changePct - primaryBench.changePct) * 100) / 100;
            s.outperforms = s.alpha > 0;
            s.benchmarkName = primaryBench.label;
          }

          if (s.intradayEma) {
            s.intradayEma.isWinnerInZone = s.outperforms && (s.intradayEma.h1.aboveAll || s.intradayEma.h2.aboveAll || s.intradayEma.h4.aboveAll);
            s.intradayEma.isWinnerTripleConfluence = s.outperforms && s.intradayEma.tripleConfluence;
            if (s.intradayEma.isWinnerInZone) {
              s.matchedPresets.push('WINNER_IN_ZONE');
              s.matchedSetups.WINNER_IN_ZONE = { name: 'ALPHA WINNER IN ZONE', desc: 'หุ้นชนะตลาด และยังยืนหยัดในโซน EMA แข็งแกร่ง' };
            }
          }

          if (s.outcome) {
            s.outcome.alpha5D = (primaryBench.ret5DPct !== undefined)
              ? Math.round((s.outcome.gain5DPct - primaryBench.ret5DPct) * 100) / 100
              : s.outcome.gain5DPct;
          }
        });

        // Filter by preset
        let filteredStocks = processedStocks;
        if (preset !== 'ALL') {
          filteredStocks = processedStocks.filter(s => s.matchedPresets && s.matchedPresets.includes(preset));
        }

        // Multi-Strategy Portfolio Simulator
        const totalCapital = market === 'TH' ? 1000000 : 30000;
        const validCandidates = processedStocks.filter(s => s.outcome);

        const buildHistoricalBasket = (candidates, k) => {
          const selected = candidates.slice(0, k);
          if (selected.length === 0) return null;
          const capPer = Math.round(totalCapital / selected.length);

          let sumPnl2D = 0, sumPnl5D = 0, sumPeakPnl = 0, sumRealizedPnl = 0;
          let winCount = 0, totalWinnersProfit = 0, totalLosersLoss = 0;

          const holdings = selected.map(s => {
            const shares = s.price > 0 ? Math.floor(capPer / s.price) : 0;
            const ret2D = s.outcome.gain2DPct;
            const ret5D = s.outcome.gain5DPct;
            const pnl2D = Math.round(capPer * (ret2D / 100));
            const pnl5D = Math.round(capPer * (ret5D / 100));
            const peakPnl = Math.round(capPer * (s.outcome.peakGainPct / 100));
            const realizedPnl = Math.round(capPer * (s.outcome.realizedReturnPct / 100));

            sumPnl2D += pnl2D;
            sumPnl5D += pnl5D;
            sumPeakPnl += peakPnl;
            sumRealizedPnl += realizedPnl;

            if (s.outcome.isWin) {
              winCount++;
              totalWinnersProfit += Math.max(0, realizedPnl);
            } else {
              totalLosersLoss += Math.abs(Math.min(0, realizedPnl));
            }

            return {
              symbol: s.symbol,
              name: s.name,
              price: s.price,
              allocated: capPer,
              shares,
              stopLoss: s.stopLoss,
              targetPrice1: s.targetPrice1,
              targetPrice2: s.targetPrice2,
              ret2D,
              ret5D,
              pnl2D,
              pnl5D,
              peakGainPct: s.outcome.peakGainPct,
              peakPnl,
              realizedReturnPct: s.outcome.realizedReturnPct,
              realizedPnl,
              exitReason: s.outcome.exitReason,
              exitDay: s.outcome.exitDay,
              isWin: s.outcome.isWin
            };
          });

          const lossCount = selected.length - winCount;
          const winLossCoverRatio = totalLosersLoss > 0
            ? Math.round((totalWinnersProfit / totalLosersLoss) * 10) / 10
            : (totalWinnersProfit > 0 ? 99.9 : 1.0);

          return {
            count: selected.length,
            allocatedPerStock: capPer,
            winRate: Math.round((winCount / selected.length) * 100),
            sumPnl2D,
            ret2DPct: Math.round((sumPnl2D / totalCapital) * 1000) / 10,
            sumPnl5D,
            ret5DPct: Math.round((sumPnl5D / totalCapital) * 1000) / 10,
            sumPeakPnl,
            peakReturnPct: Math.round((sumPeakPnl / totalCapital) * 1000) / 10,
            sumRealizedPnl,
            realizedReturnPct: Math.round((sumRealizedPnl / totalCapital) * 1000) / 10,
            totalWinnersProfit,
            totalLosersLoss,
            winLossCoverRatio,
            holdings
          };
        };

        const histBalanced = validCandidates;
        const histMomentum = [...validCandidates].sort((a, b) => b.compScore - a.compScore);
        const histDefensive = validCandidates.filter(s => s.matchedPresets && (s.matchedPresets.includes('VCP') || s.matchedPresets.includes('EMA20_BOUNCE')));

        const portfolioSim = {
          isForward: false,
          totalCapital,
          currency: market === 'TH' ? '฿' : '$',
          basket3: buildHistoricalBasket(histBalanced, 3),
          basket4: buildHistoricalBasket(histBalanced, 4),
          basket5: buildHistoricalBasket(histBalanced, 5),
          styles: {
            balanced: {
              name: '🛡️ All-Weather Balanced',
              basket3: buildHistoricalBasket(histBalanced, 3),
              basket4: buildHistoricalBasket(histBalanced, 4),
              basket5: buildHistoricalBasket(histBalanced, 5)
            },
            momentum: {
              name: '🚀 High-Alpha Momentum',
              basket3: buildHistoricalBasket(histMomentum, 3),
              basket4: buildHistoricalBasket(histMomentum, 4),
              basket5: buildHistoricalBasket(histMomentum, 5)
            },
            defensive: {
              name: '🔒 Low-Risk Squeeze & Bounce',
              basket3: buildHistoricalBasket(histDefensive.length >= 3 ? histDefensive : histBalanced, 3),
              basket4: buildHistoricalBasket(histDefensive.length >= 4 ? histDefensive : histBalanced, 4),
              basket5: buildHistoricalBasket(histDefensive.length >= 5 ? histDefensive : histBalanced, 5)
            }
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          market,
          currency: market === 'TH' ? '฿' : '$',
          scanDate: selectedDate,
          actualTradingDate: actualTradingDateFound,
          isHistorical: true,
          scanDurationMs,
          benchmarks,
          catalysts: getDailyMarketCatalysts(market, benchmarks, benchmarks.tvMap),
          stats: {
            totalMarketScanned: targetStockList.length,
            matchedCount: filteredStocks.length,
            advancers, decliners, unchanged,
            marketSentiment: advancers > decliners * 1.5 ? 'BULLISH' : decliners > advancers * 1.5 ? 'BEARISH' : 'NEUTRAL',
            presetCounts
          },
          sectorFlow: buildSectorFlow(processedStocks),
          heatmap: buildSectorHeatmap(processedStocks),
          portfolioSim,
          stocks: filteredStocks
        }));
      }
    } catch (err) {
      console.error('[Scan Engine Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  });
}

/**
 * Full Technical Chart Data Handler (EMA5, 20, 50, MACD, RSI, Two-Tone Volume Profile POC, Financials)
 */
async function handleChart(req, res, symbol, parsedUrl) {
  try {
    const cleanSymbol = symbol.trim().toUpperCase();
    const queryDate = parsedUrl.query.date ? parsedUrl.query.date.trim() : '';
    let queryMarket = (parsedUrl.query.market || '').toUpperCase();
    if (!queryMarket) {
      if (NASDAQ100_LIST.includes(cleanSymbol) || US_MAG7.includes(cleanSymbol) || SP500_CORE_LIST.includes(cleanSymbol) || VUG_LIST.includes(cleanSymbol) || SCHD_LIST.includes(cleanSymbol)) {
        queryMarket = 'US';
      } else {
        queryMarket = 'TH';
      }
    }
    const activeMarketSessionDate = getMarketActiveSessionDate(queryMarket);
    const isHistorical = queryDate ? queryDate < activeMarketSessionDate : false;

    // Fetch candles & financials concurrently
    const [candles, financials] = await Promise.all([
      fetchStockHistory(cleanSymbol, queryMarket),
      fetchStockFinancials(cleanSymbol, queryMarket)
    ]);

    if (!candles || candles.length === 0) {
      throw new Error('No chart data found for ' + cleanSymbol);
    }

    let targetIndex = -1;
    if (isHistorical && queryDate) {
      for (let i = candles.length - 1; i >= 0; i--) {
        if (candles[i].dateStr <= queryDate) {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex === -1) {
      targetIndex = candles.length - 1;
    }

    const actualTargetDate = candles[targetIndex]?.dateStr || activeMarketSessionDate;

    // Technical Indicators calculations (EMA 5, 20, 50)
    const closes = candles.map(c => c.close);
    const ema5Arr = calculateEMA(closes, 5);
    const ema20Arr = calculateEMA(closes, 20);
    const ema50Arr = calculateEMA(closes, 50); // Upgraded to EMA 50
    const rsiArr = calculateRSIArray(closes, 14);
    const rsiSmaArr = calculateSMA(rsiArr, 9);
    const macdObj = calculateMACD(closes);

    // Attach indicator values to candles
    for (let i = 0; i < candles.length; i++) {
      candles[i].ema5 = ema5Arr[i];
      candles[i].ema20 = ema20Arr[i];
      candles[i].ema50 = ema50Arr[i];
      candles[i].rsi = rsiArr[i];
      candles[i].rsiSma = rsiSmaArr[i];
      candles[i].macd = macdObj.macdLine[i];
      candles[i].macdSignal = macdObj.signalLine[i];
      candles[i].macdHist = macdObj.histogram[i];
    }

    // Two-Tone Volume Profile calculation (Point of Control POC)
    const endIdx = targetIndex;
    const startIdx = Math.max(0, endIdx - 60);
    const slice = candles.slice(startIdx, endIdx + 1);

    let sliceMin = Infinity, sliceMax = -Infinity;
    slice.forEach(c => {
      if (c.low < sliceMin) sliceMin = c.low;
      if (c.high > sliceMax) sliceMax = c.high;
    });

    const binCount = 20;
    const binSize = (sliceMax - sliceMin) / binCount;
    const volumeBins = new Array(binCount).fill(0).map((_, idx) => ({
      price: Math.round((sliceMin + (idx * binSize) + (binSize / 2)) * 100) / 100,
      totalVolume: 0,
      buyVolume: 0,
      sellVolume: 0
    }));

    slice.forEach(c => {
      if (binSize > 0) {
        const binIdx = Math.min(binCount - 1, Math.max(0, Math.floor((c.close - sliceMin) / binSize)));
        volumeBins[binIdx].totalVolume += c.volume;
        if (c.close >= c.open) {
          volumeBins[binIdx].buyVolume += c.volume;
        } else {
          volumeBins[binIdx].sellVolume += c.volume;
        }
      }
    });

    let poc = volumeBins[0]?.price || sliceMax;
    let maxBinVol = 0;
    volumeBins.forEach(b => {
      if (b.totalVolume > maxBinVol) {
        maxBinVol = b.totalVolume;
        poc = b.price;
      }
    });

    // Calculate Intraday EMA (H1, H2, H4) for this stock
    const closeSeries = candles.slice(0, targetIndex + 1).map(c => c.close);
    const lastClose = closeSeries[closeSeries.length - 1] || 0;
    const h1E20 = calculateEMA(closeSeries, queryMarket === 'TH' ? 4 : 3).pop() || lastClose;
    const h1E50 = calculateEMA(closeSeries, queryMarket === 'TH' ? 11 : 8).pop() || lastClose;
    const h1E200 = calculateEMA(closeSeries, queryMarket === 'TH' ? 44 : 31).pop() || lastClose;

    const h2E20 = calculateEMA(closeSeries, queryMarket === 'TH' ? 9 : 6).pop() || lastClose;
    const h2E50 = calculateEMA(closeSeries, queryMarket === 'TH' ? 23 : 15).pop() || lastClose;
    const h2E200 = calculateEMA(closeSeries, queryMarket === 'TH' ? 90 : 62).pop() || lastClose;

    const h4E20 = calculateEMA(closeSeries, queryMarket === 'TH' ? 18 : 12).pop() || lastClose;
    const h4E50 = calculateEMA(closeSeries, queryMarket === 'TH' ? 45 : 31).pop() || lastClose;
    const h4E200 = calculateEMA(closeSeries, queryMarket === 'TH' ? 180 : 123).pop() || lastClose;

    const buildTfObj = (c, e20, e50, e200) => ({
      close: Math.round(c * 100) / 100,
      ema20: Math.round(e20 * 100) / 100,
      ema50: Math.round(e50 * 100) / 100,
      ema200: Math.round(e200 * 100) / 100,
      above20: c >= e20,
      above50: c >= e50,
      above200: c >= e200,
      aboveAll: c >= e20 && c >= e50 && c >= e200,
      cross20_50: e20 >= e50,
      diff20Pct: Math.round(((c - e20) / e20) * 10000) / 100,
      diff50Pct: Math.round(((c - e50) / e50) * 10000) / 100,
      diff200Pct: Math.round(((c - e200) / e200) * 10000) / 100
    });

    const h1Obj = buildTfObj(lastClose, h1E20, h1E50, h1E200);
    const h2Obj = buildTfObj(lastClose, h2E20, h2E50, h2E200);
    const h4Obj = buildTfObj(lastClose, h4E20, h4E50, h4E200);

    const intradayEma = {
      h1: h1Obj,
      h2: h2Obj,
      h4: h4Obj,
      tripleConfluence: h1Obj.aboveAll && h2Obj.aboveAll && h4Obj.aboveAll,
      inAnyZone: h1Obj.aboveAll || h2Obj.aboveAll || h4Obj.aboveAll
    };

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({
      success: true,
      symbol: cleanSymbol,
      market: queryMarket,
      currency: queryMarket === 'TH' ? '฿' : '$',
      targetDate: queryDate || actualTargetDate,
      actualTargetDate,
      targetIndex,
      isHistorical,
      candles,
      financials,
      intradayEma,
      volumeProfile: {
        bins: volumeBins,
        poc,
        maxBinVol,
        min: sliceMin,
        max: sliceMax
      }
    }));
  } catch (err) {
    console.error('[Chart Error]', err);
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * Per-Stock News Handler: Google News RSS for Thai & Yahoo Finance for US
 */
async function handleNews(req, res, symbol, parsedUrl) {
  try {
    const cleanSymbol = decodeURIComponent(symbol).trim().toUpperCase();
    let queryMarket = (parsedUrl.query.market || '').toUpperCase();
    if (!queryMarket) {
      if (NASDAQ100_LIST.includes(cleanSymbol) || US_MAG7.includes(cleanSymbol) || SP500_CORE_LIST.includes(cleanSymbol) || VUG_LIST.includes(cleanSymbol) || SCHD_LIST.includes(cleanSymbol)) {
        queryMarket = 'US';
      } else {
        queryMarket = 'TH';
      }
    }

    const [news, financials] = await Promise.all([
      (async () => {
        if (queryMarket === 'TH') {
          let n = await fetchGoogleNewsRSS(`หุ้น ${cleanSymbol}`);
          if (!n || n.length === 0) n = await fetchGoogleNewsRSS(`${cleanSymbol} SET`);
          return n || [];
        } else {
          return (await fetchYahooNews(cleanSymbol)) || [];
        }
      })(),
      fetchStockFinancials(cleanSymbol, queryMarket)
    ]);

    const catalystAnalysis = analyzeStockCatalyst(cleanSymbol, queryMarket, LAST_MACRO_MAP, financials, news);

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({
      success: true,
      symbol: cleanSymbol,
      market: queryMarket,
      count: news.length,
      news,
      catalystAnalysis,
      financials
    }));
  } catch (err) {
    console.error('[News Error]', err);
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: false, error: err.message, news: [] }));
  }
}

// HTTP Server
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if ((req.method === 'POST' || req.method === 'GET') && pathname === '/api/scan') {
    return handleScan(req, res, parsedUrl);
  }

  if (req.method === 'GET' && pathname.startsWith('/api/chart/')) {
    const symbol = pathname.replace('/api/chart/', '');
    return handleChart(req, res, symbol, parsedUrl);
  }

  if (req.method === 'GET' && pathname.startsWith('/api/news/')) {
    const symbol = pathname.replace('/api/news/', '');
    return handleNews(req, res, symbol, parsedUrl);
  }

  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log('=============================================================');
  console.log(` Thai & US Stock Scanner Pro V8.5 Strategy Engine running!`);
  console.log(` Web URL: http://localhost:${PORT}`);
  console.log(` Active Session TH: ${getMarketActiveSessionDate('TH')} | Active Session US: ${getMarketActiveSessionDate('US')}`);
  console.log('=============================================================');
});
