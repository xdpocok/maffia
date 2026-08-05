@echo off
if /I "%1"=="start" (
  shift
  "C:\Users\Montech\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js %*
  exit /b %ERRORLEVEL%
)
echo This lightweight npm shim only supports: npm start
echo For this project it runs: node server.js
exit /b 1
