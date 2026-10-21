@echo off
rem Starts the Alpha Genba website on this computer: double-click this file.
rem Two windows open (backend and website). Close them, or press Ctrl+C in each, to stop.

cd /d "%~dp0"

if not exist "web\node_modules" (
  echo Installing website tools for the first time...
  pushd web
  call npm install
  popd
)

start "Alpha Genba - backend" cmd /k go run ./backend
start "Alpha Genba - website" cmd /k "cd web && npm run dev"

echo Starting... the website will open in your browser in a few seconds.
timeout /t 12 /nobreak >nul
start "" http://localhost:3000
