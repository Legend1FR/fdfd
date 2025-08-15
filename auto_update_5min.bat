@echo off
chcp 65001 > nul
color 0A
title Auto Git Update - Every 5 Minutes

echo ==========================================
echo     تحديث Git التلقائي كل 5 دقائق
echo ==========================================
echo.

set "UPDATE_COUNT=0"
set "SUCCESS_COUNT=0"
set "INTERVAL_SECONDS=300"

:MAIN_LOOP
set /a UPDATE_COUNT+=1

echo [%date% %time%] === التحقق رقم %UPDATE_COUNT% ===

REM التحقق من وجود تغييرات
git status --porcelain > temp_status.txt 2>nul
set "HAS_CHANGES="
for /f %%i in (temp_status.txt) do set "HAS_CHANGES=1"
del temp_status.txt 2>nul

if defined HAS_CHANGES (
    echo [%date% %time%] وجدت تغييرات - بدء التحديث...
    
    REM إضافة التغييرات
    git add . >nul 2>&1
    
    REM إنشاء commit
    for /f "tokens=1-3 delims=/ " %%i in ("%date%") do (
        for /f "tokens=1-2 delims=: " %%a in ("%time%") do (
            set "COMMIT_MSG=Auto update - %%k-%%j-%%i %%a:%%b"
        )
    )
    
    git commit -m "%COMMIT_MSG%" >nul 2>&1
    
    if %errorlevel% equ 0 (
        echo [%date% %time%] تم إنشاء commit بنجاح
        
        REM رفع للـ GitHub
        git push >nul 2>&1
        
        if %errorlevel% equ 0 (
            set /a SUCCESS_COUNT+=1
            echo [%date% %time%] ✅ تم التحديث بنجاح على GitHub
            echo [%date% %time%] SUCCESS: Repository updated >> auto_update_log.txt
        ) else (
            echo [%date% %time%] ❌ فشل في الرفع إلى GitHub
            echo [%date% %time%] ERROR: Push failed >> auto_update_log.txt
        )
    ) else (
        echo [%date% %time%] ❌ فشل في إنشاء commit
        echo [%date% %time%] ERROR: Commit failed >> auto_update_log.txt
    )
) else (
    echo [%date% %time%] لا توجد تغييرات جديدة
    echo [%date% %time%] INFO: No changes found >> auto_update_log.txt
)

echo [%date% %time%] إحصائيات: %SUCCESS_COUNT% تحديث ناجح من أصل %UPDATE_COUNT% محاولة
echo [%date% %time%] التحقق التالي خلال 5 دقائق...
echo ----------------------------------------

REM انتظار 5 دقائق (300 ثانية)
timeout /t %INTERVAL_SECONDS% /nobreak >nul

goto MAIN_LOOP
