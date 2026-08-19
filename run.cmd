@echo off
rem Fetch Hsinchu fire dispatch cases and push to GitHub.
rem Called every 10 min by Windows Task Scheduler via run-hidden.vbs.
rem Why local: 119.hcfd.gov.tw blocks datacenter IPs (Cloudflare / GitHub runners).
rem See README.md for details.
cd /d "%~dp0"
node fetch.mjs >> fetch.log 2>&1
if errorlevel 1 (
  echo [%date% %time%] fetch failed >> fetch.log
  exit /b 1
)
git add fire-cases.json
git diff --staged --quiet && exit /b 0
git commit -q -m "update fire cases" >> fetch.log 2>&1
git push -q origin main >> fetch.log 2>&1
