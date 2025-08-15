#!/bin/bash

echo "🚀 رفع التحديثات لحل مشكلة PHONE_NUMBER_BANNED..."

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

echo "✅ تم رفع التحديثات بنجاح!"
echo "🔄 أعد تشغيل الخدمة في Render الآن"
echo "📋 راقب اللوجز - يجب أن ترى: '🔐 استخدام الجلسة المحفوظة...'"
