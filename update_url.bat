@echo off
chcp 65001 >nul
cls
echo.
echo  Tunnel URL ni kiriting
echo  (masalan: https://abc123.trycloudflare.com)
echo.
set /p URL="URL: "

cd /d "%~dp0"

REM .env yangilash
python -c "
import sys, re
url = sys.argv[1].strip().rstrip('/')
with open('backend/.env', 'r', encoding='utf-8') as f:
    c = f.read()
if 'WEBAPP_URL' in c:
    c = re.sub(r'WEBAPP_URL=.*', 'WEBAPP_URL=' + url, c)
else:
    c = c.rstrip() + '\nWEBAPP_URL=' + url + '\n'
with open('backend/.env', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK: WEBAPP_URL = ' + url)
" "%URL%"

echo.
echo  Endi @BotFather da:
echo  /mybots - botingiz - Bot Settings
echo  - Menu Button - Edit Menu Button URL
echo  - quyidagi URL ni kiriting:
echo.
echo  %URL%
echo.
echo  Bot qayta ishga tushirilmoqda...
taskkill /FI "WINDOWTITLE eq ShifoAI-Bot" /F >nul 2>&1
timeout /t 2 /nobreak >nul
start "ShifoAI-Bot" "%~dp0_run_bot.bat"
echo  Bot qayta ishga tushdi!
echo.
pause
