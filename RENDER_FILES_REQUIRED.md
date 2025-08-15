# ملفات Render المطلوبة لنظام rugcheck

## الملفات الأساسية المطلوبة:

### 1. الملفات الرئيسية
- `server.js` - الملف الرئيسي للخادم
- `package.json` - ملف التبعيات
- `render.yaml` - إعدادات Render (إذا كان موجوداً)

### 2. ملفات نظام rugcheck
- `rugcheck_content_extractor.js` - أداة استخراج المحتوى من rugcheck
- `simple_rugcheck_api.js` - API للاتصال بـ rugcheck

### 3. ملفات الاختبار (اختيارية للتطوير)
- `test_rugcheck_integration.js` - لاختبار النظام الجديد
- `check_tokens_status.js` - لفحص حالة التوكنات

### 4. ملفات البيانات (ستُنشأ تلقائياً)
- `tracked_tokens.json` - التوكنات المتتبعة
- `sent_tokens.txt` - التوكنات المرسلة
- `session.txt` - جلسة Telegram
- `execution_logs.txt` - سجلات التنفيذ

## إعدادات package.json المطلوبة:

```json
{
  "name": "token-tracker",
  "version": "1.0.0", 
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "telegram": "^2.26.22",
    "axios": "^1.10.0",
    "cheerio": "^1.1.0",
    "input": "^1.0.1"
  }
}
```

## متغيرات البيئة المطلوبة في Render:

- `PORT` - منفذ الخادم (يتم تعيينه تلقائياً من Render)
- `NODE_ENV` - production

## ملاحظات مهمة:

1. **الملفات المطلوبة فقط**: لا تحتاج لرفع جميع ملفات الاختبار والنسخ الاحتياطية
2. **البيانات الحساسة**: تأكد من تعديل أرقام الهاتف وكلمات المرور في server.js
3. **الإعدادات**: تأكد من إعدادات API ID و API Hash
4. **المنافذ**: Render يستخدم متغير PORT تلقائياً

## تحقق من الملفات:
```bash
# الملفات الأساسية المطلوبة:
ls -la server.js
ls -la package.json  
ls -la rugcheck_content_extractor.js
ls -la simple_rugcheck_api.js
```
