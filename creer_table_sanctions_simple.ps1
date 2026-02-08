# Script PowerShell simplifié pour créer la table des sanctions

Write-Host "Creation de la table des sanctions..." -ForegroundColor Yellow

# Parametres de connexion
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "rh_portal"
$DB_USER = "postgres"
$DB_PASSWORD = "Cdl202407"

# Definir le mot de passe
$env:PGPASSWORD = $DB_PASSWORD

Write-Host "Connexion a la base de donnees..." -ForegroundColor Cyan

# Commande SQL pour creer la table
$CREATE_TABLE_SQL = @"
CREATE TABLE IF NOT EXISTS sanctions_table (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    sanction_type VARCHAR(100) NOT NULL,
    description TEXT,
    sanction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"@

try {
    # Executer la commande SQL
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $CREATE_TABLE_SQL 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Table des sanctions creee avec succes!" -ForegroundColor Green
    } else {
        Write-Host "Erreur lors de la creation de la table:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "Exception lors de l'execution:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Verifier que la table existe
Write-Host "Verification de la table..." -ForegroundColor Yellow

try {
    $check_result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sanctions_table');"
    
    if ($check_result -match "t") {
        Write-Host "Table 'sanctions_table' existe maintenant!" -ForegroundColor Green
    } else {
        Write-Host "Table 'sanctions_table' n'existe toujours pas!" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur lors de la verification:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Nettoyer
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "Script termine!" -ForegroundColor Green








