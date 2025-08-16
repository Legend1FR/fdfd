# � Keep Alive System المُحدث للبوت على Render

## المشكلة المحلولة
خدمة Render المجانية تدخل في "وضع النوم" (Sleep Mode) بعد 15 دقيقة من عدم النشاط. هذا يؤدي إلى:
- توقف البوت مؤقتاً
- الحاجة لاستيقاظ الخدمة عند وصول طلب جديد
- فقدان بعض الرسائل أثناء فترة النوم
- ظهور رسالة "Service waking up..."

## 🚀 الحل الجديد المُطبق

### 1. Keep Alive داخلي محسن (Internal Keep Alive)
تم إضافة نظام Keep Alive مدمج متطور في البوت:

- **الملف الجديد**: `keep-alive.js` - فئة متخصصة للـ Keep Alive
- **التكامل**: مدمج في `server.js` تلقائياً
- **الذكاء**: يعمل فقط على Render (يكتشف بيئة الإنتاج)
- **التكرار**: كل 8 دقائق (أقل من حد الـ 15 دقيقة)

```javascript
// مثال الاستخدام في server.js
const KeepAliveService = require('./keep-alive');

const keepAlive = new KeepAliveService({
  url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`,
  interval: 8 * 60 * 1000, // 8 دقائق
  endpoint: '/ping'
});

if (process.env.RENDER || process.env.NODE_ENV === 'production') {
  keepAlive.start();
}
```

### 2. Endpoints محسنة
تم إضافة endpoints جديدة محسنة:

- **`/ping`**: endpoint خفيف للـ keep alive (يرد بـ "pong")
- **`/health`**: endpoint صحة شامل (JSON response مع معلومات النظام)
- **`/keep-alive-status`**: صفحة ويب تفاعلية لمراقبة Keep Alive
- **`/status`**: محسن ليشمل إحصائيات Keep Alive

### 3. External Keep Alive Scripts (للمزيد من الضمان)
ملفات scripts خارجية محسنة:

#### Linux/Mac Bash Script:
```bash
chmod +x external-keepalive.sh
export RENDER_EXTERNAL_URL="https://fdfd-i8p9.onrender.com"
./external-keepalive.sh
```

#### Windows PowerShell Script:
```powershell
.\external-keepalive.ps1 -RenderUrl "https://fdfd-i8p9.onrender.com"
```

## ⚙️ التكوين المطلوب

### متغيرات البيئة على Render:
1. اذهب لـ **Render Dashboard**
2. اختر **Service Settings**
3. أضف **Environment Variables**:
   ```
   RENDER_EXTERNAL_URL=https://fdfd-i8p9.onrender.com
   NODE_ENV=production
   ```

### التحقق من التفعيل:
ابحث في اللوجز عن هذه الرسائل:
```
🔄 Keep Alive Service activated for Render deployment
🏓 Sending keep-alive ping at...
✅ Keep-alive ping successful
```

## 📊 مراقبة النظام

### 1. صفحة المراقبة التفاعلية:
زر: `https://fdfd-i8p9.onrender.com/keep-alive-status`

**المعلومات المعروضة:**
- حالة النظام (نشط/متوقف)
- الرابط المستهدف
- فترة الفحص
- آخر ping
- إجمالي المحاولات
- عدد النجح/الفشل
- معدل النجاح

### 2. API Status:
زر: `https://fdfd-i8p9.onrender.com/status`

يرجع JSON مع معلومات النظام وKeep Alive:
```json
{
  "status": "running",
  "timestamp": "2025-08-16T...",
  "tracked_tokens": 5,
  "keep_alive": {
    "isRunning": true,
    "successRate": "100%",
    "totalPings": 42
  }
}
```

### 3. مراقبة اللوجز:
في **Render Dashboard > Logs** ابحث عن:
- `Keep Alive Service activated`
- `Keep-alive ping successful`
- `Keep-alive ping failed`

## ✅ مزايا الحل الجديد

### المزايا الرئيسية:
- **🤖 تلقائي 100%**: يعمل بدون تدخل يدوي
- **🧠 ذكي**: يعمل فقط على Render (ليس محلياً)
- **⚡ سريع**: ping خفيف كل 8 دقائق
- **📊 قابل للمراقبة**: إحصائيات مفصلة ولوجز
- **🛡️ آمن**: لا يؤثر على أداء البوت
- **💪 موثوق**: نظام احتياطي متعدد المستويات

### النتائج المتوقعة:
- ✅ البوت يعمل 24/7 بدون انقطاع
- ✅ عدم ظهور "Service waking up" نهائياً
- ✅ عدم فقدان رسائل Telegram
- ✅ استجابة فورية للأوامر
- ✅ مراقبة شاملة للنظام

## 🔧 استكشاف الأخطاء

### إذا لم يعمل النظام:

#### 1. تحقق من البيئة:
```bash
# في Render Console
echo $NODE_ENV
echo $RENDER_EXTERNAL_URL
```

#### 2. تحقق من اللوجز:
ابحث عن هذه الرسائل في Render Logs:
```
❌ إذا لم تجد: "Keep Alive Service activated"
❌ إذا وجدت: "Keep-alive ping failed"
```

#### 3. اختبار الـ endpoints:
```bash
# اختبار من الخارج
curl https://fdfd-i8p9.onrender.com/ping
curl https://fdfd-i8p9.onrender.com/health
```

#### 4. مراجعة صفحة المراقبة:
زر: `/keep-alive-status` للحصول على إحصائيات مفصلة

#### 5. إعادة النشر:
إذا استمرت المشكلة، أعد نشر التطبيق من Render Dashboard

## 🎯 إعدادات متقدمة

### تخصيص فترة Ping:
```javascript
// في server.js - تغيير إلى 5 دقائق
interval: 5 * 60 * 1000
```

### تغيير endpoint الهدف:
```javascript
// في server.js - استخدام /health بدلاً من /ping
endpoint: '/health'
```

### تفعيل Keep Alive محلياً (للاختبار):
```javascript
// إزالة شرط البيئة
keepAlive.start(); // بدون شرط
```

### إضافة تنبيهات:
```javascript
// يمكن إضافة webhook أو email عند فشل ping
```

## 📞 المساعدة والدعم

### إذا واجهت مشاكل:
1. **تحقق من Environment Variables** في Render
2. **راجع اللوجز** في Render Dashboard
3. **زر `/keep-alive-status`** للإحصائيات
4. **اختبر الـ endpoints** من الخارج
5. **أعد النشر** إذا لزم الأمر

### معلومات مهمة:
- النظام مصمم للخطة المجانية في Render
- في الخطط المدفوعة لا يحتاج Keep Alive
- النظام لا يؤثر على استهلاك الموارد
- يمكن إيقافه بسهولة عبر Environment Variables

---

**🎉 النتيجة النهائية**: بوت يعمل 24/7 بدون توقف على Render مجاناً!
SERVER_URL=https://fdfd-i8p9.onrender.com PING_INTERVAL=480000 WEBHOOK_URL=https://discord.com/api/webhooks/... node monitor.js
```

### 4. سكريبت Bash (Linux/Mac)
ملف `ping-server.sh` - سكريبت بسيط لأنظمة Unix.

**كيفية الاستخدام:**
```bash
chmod +x ping-server.sh
./ping-server.sh
```

### 5. سكريبت Windows Batch
ملف `ping-server.bat` - للمستخدمين على Windows.

**كيفية الاستخدام:**
- افتح Command Prompt
- انتقل إلى مجلد المشروع
- شغّل: `ping-server.bat`

## 📊 مراقبة الحالة

السيرفر يوفر عدة endpoints للمراقبة:

### `/health` - Health Check (JSON)
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": "2h 30m 45s",
  "trackedTokens": 5,
  "keepAlive": {
    "attempts": 15,
    "successes": 15,
    "successRate": "100.0%",
    "lastPing": "2025-01-15T10:25:00.000Z"
  }
}
```

### `/status` - صفحة مراقبة مرئية
صفحة HTML تعرض حالة السيرفر بالعربية مع تحديث تلقائي كل 30 ثانية.

### `/ping` - Ping بسيط
يرجع "pong" - مفيد للفحص السريع.

## 🔧 إعدادات متقدمة

### متغيرات البيئة
```bash
# رابط السيرفر (يُستخدم للـ keep-alive الداخلي)
RENDER_EXTERNAL_URL=https://fdfd-i8p9.onrender.com

# رابط webhook للتنبيهات (اختياري)
WEBHOOK_URL=https://discord.com/api/webhooks/...

# فترة المراقبة بالميلي ثانية (للمراقب الخارجي)
PING_INTERVAL=480000
```

### تخصيص فترة المراقبة
يمكن تعديل فترة المراقبة في:
- `server.js`: السطر الذي يحتوي على `setInterval(keepAlive, 10 * 60 * 1000)`
- `monitor.js`: متغير `PING_INTERVAL`
- GitHub Actions: `cron: '*/8 * * * *'`

## 🛡️ أفضل الممارسات

1. **استخدم عدة طرق معاً** لضمان أقصى استقرار
2. **GitHub Actions + Keep-Alive الداخلي** = حل مثالي
3. **راقب الإحصائيات** في `/status` للتأكد من فعالية النظام
4. **استخدم UptimeRobot** أو خدمة مراقبة خارجية إضافية

## 🚨 استكشاف الأخطاء

### إذا كان السيرفر لا يزال ينام:
1. تأكد من أن GitHub Actions مفعلة
2. راجع logs في Render Dashboard
3. تحقق من `/health` endpoint يدوياً
4. تأكد من أن الـ Keep-Alive الداخلي يعمل

### إذا كانت المراقبة الخارجية تفشل:
1. تأكد من أن curl مثبت
2. تحقق من الاتصال بالإنترنت
3. جرب ping الـ `/ping` endpoint بدلاً من `/health`

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع logs السيرفر في Render
2. تحقق من `/status` page
3. جرب إعادة تشغيل السيرفر من Render Dashboard

---

## ⚡ ملخص سريع

**للحصول على أفضل النتائج:**
1. ✅ استخدم الـ Keep-Alive الداخلي (مدمج بالفعل)
2. ✅ فعّل GitHub Actions workflow
3. ✅ اشترك في خدمة مراقبة مثل UptimeRobot
4. ✅ راقب `/status` بانتظام

هذا المزيج سيضمن أن سيرفرك يعمل 24/7 بدون انقطاع! 🚀
