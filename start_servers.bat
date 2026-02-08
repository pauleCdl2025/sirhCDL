@echo off
echo 🚀 Démarrage des serveurs pour les notifications en temps réel...

echo.
echo 📡 Démarrage du serveur backend avec WebSocket...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo ⏳ Attente de 3 secondes...
timeout /t 3 /nobreak > nul

echo.
echo 🎨 Démarrage du serveur frontend...
start "Frontend Server" cmd /k "set PORT=3001 && npm start"

echo.
echo ✅ Serveurs démarrés !
echo 📱 Frontend: http://localhost:3001
echo 🔌 Backend: http://localhost:5001
echo.
echo 💡 Pour tester les notifications en temps réel:
echo    cd backend
echo    node test_realtime.js notification
echo.
pause







