@echo off
title MyBilling ERP Launcher
echo ========================================================
echo   Launching MyBilling Wholesale ^& Retail ERP
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "MyBilling Backend (Port 8000)" cmd /k "python run_backend.py"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
cd frontend
npm run dev
