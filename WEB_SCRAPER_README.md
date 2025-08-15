# 🌐 أداة استخراج محتوى صفحات الويب

أداة متطورة لاستخراج وتحليل محتوى صفحات الويب، مع دعم خاص لمواقع rugcheck.xyz لفحص العملات الرقمية.

## ✨ المميزات

- 📥 استخراج شامل لمحتوى صفحات الويب
- 🛡️ دعم خاص لتحليل بيانات rugcheck.xyz
- 📊 إنتاج تقارير مفصلة بصيغ متعددة (JSON, HTML, TXT)
- 🔍 فحص متعدد للروابط مع تقارير شاملة
- ⚡ واجهة تفاعلية سهلة الاستخدام
- 🔗 استخراج الروابط والبيانات المنظمة
- ⚠️ كشف التحذيرات والمخاطر المتعلقة بالعملات الرقمية

## 🚀 التثبيت والإعداد

### متطلبات النظام
- Node.js (النسخة 12 أو أحدث)
- npm أو yarn

### تثبيت التبعيات
\`\`\`bash
npm install axios cheerio
\`\`\`

## 📖 كيفية الاستخدام

### 1. الاستخدام الأساسي - فحص رابط واحد

\`\`\`bash
node web_scraper.js
\`\`\`

يقوم هذا الأمر بفحص الرابط المحدد مسبقاً في الكود:
\`https://rugcheck.xyz/tokens/9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi\`

### 2. الوضع التفاعلي - إدخال رابط مخصص

\`\`\`bash
node scraper_interactive.js
\`\`\`

يتيح لك إدخال أي رابط تريد فحصه بشكل تفاعلي.

### 3. الفحص المتعدد - فحص عدة روابط

\`\`\`bash
node batch_scraper.js
\`\`\`

يقوم بفحص عدة روابط rugcheck في دفعة واحدة مع تقرير شامل.

### 4. عرض المساعدة

\`\`\`bash
node scraper_interactive.js --help
\`\`\`

## 📁 الملفات المنتجة

بعد كل عملية فحص، يتم إنتاج الملفات التالية:

### 📊 ملف البيانات JSON
- يحتوي على جميع البيانات المستخرجة بصيغة منظمة
- مثال: \`rugcheck_9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi_1755236800154_data.json\`

### 🌐 ملف HTML الخام
- يحتوي على الكود HTML الأصلي للصفحة
- مثال: \`rugcheck_9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi_1755236800154.html\`

### 📋 تقرير نصي
- ملخص سهل القراءة للبيانات المستخرجة
- مثال: \`rugcheck_9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi_1755236800154_report.txt\`

## 🛡️ البيانات المستخرجة من Rugcheck

### معلومات أساسية
- ✅ عنوان التوكن (Token Address)
- 📊 مستوى المخاطر
- ⚠️ التحذيرات المكتشفة
- 🔍 نتائج الفحوصات الأمنية

### معلومات إضافية
- 📝 عنوان ووصف الصفحة
- 🔗 الروابط المستخرجة
- 📏 إحصائيات المحتوى
- 🕒 طوابع زمنية

## 💡 أمثلة للاستخدام

### مثال 1: فحص توكن سولانا
\`\`\`javascript
const WebScraper = require('./web_scraper');

async function checkToken() {
    const scraper = new WebScraper();
    const url = 'https://rugcheck.xyz/tokens/[TOKEN_ADDRESS]';
    
    try {
        const data = await scraper.scrapeWebsite(url);
        console.log('عنوان التوكن:', data.rugcheckSpecific.tokenAddress);
        console.log('عدد التحذيرات:', data.rugcheckSpecific.warnings.length);
    } catch (error) {
        console.error('خطأ:', error.message);
    }
}

checkToken();
\`\`\`

### مثال 2: فحص متعدد مع تأخير
\`\`\`javascript
const BatchScraper = require('./batch_scraper');

async function batchCheck() {
    const batchScraper = new BatchScraper();
    const urls = [
        'https://rugcheck.xyz/tokens/TOKEN1',
        'https://rugcheck.xyz/tokens/TOKEN2',
        'https://rugcheck.xyz/tokens/TOKEN3'
    ];
    
    const result = await batchScraper.scrapeMultipleUrls(urls, 5000); // 5 ثواني بين كل طلب
    console.log(\`تم فحص \${result.successful} من \${result.total} بنجاح\`);
}

batchCheck();
\`\`\`

## ⚙️ إعدادات متقدمة

### تخصيص Headers
يمكنك تعديل headers الطلبات في ملف \`web_scraper.js\`:

\`\`\`javascript
this.headers = {
    'User-Agent': 'Your Custom User Agent',
    'Accept': 'text/html,application/xhtml+xml',
    // إعدادات أخرى
};
\`\`\`

### تخصيص Timeout
\`\`\`javascript
const response = await axios.get(url, {
    headers: this.headers,
    timeout: 60000, // 60 ثانية
    maxRedirects: 10
});
\`\`\`

## 🚨 نصائح مهمة

1. **احترم حدود الخادم**: استخدم تأخير مناسب بين الطلبات
2. **تحقق من الاتصال**: تأكد من اتصالك بالإنترنت
3. **راقب الأخطاء**: راجع تقارير الأخطاء لحل المشاكل
4. **اعتدال في الاستخدام**: لا تفرط في عدد الطلبات

## 🔧 استكشاف الأخطاء

### خطأ "ENOTFOUND"
- تحقق من الاتصال بالإنترنت
- تأكد من صحة الرابط

### خطأ "ETIMEDOUT"
- زد من قيمة timeout
- حاول مرة أخرى لاحقاً

### خطأ 403/429
- تم حظر IP مؤقتاً
- زد من التأخير بين الطلبات

## 📞 الدعم

لأي استفسارات أو مشاكل:
- راجع ملفات السجل (execution_logs.txt)
- تحقق من رسائل الخطأ في الكونسول
- تأكد من تحديث التبعيات

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الشخصي والتعليمي.

---

**تحذير**: استخدم هذه الأداة بمسؤولية واحترم شروط استخدام المواقع المستهدفة.
