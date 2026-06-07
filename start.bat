@echo off
chcp 65001 >nul
title ShifoAI
cls
echo.
echo  ShifoAI ishga tushmoqda...
echo.

REM ===== 1. Frontend build =====
echo [1/4] Frontend build...
cd /d "%~dp0frontend"
call npm run build 2>nul
if not exist "%~dp0frontend\dist\index.html" (
    echo XATO: Build muvaffaqiyatsiz! npm install ni sinab koring.
    pause
    exit /b 1
)
echo  OK - Frontend tayyor
echo.

REM ===== 2. API Server =====
echo [2/4] API server ishga tushirilmoqda...
start "ShifoAI-API" "%~dp0_run_api.bat"
timeout /t 5 /nobreak >nul
echo  OK - API server port 8000
echo.

REM ===== 3. Telegram Bot =====
echo [3/4] Telegram Bot ishga tushirilmoqda...
start "ShifoAI-Bot" "%~dp0_run_bot.bat"
timeout /t 3 /nobreak >nul
echo  OK - Bot ishga tushdi
echo.

REM ===== 4. Tunnel =====
echo [4/4] Cloudflare tunnel ochilmoqda...
start "ShifoAI-Tunnel" "%~dp0_run_tunnel.bat"
echo  OK - Tunnel oynasi ochildi
echo.

echo =========================================
echo  Hammasi ishga tushdi!
echo.
echo  KEYINGI QADAM:
echo  Tunnel oynasida URL ni toping va
echo  update_url.bat ni ishga tushiring.
echo =========================================
echo.
pause
