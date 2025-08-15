# إنشاء مهمة مجدولة للتحديث كل 5 دقائق
# تشغيل هذا الملف كـ Administrator

param(
    [int]$IntervalMinutes = 5
)

$TaskName = "GitAutoUpdate5Min"
$ScriptPath = Join-Path (Get-Location) "auto_update_silent.bat"
$LogPath = Join-Path (Get-Location) "scheduled_update_log.txt"

# إنشاء الـ batch file للتشغيل الصامت
$SilentScript = @"
@echo off
cd /d "$(Get-Location)"

REM التحقق من وجود تغييرات
git status --porcelain > temp_status.txt 2>nul
set /p changes= < temp_status.txt
del temp_status.txt 2>nul

if not "%changes%"=="" (
    git add . >nul 2>&1
    git commit -m "Auto update - %date% %time%" >nul 2>&1
    if %errorlevel% equ 0 (
        git push >nul 2>&1
        if %errorlevel% equ 0 (
            echo %date% %time% - SUCCESS: Repository updated >> "$LogPath"
        ) else (
            echo %date% %time% - ERROR: Push failed >> "$LogPath"
        )
    ) else (
        echo %date% %time% - ERROR: Commit failed >> "$LogPath"
    )
) else (
    echo %date% %time% - INFO: No changes found >> "$LogPath"
)
"@

# حفظ الـ silent script
$SilentScript | Out-File -FilePath $ScriptPath -Encoding ASCII

Write-Host "📝 إنشاء مهمة مجدولة للتحديث كل $IntervalMinutes دقائق..." -ForegroundColor Blue

try {
    # حذف المهمة إذا كانت موجودة
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    } catch {}

    # إنشاء إعدادات المهمة
    $Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`""
    
    # تشغيل كل 5 دقائق
    $Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) -RepetitionDuration (New-TimeSpan -Days 365)
    
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    # تسجيل المهمة
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Auto update Git repository every $IntervalMinutes minutes" | Out-Null
    
    Write-Host "✅ تم إنشاء المهمة المجدولة بنجاح!" -ForegroundColor Green
    Write-Host "🔄 سيتم تحديث Git repository كل $IntervalMinutes دقائق" -ForegroundColor Cyan
    Write-Host "📊 ملف السجل: $LogPath" -ForegroundColor Yellow
    
    # بدء المهمة فوراً
    Start-ScheduledTask -TaskName $TaskName
    Write-Host "🚀 تم بدء المهمة فوراً" -ForegroundColor Green
    
} catch {
    Write-Host "❌ فشل في إنشاء المهمة المجدولة: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 تأكد من تشغيل PowerShell كـ Administrator" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 إدارة المهمة:" -ForegroundColor White
Write-Host "   • عرض المهمة: Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "   • حذف المهمة: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false" -ForegroundColor Gray
Write-Host "   • تشغيل الآن: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "   • إيقاف المهمة: Stop-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
