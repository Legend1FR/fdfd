# نظام فحص rugcheck المحدث

## نظرة عامة
تم تحديث نظام فحص rugcheck ليستخدم `rugcheck_content_extractor.js` للحصول على تقييم دقيق للتوكنات بناءً على النقاط من 100.

## معايير التصنيف الجديدة

### 🔢 النقاط والتصنيف
النظام يعتمد على النقاط المستخرجة بصيغة `X / 100` فقط:

- **0-9 نقطة**: آمن جداً ✅ (SAFE)
- **10-20 نقطة**: آمن ✅ (SAFE)  
- **21-34 نقطة**: تحذيري ⚠️ (WARNING)
- **35+ نقطة**: خطر 🔴 (DANGER)

### 🎯 مميزات النظام الجديد

1. **دقة عالية**: يستخرج النقاط الفعلية من rugcheck بدلاً من الاعتماد على الكلمات
2. **سرعة فائقة**: استخدام API مباشر بدلاً من HTML scraping
3. **موثوقية**: يحفظ المحتوى المستخرج للمراجعة والتشخيص
4. **شفافية**: يعرض النقاط الفعلية مع التصنيف

## كيفية العمل

### 1. استخراج المحتوى
```javascript
const RugcheckContentExtractor = require('./rugcheck_content_extractor');
const extractor = new RugcheckContentExtractor();
const formattedContent = await extractor.extractFormattedContent(token);
```

### 2. استخراج النقاط
```javascript
const scoreMatch = formattedContent.match(/(\d+)\s*\/\s*100/);
const score = parseInt(scoreMatch[1]);
```

### 3. التصنيف
```javascript
let status;
if (score >= 10 && score <= 20) {
    status = 'SAFE';
} else if (score > 20 && score < 35) {
    status = 'WARNING';
} else if (score >= 35) {
    status = 'DANGER';
} else {
    // أقل من 10 نقاط - آمن جداً
    status = 'SAFE';
}
```

## الملفات المحدثة

### `server.js`
- `checkTokenSafety()`: محدثة لاستخدام النظام الجديد
- `checkRugcheckSimple()`: محدثة لاستخدام النظام الجديد

### ملفات الاعتماد
- `rugcheck_content_extractor.js`: أداة استخراج المحتوى
- `simple_rugcheck_api.js`: API للاتصال بـ rugcheck

## مثال عملي

```javascript
// فحص توكن
const result = await checkTokenSafety('9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi');

// النتيجة:
// [TOKEN] 📊 النقاط المستخرجة: 60/100
// [TOKEN] 🔴 التوكن خطر - النقاط: 60/100
// result = 'DANGER'
```

## المعالجة التلقائية

### حذف تلقائي
- التوكنات التي تحصل على تصنيف `DANGER` أو `WARNING` يتم حذفها تلقائياً
- يعمل التنظيف كل دقيقة للتأكد من عدم وجود توكنات خطيرة

### المتابعة
- يتم حفظ النقاط والتصنيف في ملف `tracked_tokens.json`
- يمكن مراجعة التقارير المحفوظة في ملفات `rugcheck_content_*.txt`

## فوائد التحديث

1. **دقة أعلى**: اعتماد على النقاط الرقمية بدلاً من النصوص
2. **سرعة أكبر**: API مباشر بدلاً من HTML parsing
3. **شفافية أكثر**: عرض النقاط الفعلية مع التفسير
4. **موثوقية عالية**: حفظ المحتوى للمراجعة والتشخيص
5. **معايير واضحة**: حدود رقمية محددة للتصنيف

## الاختبار

لاختبار النظام الجديد:
```bash
node test_rugcheck_integration.js
```

سيقوم بفحص توكن تجريبي وإظهار:
- النقاط المستخرجة
- التصنيف المحدد
- معايير التصنيف
- المحتوى المستخرج (في حالة الخطأ)
