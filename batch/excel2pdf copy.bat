@echo off
REM ============================================
REM Excel → PDF Converter
REM ============================================

set LIBREOFFICE_PATH="C:\Program Files\LibreOffice 5\program\soffice.exe"
set INPUT_FILE="C:\Users\bb25004\items\dev\TALON\DMTT\soffice\Invoice_02_25_2026_10_02_31.xlsx"
set OUTPUT_DIR="C:\Users\bb25004\items\dev\TALON\DMTT\soffice\output"

%LIBREOFFICE_PATH% --headless --convert-to pdf %INPUT_FILE% --outdir %OUTPUT_DIR%

echo.
echo Done.
pause