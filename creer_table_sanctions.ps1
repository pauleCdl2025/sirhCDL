# Script PowerShell pour créer la table des sanctions
# Assurez-vous que PostgreSQL est installé et que psql est dans le PATH

Write-Host "🔧 Création de la table des sanctions..." -ForegroundColor Yellow

# Paramètres de connexion à la base de données
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "rh_portal"
$DB_USER = "postgres"
$DB_PASSWORD = "Cdl202407"

# Chemin vers le script SQL
$SQL_SCRIPT = "verifier_tables_sanctions.sql"

# Vérifier si le script SQL existe
if (-not (Test-Path $SQL_SCRIPT)) {
    Write-Host "❌ Erreur: Le fichier $SQL_SCRIPT n'existe pas!" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Script SQL trouvé: $SQL_SCRIPT" -ForegroundColor Green

# Construire la commande psql
$PSQL_CMD = "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f `"$SQL_SCRIPT`""

Write-Host "🚀 Exécution de la commande PostgreSQL..." -ForegroundColor Cyan
Write-Host "Commande: $PSQL_CMD" -ForegroundColor Gray

try {
    # Définir la variable d'environnement pour le mot de passe
    $env:PGPASSWORD = $DB_PASSWORD
    
    # Exécuter la commande psql
    $result = Invoke-Expression $PSQL_CMD 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Table des sanctions créée avec succès!" -ForegroundColor Green
        Write-Host "📊 Résultats de l'exécution:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors de la création de la table:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Exception lors de l'exécution:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    # Nettoyer la variable d'environnement
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`n🎯 Vérification de la table créée..." -ForegroundColor Yellow

# Vérifier que la table existe maintenant
try {
    $env:PGPASSWORD = $DB_PASSWORD
    $check_result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sanctions_table');"
    
    if ($check_result -match "t") {
        Write-Host "Table 'sanctions_table' existe maintenant!" -ForegroundColor Green
    } else {
        Write-Host "Table 'sanctions_table' n'existe toujours pas!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`n🏁 Script terminé!" -ForegroundColor Green
