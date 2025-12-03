@echo off
setlocal enabledelayedexpansion

:: ==========================
:: CONFIG
:: ==========================
set BASEDIR=%~dp0
set SERVER=localhost
set PORT=14330
set USERNAME=sa
set PASSWORD=sql@min123
set DATABASE=PPLI_TALON

:: Output directory
set OUTPUT=C:\Sqlserver-Backup\export\PPLI_IMS

for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set yyyy=%%d
    set mm=%%b
    set dd=%%c
)

for /f "tokens=1-3 delims=:." %%a in ("%time%") do (
    set hh=%%a
    set nn=%%b
    set ss=%%c
)


if "%hh:~0,1%"==" " set hh=0%hh:~1,1%

set TIMESTAMP=%yyyy%-%mm%-%dd%_%hh%-%nn%-%ss%

:: ==========================
:: FILENAME
:: ==========================
set BACKUPFILE=%OUTPUT%\%DATABASE%_%TIMESTAMP%.bak

echo -----------------------------------------
echo   Starting SQL Server Backup
echo   Database: %DATABASE%
echo   Output  : %BACKUPFILE%
echo -----------------------------------------


if not exist "%OUTPUT%" mkdir "%OUTPUT%"


sqlcmd -S %SERVER%,%PORT% -U %USERNAME% -P %PASSWORD% ^
 -Q "BACKUP DATABASE [%DATABASE%] TO DISK='%BACKUPFILE%' WITH INIT"

if %ERRORLEVEL%==0 (
    echo Backup completed successfully.
) else (
    echo Backup FAILED with error %ERRORLEVEL%.
)

pause
endlocal
