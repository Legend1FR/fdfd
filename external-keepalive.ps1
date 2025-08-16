# External Keep Alive Script for Render (PowerShell)
# يرسل طلبات ping خارجية للحفاظ على الخدمة نشطة

param(
    [string]$RenderUrl = $env:RENDER_EXTERNAL_URL,
    [int]$PingInterval = 480  # 8 دقائق بالثواني
)

# إعدادات افتراضية
if (-not $RenderUrl) {
    $RenderUrl = "https://fdfd-i8p9.onrender.com"
}

$LogFile = "external_keepalive.log"

Write-Host "🔄 External Keep Alive Script Started" -ForegroundColor Green
Write-Host "📍 Target URL: $RenderUrl" -ForegroundColor Cyan
Write-Host "⏰ Ping interval: $PingInterval seconds" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Yellow

# تسجيل بدء التشغيل
Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - External Keep Alive Script Started"
Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Target URL: $RenderUrl"

# دالة إرسال ping
function Send-Ping {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] 🏓 Sending external ping..."
    
    Write-Host $logMessage -ForegroundColor Blue
    Add-Content -Path $LogFile -Value $logMessage
    
    try {
        $response = Invoke-WebRequest -Uri "$RenderUrl/health" -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $successMessage = "[$timestamp] ✅ External ping successful (Status: $($response.StatusCode))"
            Write-Host $successMessage -ForegroundColor Green
            Add-Content -Path $LogFile -Value $successMessage
        } else {
            $warningMessage = "[$timestamp] ⚠️ External ping completed with status: $($response.StatusCode)"
            Write-Host $warningMessage -ForegroundColor Yellow
            Add-Content -Path $LogFile -Value $warningMessage
        }
    }
    catch {
        $errorMessage = "[$timestamp] ❌ External ping failed: $($_.Exception.Message)"
        Write-Host $errorMessage -ForegroundColor Red
        Add-Content -Path $LogFile -Value $errorMessage
    }
}

# معالج للتوقف النظيف
$cleanup = {
    Write-Host "🛑 External Keep Alive Script stopping..." -ForegroundColor Yellow
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - External Keep Alive Script stopped"
    exit 0
}

# تسجيل معالج الإشارات
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup

# ping فوري عند البدء
Send-Ping

# حلقة ping دورية
try {
    while ($true) {
        Start-Sleep -Seconds $PingInterval
        Send-Ping
    }
}
catch {
    Write-Host "❌ Script interrupted: $($_.Exception.Message)" -ForegroundColor Red
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Script interrupted: $($_.Exception.Message)"
}
finally {
    & $cleanup
}
