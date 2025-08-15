@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: إعدادات المراقبة
set SERVER_URL=https://fdfd.onrender.com
set PING_INTERVAL=480
set /a PING_MINUTES=%PING_INTERVAL% / 60

echo 🚀 بدء مراقبة السيرفر: %SERVER_URL%
echo ⏰ فترة المراقبة: كل %PING_MINUTES% دقيقة
echo 📅 بدء المراقبة: %date% %time%
echo.

set ping_count=0
set success_count=0

:ping_loop
set /a ping_count+=1
echo 🔍 Ping #!ping_count! - %date% %time%

:: محاولة ping للسيرفر
curl -s -o nul -w "%%{http_code}" "%SERVER_URL%/health" --max-time 30 > temp_response.txt
set /p response=<temp_response.txt
del temp_response.txt

if "!response!"=="200" (
    set /a success_count+=1
    echo ✅ Ping نجح - Status: !response!
    
    :: جلب معلومات السيرفر
    curl -s "%SERVER_URL%/health" --max-time 10 > health_info.txt
    findstr "uptime" health_info.txt >nul
    if !errorlevel!==0 (
        echo 🕒 Server is running
    )
    del health_info.txt
) else (
    echo ❌ Ping فشل - Status: !response!
    
    :: محاولة ping endpoint بديل
    curl -s -o nul -w "%%{http_code}" "%SERVER_URL%/ping" --max-time 15 > temp_ping.txt
    set /p ping_response=<temp_ping.txt
    del temp_ping.txt
    
    if "!ping_response!"=="200" (
        set /a success_count+=1
        echo ✅ البديل نجح - Status: !ping_response!
    ) else (
        echo ❌ جميع المحاولات فشلت
    )
)

:: حساب معدل النجاح
if !ping_count! gtr 0 (
    set /a success_rate=!success_count! * 100 / !ping_count!
    echo 📊 معدل النجاح: !success_rate!%% ^(!success_count!/!ping_count!^)
)
echo.

:: انتظار قبل المحاولة التالية
echo ⏰ المحاولة التالية خلال %PING_MINUTES% دقيقة...
timeout /t %PING_INTERVAL% /nobreak >nul

goto ping_loop
