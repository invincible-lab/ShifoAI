@echo off
chcp 65001 >nul
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python bot.py
pause
