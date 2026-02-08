Write-Host "🚀 Démarrage des serveurs pour les notifications en temps réel..." -ForegroundColor Green

Write-Host ""
Write-Host "📡 Démarrage du serveur backend avec WebSocket..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

Write-Host ""
Write-Host "⏳ Attente de 3 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎨 Démarrage du serveur frontend..." -ForegroundColor Blue
$env:PORT = "3001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host ""
Write-Host "✅ Serveurs démarrés !" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔌 Backend: http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Pour tester les notifications en temps réel:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   node test_realtime.js notification" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")







