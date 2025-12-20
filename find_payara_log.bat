@echo off
setlocal

set LOG_DIR=C:\payara6\glassfish\domains\production\logs

if "%~1"=="" (
    echo ERROR: Please provide search pattern
    echo Example:
    echo   find_payara_log.bat "some text"
    exit /b 1
)

set SEARCH_TEXT=%~1

echo Searching in %LOG_DIR%
echo Pattern: %SEARCH_TEXT%
echo.

for /r "%LOG_DIR%" %%F in (*) do (
    findstr /c:"%SEARCH_TEXT%" "%%F" >nul
    if not errorlevel 1 (
        echo Found in file: %%F
    )
)

echo.
echo Done.
pause
