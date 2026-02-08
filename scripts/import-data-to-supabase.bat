@echo off
REM Import des donnees vers Supabase
REM Definir le mot de passe avant d'executer ce script

echo.
echo ========================================
echo  Import des donnees vers Supabase
echo ========================================
echo.

if "%DB_PASSWORD%"=="" (
    echo [ERREUR] Variable DB_PASSWORD non definie.
    echo.
    echo Definissez le mot de passe Supabase:
    echo   set DB_PASSWORD=votre_mot_de_passe
    echo.
    echo Puis relancez: import-data-to-supabase.bat
    echo.
    pause
    exit /b 1
)

REM Utiliser donnees uniquement si tables Supabase existent deja
if exist "rh_portail_DATA_ONLY.sql" (
    set SQLFILE=rh_portail_DATA_ONLY.sql
) else (
    set SQLFILE=rh_portail.sql
)

REM Configuration par defaut
if "%DB_HOST%"=="" set DB_HOST=db.dwpkqdiunxbgumepkveb.supabase.co
if "%DB_USER%"=="" set DB_USER=postgres
if "%DB_NAME%"=="" set DB_NAME=postgres
if "%DB_PORT%"=="" set DB_PORT=5432

cd /d "%~dp0.."

echo Fichier: rh_portail.sql
echo Host: %DB_HOST%
echo.

where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] psql introuvable. Installez PostgreSQL:
    echo   https://www.postgresql.org/download/windows/
    echo.
    echo Ou utilisez: node scripts/import-data-to-supabase.js
    pause
    exit /b 1
)

set PGPASSWORD=%DB_PASSWORD%
set PGSSLMODE=require
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f %SQLFILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Import termine avec succes!
) else (
    echo.
    echo [ERREUR] Echec de l'import.
)
set PGPASSWORD=

echo.
pause
