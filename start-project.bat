@echo off
cd /d "%~dp0"

REM Set local dev environment variables if they are not already present.
REM This keeps secrets out of the repo and makes local setup safer.
if not defined POSTGRES_HOST set POSTGRES_HOST=127.0.0.1
if not defined POSTGRES_PORT set POSTGRES_PORT=5432
if not defined POSTGRES_USER set POSTGRES_USER=postgres
if not defined PGPASSWORD set PGPASSWORD=postgres

REM --- Backend ---
start "Backend API" powershell -NoExit -Command "cd '%~dp0backend'; $env:PGPASSWORD='%PGPASSWORD%'; $env:POSTGRES_HOST='%POSTGRES_HOST%'; $env:POSTGRES_PORT='%POSTGRES_PORT%'; $env:POSTGRES_USER='%POSTGRES_USER%'; Remove-Item -Force tmp/pids/server.pid -ErrorAction SilentlyContinue; bundle exec rails server -b 0.0.0.0 -p 3000"

REM --- Frontend ---
start "Frontend App" powershell -NoExit -Command "cd '%~dp0frontend'; npm install; npm run dev -- --host 0.0.0.0"

REM --- Info ---
echo.
echo Project started.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
exit /b 0
