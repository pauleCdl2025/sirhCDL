# Script pour créer toutes les tables manquantes

Write-Host "Creation de toutes les tables manquantes..." -ForegroundColor Yellow

# Parametres de connexion
$env:PGPASSWORD = "Cdl202407"

# Chemin vers le script SQL
$SQL_FILE = "creer_toutes_tables_manquantes.sql"

Write-Host "Execution du script SQL: $SQL_FILE" -ForegroundColor Cyan

try {
    # Executer le script SQL
    $result = psql -h localhost -p 5432 -U postgres -d rh_portal -f $SQL_FILE 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Tables creees avec succes!" -ForegroundColor Green
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "Erreur lors de la creation des tables:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "Exception lors de l'execution:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Nettoyer
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "Script termine!" -ForegroundColor Green








