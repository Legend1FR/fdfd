# Telegram Bot للتداول التلقائي

## النشر على Render

### المتطلبات:
1. حساب GitHub
2. حساب Render
3. رفع الكود إلى GitHub

### خطوات النشر:

1. **رفع الكود إلى GitHub:**
   ```bash
   git add .
   git commit -m "Update for Render deployment"
   git push origin master
   ```

2. **إنشاء خدمة جديدة على Render:**
   - اذهب إلى [Render Dashboard](https://dashboard.render.com/)
   - اضغط على "New +" → "Web Service"
   - اربط GitHub repository
   - اختر البرنامج: `Docker`
   - اختر Plan: `Starter` (مجاني)

3. **إعدادات البيئة:**
   ```
   NODE_ENV=production
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
   ```

4. **إعدادات الخدمة:**
   - Build Command: `npm ci --only=production`
   - Start Command: `node server.js`
   - Port: `10000`

### الوصول للخدمة:
- الموقع الرئيسي: `https://your-app-name.onrender.com/`
- متابعة التوكنات: `https://your-app-name.onrender.com/track_token`
- Health Check: `https://your-app-name.onrender.com/health`

### ملاحظات مهمة:

1. **الخطة المجانية:**
   - تتوقف بعد عدم النشاط لمدة 15 دقيقة
   - تستغرق وقتاً للاستيقاظ (cold start)
   - محدودة بـ 750 ساعة شهرياً

2. **keep-alive:**
   البوت يحتوي على نظام keep-alive تلقائي لمنع النوم

3. **مراقبة الأداء:**
   يمكنك مراقبة logs من Render Dashboard

4. **التحديثات:**
   أي push جديد للـ master branch سيؤدي لإعادة deployment تلقائية

### استكشاف الأخطاء:

1. **مشكلة Chrome:**
   - تم حل مشكلة Chrome في Dockerfile
   - يتم تثبيت جميع التبعيات المطلوبة

2. **مشكلة الذاكرة:**
   - استخدم خطة مدفوعة للحصول على ذاكرة أكبر
   - قم بتحسين استخدام الذاكرة في الكود

3. **مشكلة الشبكة:**
   - تأكد من أن العناوين المستخدمة متاحة
   - تحقق من firewall settings
