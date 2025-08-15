@echo off
REM Quick Git Update Script for Windows

echo 🔍 Checking current status...
git status

echo.
echo 📝 Adding all changes...
git add .

echo.
set /p commit_message="💬 Enter commit message (or press Enter for default): "

if "%commit_message%"=="" (
    for /f "tokens=1-4 delims=/ " %%i in ("%date%") do (
        for /f "tokens=1-2 delims=: " %%a in ("%time%") do (
            set commit_message=Quick update - %%k-%%j-%%i %%a:%%b
        )
    )
)

echo.
echo 📦 Creating commit with message: %commit_message%
git commit -m "%commit_message%"

echo.
echo 🚀 Pushing to GitHub...
git push

echo.
echo ✅ Update completed successfully!
echo 🌐 Check your repository at: https://github.com/Legend1FR/fdfd
pause
