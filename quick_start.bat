@echo off
setlocal

title Token Tracker - Quick Start

echo ========================================
echo     🚀 Token Tracker Quick Start 🚀
echo ========================================
echo.
echo اختر طريقة التشغيل:
echo.
echo 1. التشغيل العادي (محسن مع نظام الاستمرارية)
echo 2. التشغيل مع المراقبة المتقدمة
echo 3. ضمان الاستمرارية - مراقبة بسيطة
echo 4. ضمان الاستمرارية - مراقبة متقدمة (PowerShell)
echo 5. عرض حالة النظام
echo 6. خروج
echo.

set /p choice="اختر رقم (1-6): "

if "%choice%"=="1" goto normal_start
if "%choice%"=="2" goto monitor_start
if "%choice%"=="3" goto simple_continuity
if "%choice%"=="4" goto advanced_continuity
if "%choice%"=="5" goto show_status
if "%choice%"=="6" goto exit
goto invalid

:normal_start
echo.
echo 🚀 بدء التشغيل العادي المحسن...
echo 💾 النسخ الاحتياطي التلقائي: مفعل
echo 💓 نظام Heartbeat: مفعل
echo ⚡ إعادة التشغيل التلقائي: مفعل عند الحاجة
echo.
node server.js
pause
goto menu

:monitor_start
echo.
echo 🔍 بدء التشغيل مع المراقبة المتقدمة...
echo 🛡️ مراقبة مستمرة: مفعل
echo 🔄 إعادة التشغيل التلقائي: مفعل
echo 📊 السجلات المفصلة: مفعل
echo.
node start_with_monitor.js
pause
goto menu

:simple_continuity
echo.
echo 🛡️ بدء ضمان الاستمرارية البسيط...
echo ⏰ فحص كل 30 ثانية
echo 🔄 إعادة تشغيل تلقائي
echo 📝 سجلات في continuity.log
echo.
call ensure_continuity.bat
pause
goto menu

:advanced_continuity
echo.
echo 🚀 بدء ضمان الاستمرارية المتقدم...
echo 📊 إحصائيات في الوقت الفعلي
echo 💓 مراقبة Heartbeat ذكية
echo ⚙️ إعدادات متقدمة
echo.
powershell -ExecutionPolicy Bypass -File "ensure_continuity_advanced.ps1"
pause
goto menu

:show_status
echo.
echo 📊 حالة النظام:
echo ================
echo.

:: فحص العمليات النشطة
echo 🔍 العمليات النشطة:
tasklist /fi "imagename eq node.exe" | find /i "node.exe" >nul
if errorlevel 1 (
    echo ❌ لا توجد عمليات Node.js تعمل
) else (
    echo ✅ عمليات Node.js تعمل:
    tasklist /fi "imagename eq node.exe"
)
echo.

:: فحص ملف heartbeat
echo 💓 حالة Heartbeat:
if exist "heartbeat.json" (
    echo ✅ ملف heartbeat موجود
    for %%f in (heartbeat.json) do echo    📅 آخر تحديث: %%~tf
) else (
    echo ❌ ملف heartbeat غير موجود
)
echo.

:: فحص ملفات البيانات
echo 💾 ملفات البيانات:
if exist "tracked_tokens.json" (
    echo ✅ ملف التوكنات الرئيسي موجود
    for %%f in (tracked_tokens.json) do echo    📅 آخر تحديث: %%~tf
) else (
    echo ❌ ملف التوكنات الرئيسي غير موجود
)

if exist "backups" (
    echo ✅ مجلد النسخ الاحتياطية موجود
    dir /b backups\*.json 2>nul | find /c ".json" > temp_count.txt
    set /p backup_count=<temp_count.txt
    del temp_count.txt
    echo    📊 عدد النسخ الاحتياطية: %backup_count%
) else (
    echo ❌ مجلد النسخ الاحتياطية غير موجود
)
echo.

:: فحص ملفات السجل
echo 📋 ملفات السجل:
if exist "continuity.log" (
    echo ✅ سجل الاستمرارية موجود
) else (
    echo ⚠️ سجل الاستمرارية غير موجود
)

if exist "app_monitor.log" (
    echo ✅ سجل مراقب التطبيق موجود
) else (
    echo ⚠️ سجل مراقب التطبيق غير موجود
)
echo.

pause
goto menu

:invalid
echo.
echo ❌ خيار غير صحيح. حاول مرة أخرى.
echo.
pause
goto menu

:exit
echo.
echo 👋 وداعاً!
exit /b 0

:menu
cls
goto start
