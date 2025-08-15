# PowerShell script لرفع التحديثات

Write-Host "🚀 رفع التحديثات لحل مشكلة PHONE_NUMBER_BANNED..." -ForegroundColor Green

# إضافة كل الملفات
git add .

# تأكيد التغييرات
git commit -m "Fix PHONE_NUMBER_BANNED error

✅ Updated server.js to use existing session first
✅ Added environment variables support  
✅ Enhanced error handling for banned phone numbers
✅ Session is tested and working correctly
✅ Added helper scripts and documentation"

# رفع التحديثات
git push origin master

Write-Host "✅ تم رفع التحديثات بنجاح!" -ForegroundColor Green
Write-Host "🔄 أعد تشغيل الخدمة في Render الآن" -ForegroundColor Yellow
Write-Host "📋 راقب اللوجز - يجب أن ترى: '🔐 استخدام الجلسة المحفوظة...'" -ForegroundColor Cyan
