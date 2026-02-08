@echo off
echo ========================================
echo   INTEGRATION NKOMA PORTAL - TEMPS REEL
echo ========================================
echo.

echo 🚀 Demarrage de l'integration NKOMA Portal...
echo.

echo 📡 Demarrage du serveur backend...
start "Backend Server" cmd /k "cd backend && npm start"

echo ⏳ Attente du demarrage du backend...
timeout /t 8 /nobreak > NUL

echo 🌐 Demarrage du serveur frontend...
start "Frontend Server" cmd /k "set PORT=3001 && npm start"

echo ⏳ Attente du demarrage du frontend...
timeout /t 10 /nobreak > NUL

echo 🔔 Demarrage de la surveillance des demandes...
start "NKOMA Integration" cmd /k "cd backend && node integration_nkoma_portal.js start"

echo.
echo ✅ SYSTEME COMPLET DEMARRE !
echo.
echo 📱 Acces a l'application:
echo    http://localhost:3001
echo.
echo 🔔 Surveillance active:
echo    • Verification toutes les 5 secondes
echo    • Notifications automatiques pour nouvelles demandes
echo    • Temps reel avec WebSocket
echo.
echo 🎯 Instructions:
echo    1. Ouvrez http://localhost:3001
echo    2. Connectez-vous avec un compte RH
echo    3. Faites une demande de conge sur le portail NKOMA
echo    4. Regardez les notifications apparaître automatiquement
echo.
echo 📊 Pour voir les statistiques:
echo    cd backend
echo    node integration_nkoma_portal.js stats
echo.
echo ========================================
echo   SURVEILLANCE TEMPS REEL ACTIVE !
echo ========================================
pause







