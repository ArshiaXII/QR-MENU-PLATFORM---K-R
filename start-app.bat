@echo off
echo Starting QR Menu Platform...
echo.

echo Checking if servers are already running...
:: Check for node processes
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "node.exe" >NUL

if %ERRORLEVEL% EQU 0 (
    echo WARNING: Node processes are already running. You might want to close them first.
    echo If you're experiencing connection issues, try killing any existing Node processes.
    echo.
    pause
)

echo Starting Backend Server... (Keep this window open!)
start cmd /k "cd backend && echo Starting backend on http://localhost:5000 && npm start"

echo.
echo Starting Frontend Development Server...
echo (Wait for backend to start first)
timeout /t 5
start cmd /k "cd frontend && echo Starting frontend on http://localhost:3000 && npm start"

echo.
echo Both servers should be starting up.
echo - Backend at: http://localhost:5000
echo - Frontend at: http://localhost:3000
echo.
echo IMPORTANT TROUBLESHOOTING:
echo 1. If you see 'ERR_CONNECTION_REFUSED', make sure the backend server is running
echo 2. Check both terminal windows for any error messages
echo 3. If problems persist, try restarting both servers
echo.
echo (You can close this window, but keep the other command windows open)
echo.
pause 