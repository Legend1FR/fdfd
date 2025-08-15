# إنشاء حزمة Render
echo "🚀 إنشاء حزمة الملفات المطلوبة لـ Render..."

# إنشاء مجلد مؤقت
$renderDir = "render_package"
if (Test-Path $renderDir) {
    Remove-Item $renderDir -Recurse -Force
}
New-Item -ItemType Directory -Path $renderDir

# نسخ الملفات المطلوبة
$requiredFiles = @(
    "server.js",
    "package.json", 
    "rugcheck_content_extractor.js",
    "simple_rugcheck_api.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $renderDir
        Write-Host "✅ تم نسخ: $file"
    } else {
        Write-Host "❌ ملف مفقود: $file"
    }
}

# إنشاء ملف README للتوضيح
@"
# Token Tracker with Rugcheck Integration

## Required Environment Variables:
- PORT (automatically set by Render)
- NODE_ENV=production

## Files included:
- server.js (main application)
- package.json (dependencies)
- rugcheck_content_extractor.js (rugcheck content extractor)
- simple_rugcheck_api.js (rugcheck API client)

## How rugcheck works:
- Extracts scores in format: X / 100
- Classification:
  - 0-9 points: Very Safe ✅
  - 10-20 points: Safe ✅  
  - 21-34 points: Warning ⚠️
  - 35+ points: Danger 🔴

## Auto-deletion:
- Tokens with DANGER or WARNING status are automatically deleted
- Cleanup runs every minute
"@ | Out-File -FilePath "$renderDir\README.md" -Encoding UTF8

Write-Host "✅ تم إنشاء حزمة Render في المجلد: $renderDir"
Write-Host "📁 يمكنك الآن رفع محتويات هذا المجلد إلى Render"
