@echo off
setlocal EnableDelayedExpansion

REM ==============================
REM Validate argument
REM ==============================
if "%~1"=="" (
    echo Usage:
    echo   add_trusted_site.bat https://example.com/
    exit /b 1
)

set INPUT_URL=%~1

REM ==============================
REM Remove protocol (http/https)
REM ==============================
set URL_NO_PROTO=%INPUT_URL:https://=%
set URL_NO_PROTO=%URL_NO_PROTO:http://=%

REM ==============================
REM Extract domain (before first /)
REM ==============================
for /f "tokens=1 delims=/" %%A in ("%URL_NO_PROTO%") do (
    set DOMAIN=%%A
)

REM ==============================
REM Add Trusted Site (Zone 2)
REM ==============================
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\!DOMAIN!" /f >nul

reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\!DOMAIN!" ^
 /v https /t REG_DWORD /d 2 /f >nul

echo.
echo Trusted Site added successfully:
echo https://!DOMAIN!
echo.

pause
