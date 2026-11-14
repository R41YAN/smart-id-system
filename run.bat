@echo off
title Smart ID Formatting System (SIFS) - Launcher
echo ========================================================
echo    Smart ID Formatting System (SIFS) - One-Click Run
echo    Batch: CSE-54, Section: 7B1 (UITS)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Verifying Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [2/3] Checking dependencies...
if not exist "backend\node_modules\" (
    echo Installing backend packages...
    call npm install --prefix backend
)
if not exist "frontend\node_modules\" (
    echo Installing frontend packages...
    call npm install --prefix frontend
)

if not exist "backend\.env" (
    echo [ERROR] backend\.env not found!
    echo Copy backend\.env.example to backend\.env and fill in your database URL and JWT_SECRET.
    pause
    exit /b 1
)

echo [3/3] Launching SIFS Full-Stack Application...
echo Starting Backend API on http://localhost:5000 ...
start "SIFS Backend API (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo Starting Frontend on http://localhost:5173 ...
start "SIFS Frontend UI (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting 3 seconds for Vite server...
timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ========================================================
echo    SIFS is now running!
echo.
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo    Log in with the admin accounts created by "npm run seed -- --reset".
echo ========================================================
echo.
