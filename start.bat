@echo off
rem PEPPY: double-click to run the site on http://127.0.0.1:5191 with its API on :5451
cd /d "%~dp0"
title PEPPY 5191 - jangan ditutup

rem the original PC keeps Node in a portable folder; other PCs use the installed Node
if exist "C:\Users\abayyy\AppData\Local\Programs\node-v24.20.0-win-x64\node.exe" set "PATH=C:\Users\abayyy\AppData\Local\Programs\node-v24.20.0-win-x64;%PATH%"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang. Install versi 22 atau lebih baru dari https://nodejs.org lalu jalankan file ini lagi.
  start "" https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo Pertama kali jalan: memasang dependensi...
  call npm install
)

start "PEPPY API 5451" /min cmd /c npm run api
start "" http://127.0.0.1:5191
node scripts\serve.cjs
pause
