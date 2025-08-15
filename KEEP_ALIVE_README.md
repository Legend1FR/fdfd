# 🔥 حل مشكلة نوم السيرفر في Render

هذا المشروع يحتوي على عدة حلول لمنع سيرفر Render من النوم والحفاظ على عمله 24/7.

## 🚀 الحلول المتاحة

### 1. Keep-Alive داخلي (مدمج في السيرفر)
السيرفر الآن يحتوي على نظام Keep-Alive مدمج يرسل ping لنفسه كل 10 دقائق.

**المميزات:**
- ✅ تلقائي تماماً
- ✅ لا يحتاج تدخل خارجي
- ✅ يعمل بمجرد تشغيل السيرفر
- ✅ يتضمن إحصائيات مفصلة

**كيف يعمل:**
- يرسل طلب GET إلى `/health` كل 10 دقائق
- يبدأ تلقائياً بعد 30 ثانية من تشغيل السيرفر
- يسجل جميع المحاولات والنتائج في الـ console

### 2. GitHub Actions (موصى به)
ملف `.github/workflows/keep-alive.yml` يحتوي على GitHub Action يرسل ping كل 8 دقائق.

**المميزات:**
- ✅ مجاني تماماً
- ✅ يعمل حتى لو تعطل السيرفر مؤقتاً
- ✅ لا يحتاج صيانة
- ✅ يمكن مراقبة النتائج في GitHub

**كيفية الاستخدام:**
1. ادفع الكود إلى GitHub
2. اذهب إلى Actions في repository
3. فعّل الـ workflow
4. سيعمل تلقائياً كل 8 دقائق

### 3. مراقب خارجي (Node.js)
ملف `monitor.js` - سكريبت Node.js متقدم للمراقبة.

**المميزات:**
- ✅ إحصائيات مفصلة
- ✅ تنبيهات Discord/Slack
- ✅ يمكن تشغيله من VPS أو جهاز محلي
- ✅ مراقبة مستمرة

**كيفية الاستخدام:**
```bash
# تشغيل بالإعدادات الافتراضية
node monitor.js

# تشغيل مع إعدادات مخصصة
SERVER_URL=https://fdfd.onrender.com PING_INTERVAL=480000 WEBHOOK_URL=https://discord.com/api/webhooks/... node monitor.js
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
RENDER_EXTERNAL_URL=https://fdfd.onrender.com

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
