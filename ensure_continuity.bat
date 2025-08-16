@echo off
setlocal enabledelayedexpansion

:: ==============================================
:: نظام ضمان الاستمرارية للتطبيق
:: Application Continuity Assurance System
:: ==============================================

title Token Tracker - Continuity System

:: متغيرات التكوين
set "APP_NAME=Token Tracker"
set "SCRIPT_PATH=server.js"
set "LOG_FILE=continuity.log"
set "MAX_RESTARTS=10"
set "RESTART_DELAY=5"
set "CHECK_INTERVAL=30"

:: تسجيل بدء النظام
echo [%date% %time%] Starting %APP_NAME% Continuity System >> %LOG_FILE%
echo.
echo ========================================
echo     🚀 %APP_NAME% Continuity System 🚀
echo ========================================
echo.
echo 📍 Script: %SCRIPT_PATH%
echo 📝 Log File: %LOG_FILE%
echo 🔄 Max Restarts: %MAX_RESTARTS%
echo ⏰ Check Interval: %CHECK_INTERVAL% seconds
echo.

:: عداد إعادة التشغيل
set /a restart_count=0

:main_loop
echo [%date% %time%] Checking application status...

:: فحص ما إذا كان Node.js يعمل مع السكريبت المحدد
tasklist /fi "imagename eq node.exe" | find /i "node.exe" >nul
if errorlevel 1 (
    echo [%date% %time%] Application is not running. Starting...
    goto start_app
) else (
    :: فحص ما إذا كان السكريپت الصحيح يعمل
    wmic process where "name='node.exe'" get commandline | find "%SCRIPT_PATH%" >nul
    if errorlevel 1 (
        echo [%date% %time%] Node.js running but not our script. Starting...
        goto start_app
    ) else (
        echo [%date% %time%] ✅ Application is running normally
    )
)

:: فحص heartbeat
if exist "heartbeat.json" (
    echo [%date% %time%] 💓 Heartbeat file exists
) else (
    echo [%date% %time%] ⚠️ Warning: Heartbeat file missing
)

:: انتظار قبل الفحص التالي
timeout /t %CHECK_INTERVAL% /nobreak >nul
goto main_loop

:start_app
set /a restart_count+=1
echo [%date% %time%] Starting application (attempt %restart_count%/%MAX_RESTARTS%)
echo [%date% %time%] Starting application (attempt %restart_count%/%MAX_RESTARTS%) >> %LOG_FILE%

:: فحص الحد الأقصى لإعادة التشغيل
if %restart_count% GEQ %MAX_RESTARTS% (
    echo [%date% %time%] ❌ Maximum restart attempts reached. Stopping.
    echo [%date% %time%] ❌ Maximum restart attempts reached. Stopping. >> %LOG_FILE%
    pause
    exit /b 1
)

:: بدء التطبيق
echo [%date% %time%] 🚀 Starting Node.js application...
start "Token Tracker App" /min node %SCRIPT_PATH%

:: انتظار قبل التحقق من النجاح
timeout /t 10 /nobreak >nul

:: التحقق من نجاح بدء التطبيق
tasklist /fi "imagename eq node.exe" | find /i "node.exe" >nul
if errorlevel 1 (
    echo [%date% %time%] ❌ Failed to start application
    echo [%date% %time%] ❌ Failed to start application >> %LOG_FILE%
    timeout /t %RESTART_DELAY% /nobreak >nul
    goto start_app
) else (
    echo [%date% %time%] ✅ Application started successfully
    echo [%date% %time%] ✅ Application started successfully >> %LOG_FILE%
    :: إعادة تعيين عداد إعادة التشغيل عند النجاح
    set /a restart_count=0
)

goto main_loop

:cleanup
echo [%date% %time%] Cleaning up...
echo [%date% %time%] Continuity System stopped >> %LOG_FILE%
exit /b 0
