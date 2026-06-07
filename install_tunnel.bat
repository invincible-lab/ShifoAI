@echo off
chcp 65001 >nul
cls
echo.
echo  Cloudflared o'rnatilmoqda (eng ishonchli tunnel)...
echo.

REM 64-bit Windows uchun cloudflared yuklab olish
curl -Lo "%TEMP%\cloudflared.exe" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"

if errorlevel 1 (
    echo XATO: Yuklab bo'lmadi. Internet aloqasini tekshiring.
    pause
    exit /b 1
)

REM System PATH ga qo'shish
copy /Y "%TEMP%\cloudflared.exe" "%SystemRoot%\System32\cloudflared.exe" >nul 2>&1
if errorlevel 1 (
    REM Admin huquqi yo'q bo'lsa, lokal saqlash
    copy /Y "%TEMP%\cloudflared.exe" "%~dp0cloudflared.exe" >nul
    echo cloudflared.exe ShifoAI papkasiga saqlandi.
) else (
    echo cloudflared System PATH ga qo'shildi.
)

echo.
echo  [OK] Cloudflared o'rnatildi!
echo  Endi start.bat ni ishga tushiring.
echo.
pause
