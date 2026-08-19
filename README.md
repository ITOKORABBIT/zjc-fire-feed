# zjc-fire-feed

新竹市消防局「119 即時案件」的轉存。

- 來源：<https://119.hcfd.gov.tw/DTS/caselist/html>（新竹市消防局公開頁面）
- 每 10 分鐘由 GitHub Actions 抓取一次，解析成 `fire-cases.json`
- 供 <https://zjc-helper.pages.dev> 讀取

**為什麼需要這個轉存**：消防局伺服器擋掉 Cloudflare 的 IP，
網站所在的 Cloudflare Workers 直接連線一律逾時（522）。
GitHub 的伺服器連得到，所以由這裡定期抓好再給網站讀。

本倉庫只存放公開的政府資料與抓取腳本，不含網站原始碼。
