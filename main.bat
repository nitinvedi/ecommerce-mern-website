@echo off
echo Starting Frontend and Backend...

:: Start Backend
start cmd /k "cd backend && npm run dev"

:: Start Frontend
start cmd /k "cd frontend && npm run dev"

echo Both services started.
