@echo off
chcp 65001 >nul
title ShifoAI - Tunnel
cls
echo.
echo  Cloudflare tunnel ochilmoqda...
echo  (Chiqadigan https://....trycloudflare.com URL ni nusxalang)
echo.
cloudflared tunnel --url http://localhost:8000
pause
