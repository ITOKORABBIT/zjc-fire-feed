@echo off
rem 抓取新竹市消防局即時案件並推上 GitHub。
rem 由 Windows 工作排程「莊競程-消防即時案件」每 10 分鐘呼叫（透過 run-hidden.vbs 靜音執行）。
rem 為什麼要在這台電腦跑：消防局擋機房 IP，Cloudflare 與 GitHub runner 都連不到，
rem 只有一般網路連得上。詳見 README.md。
cd /d "%~dp0"
node fetch.mjs >> fetch.log 2>&1
if errorlevel 1 (
  echo [%date% %time%] fetch 失敗 >> fetch.log
  exit /b 1
)
git add fire-cases.json
git diff --staged --quiet && exit /b 0
git commit -q -m "更新消防即時案件" >> fetch.log 2>&1
git push -q origin main >> fetch.log 2>&1
