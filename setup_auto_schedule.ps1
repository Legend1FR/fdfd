# Create Scheduled Task for Auto Git Updates
# تشغيل تلقائي كل ساعة

$TaskName = "GitAutoUpdate"
$TaskPath = "\"
$ScriptPath = "C:\Users\loqfs\Downloads\YY\auto_update_silent.bat"

# إنشاء الـ batch file للتشغيل الصامت
$SilentScript = @"
@echo off
cd /d "C:\Users\loqfs\Downloads\YY"

REM Check for changes
git status --porcelain > temp_status.txt
set /p changes= < temp_status.txt
del temp_status.txt

if not "%changes%"=="" (
    git add .
    git commit -m "Auto update - %date% %time%"
    git push
    echo %date% %time% - Auto update completed >> auto_update_log.txt
) else (
    echo %date% %time% - No changes found >> auto_update_log.txt
)
"@

# Save silent script
$SilentScript | Out-File -FilePath "C:\Users\loqfs\Downloads\YY\auto_update_silent.bat" -Encoding ASCII

Write-Host "📝 Creating scheduled task..." -ForegroundColor Blue

# Create the scheduled task
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`""
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

try {
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Auto update Git repository every hour"
    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
    Write-Host "🔄 Git repository will auto-update every hour" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to create scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try running PowerShell as Administrator" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 To manage the task:"
Write-Host "   • View: Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "   • Remove: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
Write-Host "   • Run now: Start-ScheduledTask -TaskName '$TaskName'"
