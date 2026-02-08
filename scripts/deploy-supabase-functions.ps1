# Script de déploiement des Edge Functions Supabase
# La clé sb_publishable_ n'est pas un JWT - --no-verify-jwt est requis pour éviter les 401

$functions = @(
    "absences",
    "conges",
    "recrutements",
    "visites-medicales",
    "departs",
    "sanctions",
    "notes",
    "interviews",
    "contrats",
    "tasks",
    "employees",
    "evenements",
    "departments",
    "performance",
    "requests"
)

foreach ($fn in $functions) {
    Write-Host "Deploying $fn..." -ForegroundColor Cyan
    npx supabase functions deploy $fn --no-verify-jwt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to deploy $fn" -ForegroundColor Red
    } else {
        Write-Host "Deployed $fn successfully" -ForegroundColor Green
    }
}

Write-Host "`nDone. auth-login peut require JWT - deploy sans --no-verify-jwt si besoin." -ForegroundColor Yellow
