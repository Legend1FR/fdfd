@echo off
chcp 65001 > nul
color 0A
title Git Auto Update Control Panel

:MENU
cls
echo ==========================================
echo        أداة التحكم في التحديث التلقائي
echo ==========================================
echo.
echo اختر الطريقة المطلوبة:
echo.
echo 1. تحديث مستمر كل 5 دقائق (PowerShell)
echo 2. تحديث مستمر كل 5 دقائق (Batch)
echo 3. إنشاء مهمة مجدولة كل 5 دقائق
echo 4. تحديث واحد فوري
echo 5. عرض سجل التحديثات
echo 6. إيقاف المهمة المجدولة
echo 7. خروج
echo.
echo ==========================================

set /p choice="اختر رقم (1-7): "

if "%choice%"=="1" goto CONTINUOUS_PS
if "%choice%"=="2" goto CONTINUOUS_BAT
if "%choice%"=="3" goto SCHEDULE
if "%choice%"=="4" goto SINGLE_UPDATE
if "%choice%"=="5" goto VIEW_LOG
if "%choice%"=="6" goto STOP_SCHEDULE
if "%choice%"=="7" goto EXIT

echo خيار غير صحيح!
pause
goto MENU

:CONTINUOUS_PS
echo.
echo 🚀 بدء التحديث المستمر بـ PowerShell...
echo للتوقف: اضغط Ctrl+C
echo.
pause
powershell -ExecutionPolicy Bypass -File "auto_update_continuous.ps1"
goto MENU

:CONTINUOUS_BAT
echo.
echo 🚀 بدء التحديث المستمر...
echo للتوقف: اضغط Ctrl+C
echo.
pause
call auto_update_5min.bat
goto MENU

:SCHEDULE
echo.
echo 📅 إنشاء مهمة مجدولة...
echo تحتاج صلاحيات Administrator
echo.
pause
powershell -ExecutionPolicy Bypass -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File setup_5min_schedule.ps1' -Verb RunAs"
pause
goto MENU

:SINGLE_UPDATE
echo.
echo 🔄 تحديث فوري...
git add .
git commit -m "Manual update - %date% %time%"
git push
echo.
if %errorlevel% equ 0 (
    echo ✅ تم التحديث بنجاح!
) else (
    echo ❌ فشل في التحديث
)
echo.
pause
goto MENU

:VIEW_LOG
echo.
echo 📊 سجل التحديثات:
echo ==========================================
if exist "auto_update_log.txt" (
    type "auto_update_log.txt"
) else (
    echo لا يوجد سجل حتى الآن
)
echo ==========================================
echo.
pause
goto MENU

:STOP_SCHEDULE
echo.
echo ⏹️ إيقاف المهمة المجدولة...
powershell -Command "try { Unregister-ScheduledTask -TaskName 'GitAutoUpdate5Min' -Confirm:$false; Write-Host 'تم إيقاف المهمة المجدولة' } catch { Write-Host 'لا توجد مهمة مجدولة' }"
echo.
pause
goto MENU

:EXIT
echo.
echo شكراً لاستخدام أداة التحديث التلقائي!
exit /b
