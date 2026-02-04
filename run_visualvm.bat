@echo off

set VISUALVM_HOME=C:\Users\bb25004\items\app\visualvm_22
REM set JAVA_HOME=%JAVA_HOME%
set JAVA_HOME=C:\OpenJDK\graalvm-community-openjdk-21.0.2+13.1

REM ===== Run VisualVM =====
"%VISUALVM_HOME%\bin\visualvm.exe" --jdkhome "%JAVA_HOME%"

pause
