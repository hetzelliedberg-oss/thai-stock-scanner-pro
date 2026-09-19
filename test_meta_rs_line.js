const { execSync } = require('child_process');

async function testRsLine() {
  const metaUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/META?interval=1d&range=6mo';
  const qqqUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/QQQ?interval=1d&range=6mo';

  const [metaRes, qqqRes] = await Promise.all([
    fetch(metaUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.json()),
    fetch(qqqUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.json())
  ]);

  const metaQ = metaRes.chart.result[0];
  const qqqQ = qqqRes.chart.result[0];

  const metaDates = metaQ.timestamp.map(ts => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ts * 1000)));
  const metaCloses = metaQ.indicators.quote[0].close;

  const qqqDates = qqqQ.timestamp.map(ts => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ts * 1000)));
  const qqqCloses = qqqQ.indicators.quote[0].close;

  const qqqMap = {};
  qqqDates.forEach((d, i) => { qqqMap[d] = qqqCloses[i]; });

  const rsLine = [];
  for (let i = 0; i < metaDates.length; i++) {
    const d = metaDates[i];
    const mClose = metaCloses[i];
    const qClose = qqqMap[d];
    if (mClose && qClose) {
      rsLine.push({ date: d, close: mClose, qqqClose: qClose, rs: (mClose / qClose) * 1000 });
    }
  }

  // Check 20-day high of RS Line
  console.log('--- META RS Line around late Aug to mid Sep 2026 ---');
  for (let i = 20; i < rsLine.length; i++) {
    const curr = rsLine[i];
    if (curr.date >= '2026-08-20') {
      const past20Rs = rsLine.slice(i - 20, i).map(x => x.rs);
      const max20 = Math.max(...past20Rs);
      const isRsNewHigh = curr.rs >= max20;
      console.log(curr.date, 'Price:', curr.close.toFixed(2), 'QQQ:', curr.qqqClose.toFixed(2), 'RS:', curr.rs.toFixed(2), '20D Max RS:', max20.toFixed(2), 'isRsNewHigh:', isRsNewHigh ? '🔥 NEW HIGH' : '-');
    }
  }
}
testRsLine();
