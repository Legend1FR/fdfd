# ==============================================
# نظام ضمان الاستمرارية المتقدم - PowerShell
# Advanced Continuity Assurance System
# ==============================================

param(
    [string]$ScriptPath = "server.js",
    [int]$MaxRestarts = 10,
    [int]$RestartDelay = 5,
    [int]$CheckInterval = 30,
    [int]$HeartbeatTimeout = 120,
    [string]$LogFile = "continuity.log"
)

# تكوين النوافذ والألوان
$Host.UI.RawUI.WindowTitle = "Token Tracker - Advanced Continuity System"

# متغيرات النظام
$script:RestartCount = 0
$script:LastRestartTime = Get-Date
$script:StartTime = Get-Date
$script:IsRunning = $true

# دالة كتابة السجل
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # طباعة على الشاشة
    switch ($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "INFO" { Write-Host $logEntry -ForegroundColor Cyan }
        default { Write-Host $logEntry }
    }
    
    # كتابة في ملف السجل
    try {
        Add-Content -Path $LogFile -Value $logEntry -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Failed to write to log file: $_" -ForegroundColor Red
    }
}

# دالة فحص عملية Node.js
function Test-NodeProcess {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if (-not $nodeProcesses) {
        return $false
    }
    
    # فحص ما إذا كان السكريپت الصحيح يعمل
    foreach ($process in $nodeProcesses) {
        try {
            $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($process.Id)").CommandLine
            if ($commandLine -and $commandLine -like "*$ScriptPath*") {
                return $process
            }
        } catch {
            continue
        }
    }
    
    return $false
}

# دالة فحص heartbeat
function Test-Heartbeat {
    $heartbeatFile = "heartbeat.json"
    
    if (-not (Test-Path $heartbeatFile)) {
        Write-Log "Heartbeat file not found" "WARNING"
        return $false
    }
    
    try {
        $heartbeatData = Get-Content $heartbeatFile | ConvertFrom-Json
        $lastHeartbeat = [DateTime]$heartbeatData.timestamp
        $timeDiff = (Get-Date) - $lastHeartbeat
        
        if ($timeDiff.TotalSeconds -gt $HeartbeatTimeout) {
            Write-Log "Heartbeat timeout ($($timeDiff.TotalSeconds) seconds)" "WARNING"
            return $false
        }
        
        Write-Log "💓 Heartbeat OK - $($heartbeatData.activeTokens)/$($heartbeatData.totalTokens) tokens active" "INFO"
        return $true
    } catch {
        Write-Log "Error reading heartbeat: $_" "ERROR"
        return $false
    }
}

# دالة بدء التطبيق
function Start-Application {
    $script:RestartCount++
    Write-Log "🚀 Starting application (attempt $script:RestartCount/$MaxRestarts)" "INFO"
    
    if ($script:RestartCount -gt $MaxRestarts) {
        Write-Log "❌ Maximum restart attempts reached. Stopping." "ERROR"
        $script:IsRunning = $false
        return $false
    }
    
    try {
        # بدء العملية
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "node"
        $processInfo.Arguments = $ScriptPath
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.WorkingDirectory = Get-Location
        
        $process = [System.Diagnostics.Process]::Start($processInfo)
        
        # انتظار قصير للتأكد من بدء العملية
        Start-Sleep -Seconds 3
        
        if ($process.HasExited) {
            Write-Log "❌ Application exited immediately" "ERROR"
            return $false
        }
        
        Write-Log "✅ Application started successfully (PID: $($process.Id))" "SUCCESS"
        $script:LastRestartTime = Get-Date
        
        # إعادة تعيين عداد إعادة التشغيل عند النجاح
        Start-Sleep -Seconds 10
        if (-not $process.HasExited) {
            $script:RestartCount = 0
        }
        
        return $true
    } catch {
        Write-Log "❌ Failed to start application: $_" "ERROR"
        return $false
    }
}

# دالة إيقاف العمليات المعلقة
function Stop-HangingProcesses {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    foreach ($process in $nodeProcesses) {
        try {
            $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($process.Id)").CommandLine
            if ($commandLine -and $commandLine -like "*$ScriptPath*") {
                Write-Log "🔪 Killing hanging process (PID: $($process.Id))" "WARNING"
                $process.Kill()
                Start-Sleep -Seconds 2
            }
        } catch {
            continue
        }
    }
}

# دالة عرض الإحصائيات
function Show-Stats {
    $uptime = (Get-Date) - $script:StartTime
    $nodeProcess = Test-NodeProcess
    
    Write-Host "`n" -NoNewline
    Write-Host "📊 System Statistics:" -ForegroundColor Cyan
    Write-Host "   🕐 Uptime: $($uptime.ToString('hh\:mm\:ss'))" -ForegroundColor White
    Write-Host "   🔄 Restart Count: $script:RestartCount" -ForegroundColor White
    Write-Host "   📱 Application Status: " -NoNewline -ForegroundColor White
    
    if ($nodeProcess) {
        Write-Host "RUNNING (PID: $($nodeProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "NOT RUNNING" -ForegroundColor Red
    }
    
    Write-Host "   💓 Last Heartbeat: " -NoNewline -ForegroundColor White
    if (Test-Path "heartbeat.json") {
        try {
            $heartbeatData = Get-Content "heartbeat.json" | ConvertFrom-Json
            $lastHeartbeat = [DateTime]$heartbeatData.timestamp
            $timeDiff = (Get-Date) - $lastHeartbeat
            
            if ($timeDiff.TotalSeconds -lt 60) {
                Write-Host "$($timeDiff.TotalSeconds.ToString('F0')) seconds ago" -ForegroundColor Green
            } else {
                Write-Host "$($timeDiff.TotalMinutes.ToString('F1')) minutes ago" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "ERROR" -ForegroundColor Red
        }
    } else {
        Write-Host "NOT FOUND" -ForegroundColor Red
    }
    Write-Host ""
}

# معالج إشارة الإنهاء
Register-EngineEvent PowerShell.Exiting -Action {
    Write-Log "🛑 Continuity system is shutting down" "INFO"
}

# بدء النظام
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🚀 Advanced Continuity System 🚀   " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Log "🚀 Starting Advanced Continuity System" "INFO"
Write-Log "📍 Script: $ScriptPath" "INFO"
Write-Log "📝 Log File: $LogFile" "INFO"
Write-Log "🔄 Max Restarts: $MaxRestarts" "INFO"
Write-Log "⏰ Check Interval: $CheckInterval seconds" "INFO"
Write-Log "💓 Heartbeat Timeout: $HeartbeatTimeout seconds" "INFO"

# الحلقة الرئيسية
$lastStatsTime = Get-Date
while ($script:IsRunning) {
    try {
        # فحص حالة التطبيق
        $nodeProcess = Test-NodeProcess
        
        if (-not $nodeProcess) {
            Write-Log "⚠️ Application is not running. Starting..." "WARNING"
            Stop-HangingProcesses
            Start-Sleep -Seconds $RestartDelay
            Start-Application
        } else {
            # فحص heartbeat
            $heartbeatOk = Test-Heartbeat
            
            if (-not $heartbeatOk) {
                Write-Log "⚠️ Application may be frozen. Restarting..." "WARNING"
                Stop-HangingProcesses
                Start-Sleep -Seconds $RestartDelay
                Start-Application
            }
        }
        
        # عرض الإحصائيات كل دقيقة
        if ((Get-Date) - $lastStatsTime -gt [TimeSpan]::FromMinutes(1)) {
            Show-Stats
            $lastStatsTime = Get-Date
        }
        
        # انتظار قبل الفحص التالي
        Start-Sleep -Seconds $CheckInterval
        
    } catch {
        Write-Log "❌ Error in main loop: $_" "ERROR"
        Start-Sleep -Seconds 10
    }
}

Write-Log "🛑 Advanced Continuity System stopped" "INFO"
Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
