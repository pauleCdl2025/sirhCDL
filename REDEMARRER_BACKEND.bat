@echo off
echo ========================================
echo   Redemarrage du Backend SIRH
echo ========================================
echo.

cd backend

echo Arret des processus Node.js existants...
taskkill /F /IM node.exe 2>nul

echo.
echo Demarrage du serveur backend...
echo.

npm start

pause


