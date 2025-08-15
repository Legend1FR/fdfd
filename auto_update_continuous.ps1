# Auto Git Update - Every 5 Minutes
# يعمل بشكل مستمر ويحدث كل 5 دقائق

param(
    [int]$IntervalMinutes = 5,
    [switch]$Silent = $false
)

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    if (-not $Silent) {
        Write-Host "[$timestamp] $Message" -ForegroundColor $Color
    }
    # كتابة في ملف السجل
    "[$timestamp] $Message" | Add-Content -Path "auto_update_log.txt"
}

function Check-And-Update {
    try {
        # التحقق من وجود تغييرات
        $status = git status --porcelain 2>$null
        
        if ($status) {
            Write-Log "وجدت تغييرات جديدة - بدء التحديث..." "Yellow"
            
            # إضافة التغييرات
            git add . 2>$null
            Write-Log "تم إضافة التغييرات" "Green"
            
            # إنشاء commit
            $commitMessage = "Auto update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $commitMessage 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Log "تم إنشاء commit: $commitMessage" "Green"
                
                # رفع للـ GitHub
                git push 2>$null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Log "✅ تم التحديث بنجاح على GitHub" "Green"
                    return $true
                } else {
                    Write-Log "❌ فشل في الرفع إلى GitHub" "Red"
                    return $false
                }
            } else {
                Write-Log "❌ فشل في إنشاء commit" "Red"
                return $false
            }
        } else {
            Write-Log "لا توجد تغييرات جديدة" "Gray"
            return $false
        }
    } catch {
        Write-Log "خطأ: $($_.Exception.Message)" "Red"
        return $false
    }
}

function Show-Header {
    if (-not $Silent) {
        Clear-Host
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "    تحديث Git التلقائي كل $IntervalMinutes دقائق    " -ForegroundColor Yellow
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "مجلد المشروع: $(Get-Location)" -ForegroundColor Blue
        Write-Host "الوقت الحالي: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Blue
        Write-Host "للتوقف: اضغط Ctrl+C" -ForegroundColor Red
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host ""
    }
}

# التحقق من وجود git repository
if (-not (Test-Path ".git")) {
    Write-Log "❌ هذا ليس مجلد Git repository" "Red"
    exit 1
}

# إعداد المتغيرات
$intervalSeconds = $IntervalMinutes * 60
$updateCount = 0
$successCount = 0

Show-Header
Write-Log "🚀 بدء التحديث التلقائي كل $IntervalMinutes دقائق..." "Green"

# الحلقة الرئيسية
while ($true) {
    try {
        $updateCount++
        Write-Log "--- التحقق رقم $updateCount ---" "Cyan"
        
        if (Check-And-Update) {
            $successCount++
        }
        
        Write-Log "إحصائيات: $successCount تحديث ناجح من أصل $updateCount محاولة" "Blue"
        Write-Log "التحقق التالي خلال $IntervalMinutes دقائق..." "Gray"
        Write-Log "----------------------------------------" "DarkGray"
        
        # انتظار للفترة المحددة
        Start-Sleep -Seconds $intervalSeconds
        
    } catch {
        Write-Log "خطأ في الحلقة الرئيسية: $($_.Exception.Message)" "Red"
        Start-Sleep -Seconds 30  # انتظار 30 ثانية قبل المحاولة مرة أخرى
    }
}
