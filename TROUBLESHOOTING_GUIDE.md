# دليل استكشاف الأخطاء وإصلاحها - Token Tracking System

## المشاكل المكتشفة والحلول المطبقة

### 1. خطأ Cloudflare 1015 (Rate Limiting)

**المشكلة:**
```
خطأ في تحليل JSON: Unexpected token 'e', "error code: 1015" is not valid JSON
```

**السبب:**
- DexScreener API يستخدم Cloudflare للحماية من الطلبات المكثفة
- خطأ 1015 يعني Rate Limiting - أي أن الطلبات تأتي بسرعة كبيرة
- البرنامج يحاول parse HTML error page كـ JSON

**الحلول المطبقة:**

#### أ) نظام إدارة الطلبات (Request Manager)
```javascript
class RequestManager {
  constructor() {
    this.lastRequestTime = 0;
    this.minDelay = 3000; // 3 ثوانٍ كحد أدنى بين الطلبات
    this.requestQueue = [];
    this.processing = false;
  }
}
```

#### ب) معالجة أفضل للاستجابات
- التحقق من Status Code قبل معالجة البيانات
- التحقق من Content-Type للتأكد أن الاستجابة JSON
- اكتشاف أخطاء Cloudflare في النص قبل JSON parsing

#### ج) تحسين Headers
```javascript
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
}
```

#### د) زيادة فترات الانتظار
- تغيير فترة مراقبة الأسعار من 10 ثواني إلى 20 ثانية
- إضافة تأخير 3 ثوانٍ كحد أدنى بين الطلبات
- زيادة timeout من 8 ثوانٍ إلى 15 ثانية

### 2. عدم معالجة الاستجابات غير JSON

**المشكلة:**
البرنامج يحاول تحليل أي استجابة كـ JSON، حتى لو كانت HTML error page.

**الحل:**
```javascript
// التحقق من نوع المحتوى قبل المعالجة
const contentType = res.headers['content-type'] || '';

// التحقق من Status Code
if (res.statusCode !== 200) {
  console.log(`[${token}] ${api.name} HTTP Error: ${res.statusCode}`);
  resolve(null);
  return;
}

// التحقق من أن الاستجابة JSON
if (!contentType.includes('application/json')) {
  console.log(`[${token}] ${api.name} خطأ: الاستجابة ليست JSON (${contentType})`);
  const preview = data.substring(0, 200);
  console.log(`[${token}] ${api.name} معاينة الاستجابة: ${preview}...`);
  resolve(null);
  return;
}

// التحقق من وجود error codes معروفة في النص
if (data.includes('error code: 1015') || data.includes('Cloudflare')) {
  console.log(`[${token}] ${api.name} خطأ Cloudflare: Rate limiting detected`);
  resolve(null);
  return;
}
```

### 3. عدم وجود نظام إعادة المحاولة

**المشكلة:**
عند فشل API، البرنامج ينتقل مباشرة للـ API التالي دون إعادة محاولة.

**الحل:**
تم تنفيذ نظام queue في RequestManager يضمن معالجة الطلبات بشكل متتالي مع فترات انتظار مناسبة.

## التحسينات الإضافية المقترحة

### 1. إضافة نظام Retry مع Exponential Backoff
```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 2. إضافة Cache للنتائج
```javascript
const priceCache = new Map();
const CACHE_DURATION = 30000; // 30 ثانية

function getCachedPrice(token) {
  const cached = priceCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }
  return null;
}
```

### 3. استخدام APIs بديلة
- إضافة المزيد من APIs كبديل لـ DexScreener
- ترتيب APIs حسب الموثوقية والسرعة

## مؤشرات المراقبة

### إشارات خطأ Rate Limiting:
- `"error code: 1015"`
- `"Cloudflare"`
- `"Rate limit exceeded"`
- HTTP Status Code 429
- Content-Type ليس `application/json`

### إشارات الحالة الصحية:
- استجابة سريعة (أقل من 5 ثوانٍ)
- Content-Type: `application/json`
- HTTP Status Code 200
- بيانات صحيحة في JSON

## الممارسات الأفضل

1. **لا تكثر من الطلبات**: احترم Rate Limits
2. **استخدم User-Agent حقيقي**: تجنب اكتشاف البوت
3. **تعامل مع الأخطاء بلطف**: لا تفشل بصوت عالي
4. **اضف Logging مفيد**: لتسهيل التشخيص
5. **استخدم Timeout مناسب**: لا قصير جداً ولا طويل جداً

## خطوات التشخيص

عند ظهور مشاكل مشابهة:

1. **تحقق من السجلات**: ابحث عن رسائل خطأ محددة
2. **فحص الشبكة**: تأكد من وصول الإنترنت
3. **تجربة API يدوياً**: استخدم curl أو Postman
4. **مراجعة Rate Limits**: تحقق من عدد الطلبات
5. **فحص Headers**: تأكد من User-Agent والـ headers الأخرى

## معلومات الاتصال بالدعم

عند الحاجة لمساعدة إضافية، قدم:
- رسائل الخطأ كاملة
- أوقات حدوث المشكلة
- عدد التوكنات المراقبة
- تكرار الطلبات
