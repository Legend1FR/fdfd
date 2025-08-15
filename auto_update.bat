@echo off
color 0A
title Git Auto Update Tool

echo ========================================
echo      🚀 Git Auto Update Tool 🚀
echo ========================================
echo.

echo 🔍 Checking for changes...
git status

echo.
echo 📝 Adding all changes...
git add .

echo.
set /p commit_message="💬 Enter commit message (Enter for auto): "

if "%commit_message%"=="" (
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
    set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
    set commit_message=Auto update - %YYYY%-%MM%-%DD% %HH%:%Min%
)

echo.
echo 📦 Creating commit: %commit_message%
git commit -m "%commit_message%"

if %errorlevel% equ 0 (
    echo.
    echo 🚀 Pushing to GitHub...
    git push
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ ✅ SUCCESS! Repository updated ✅ ✅
        echo 🌐 View at: https://github.com/Legend1FR/fdfd
    ) else (
        echo ❌ Error pushing to GitHub
    )
) else (
    echo ⚠️  No changes to commit
)

echo.
echo 🔄 Press any key to run again, or close to exit...
pause > nul
goto :eof
