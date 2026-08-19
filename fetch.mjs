/**
 * 從新竹市消防局即時案件頁抓資料，解析成 JSON 寫進 fire-cases.json。
 *
 * 為什麼要在 GitHub Actions 上跑：消防局伺服器（223.200.11.92）擋掉
 * Cloudflare 的 IP，網站所在的 Cloudflare Workers 直接 fetch 一律 522 逾時。
 * GitHub 的 runner 連得到，所以由這裡定期抓好，網站再讀這份 JSON。
 */
import { writeFile } from 'node:fs/promises';

const SOURCE_URL = 'https://119.hcfd.gov.tw/DTS/caselist/html';

function parseTaiwanTime(raw) {
  const m = String(raw || '').trim().match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const iso = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}T` +
    `${m[4].padStart(2, '0')}:${m[5]}:${(m[6] || '00').padStart(2, '0')}+08:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function text(html) {
  return String(html || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 來源的「執行狀況」是自由文字，沒看過的字串一律 unknown，不猜。 */
function classify(status) {
  const s = String(status || '');
  if (s.includes('返隊中')) return 'returning';
  if (s.includes('已返隊') || s.includes('結束')) return 'closed';
  if (s.includes('派遣') || s.includes('出動') || s.includes('處理')) return 'dispatched';
  return 'unknown';
}

const res = await fetch(SOURCE_URL, {
  headers: {
    accept: 'text/html',
    'user-agent': 'Mozilla/5.0 (compatible; zjc-fire-feed/1.0; +https://zjc-helper.pages.dev)',
  },
});
if (!res.ok) throw new Error(`來源回應 ${res.status}`);
const html = await res.text();

const items = [];
for (const row of html.match(/<tr[\s\S]*?<\/tr>/gi) || []) {
  const cells = (row.match(/<td[\s\S]*?<\/td>/gi) || []).map(text);
  if (cells.length < 6) continue; // 表頭是 <th>，抓不到 <td>
  const [seq, receivedRaw, category, place, unit, status] = cells;
  const receivedAt = parseTaiwanTime(receivedRaw);
  if (!receivedAt) continue;
  items.push({
    seq: Number.parseInt(seq, 10) || null,
    receivedAt: receivedAt.toISOString(),
    category,
    place,
    unit,
    status,
    state: classify(status),
  });
}

if (!items.length) throw new Error('來源沒有可解析的案件列');
items.sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));

await writeFile(
  'fire-cases.json',
  JSON.stringify({ source: '新竹市消防局 即時案件', sourceUrl: SOURCE_URL, fetchedAt: new Date().toISOString(), count: items.length, items }, null, 1) + '\n'
);
console.log(`寫入 ${items.length} 筆`);
