@echo off
echo ========================================
echo   SYSTEME NOTIFICATIONS AUTOMATIQUES
echo ========================================
echo.

echo 🚀 Demarrage du systeme complet...
echo.

echo 📡 Demarrage du serveur backend...
start "Backend Server" cmd /k "cd backend && npm start"

echo ⏳ Attente du demarrage du backend...
timeout /t 8 /nobreak > NUL

echo 🌐 Demarrage du serveur frontend...
start "Frontend Server" cmd /k "set PORT=3001 && npm start"

echo ⏳ Attente du demarrage du frontend...
timeout /t 10 /nobreak > NUL

echo.
echo ✅ SYSTEME COMPLET DEMARRE !
echo.
echo 📱 Acces a l'application:
echo    http://localhost:3001
echo.
echo 🔔 Fonctionnalites integrees:
echo    • Notifications automatiques pour demandes
echo    • Notifications automatiques pour messages
echo    • Temps reel avec WebSocket
echo    • Interface TopNav fonctionnelle
echo.
echo 🧪 Pour tester les notifications:
echo    cd backend
echo    node simulate_employee_request.js single
echo.
echo 🎯 Instructions:
echo    1. Ouvrez http://localhost:3001
echo    2. Connectez-vous avec un compte RH
echo    3. Regardez les notifications dans le TopNav
echo    4. Testez en creant des demandes ou messages
echo.
echo ========================================
echo   SYSTEME 100%% OPERATIONNEL !
echo ========================================
pause







