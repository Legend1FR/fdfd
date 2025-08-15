// إصلاح نهائي للمشكلة - تحديث يدوي للدوال
console.log('🔧 إصلاح المشكلة الأساسية...');

const fs = require('fs');

// قراءة الملف الحالي
let content = fs.readFileSync('server.js', 'utf8');

// البحث عن الدالة وتحديثها يدوياً
const oldFunction = `    // جمل الخطر (DANGER) - تم تحديثها لتشمل النصوص الفعلية
    const dangerPhrases = [
      'large amount of lp" unlocked',
      'large amount of lp unlocked',
      'mutable metadata',
      'low liquidity',
      'low amount of lp providers', // النص الفعلي: "Low amount of LP Providers"
      'top 10 holders high ownership',
      'single holder ownership',
      'honeypot',
      'danger' // إضافة كلمة Danger نفسها
    ];`;

const newFunction = `    // جمل الخطر (DANGER) - تم تحديثها لتشمل النصوص الفعلية
    const dangerPhrases = [
      'large amount of lp unlocked',
      'large amount of lp" unlocked',
      'mutable metadata',
      'low liquidity',
      'low amount of lp providers', // النص الفعلي: "Low amount of LP Providers"
      'top 10 holders high ownership',
      'single holder ownership',
      'honeypot',
      'danger' // إضافة كلمة Danger نفسها - مهم جداً!
    ];`;

// استبدال المحتوى
if (content.includes('large amount of lp" unlocked')) {
  content = content.replace(oldFunction, newFunction);
  console.log('✅ تم تحديث الدالة الأولى');
} else {
  console.log('❌ لم يتم العثور على النص للتحديث في الدالة الأولى');
}

// التحديث للدالة الثانية أيضاً
const oldFunction2 = /const dangerPhrases = \[[\s\S]*?\];/g;
const matches = content.match(oldFunction2);
if (matches && matches.length > 1) {
  console.log(`🔍 تم العثور على ${matches.length} دالة تحتاج تحديث`);
  
  // تحديث جميع الدوال
  content = content.replace(oldFunction2, `const dangerPhrases = [
      'large amount of lp unlocked',
      'large amount of lp" unlocked', 
      'mutable metadata',
      'low liquidity',
      'low amount of lp providers', // النص الفعلي من الصفحة
      'top 10 holders high ownership',
      'single holder ownership',
      'honeypot',
      'danger' // إضافة كلمة Danger نفسها
    ];`);
}

// حفظ الملف
fs.writeFileSync('server.js', content);
console.log('✅ تم حفظ التحديثات');

// اختبار سريع
const testContent = `
Risk Analysis
10 / 100
Danger
Low amount of LP Providers
Only a few users are providing liquidity
`.toLowerCase();

const testPhrases = [
  'large amount of lp unlocked',
  'large amount of lp" unlocked',
  'mutable metadata',
  'low liquidity',
  'low amount of lp providers',
  'top 10 holders high ownership',
  'single holder ownership',
  'honeypot',
  'danger'
];

console.log('\n🧪 اختبار الجمل:');
let found = [];
for (const phrase of testPhrases) {
  if (testContent.includes(phrase)) {
    found.push(phrase);
    console.log(`✅ وجدت: "${phrase}"`);
  }
}

console.log(`\n📊 النتيجة: ${found.length > 0 ? 'DANGER' : 'GOOD'}`);
console.log(`الجمل الموجودة: ${found.join(', ')}`);

console.log('\n🚀 يجب إعادة تشغيل السيرفر لتطبيق التحديثات');
