@echo off
echo ============================================================
echo Starting Project Delivery Dashboard FastAPI Backend...
echo ============================================================
cd /d "%~dp0backend"
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
