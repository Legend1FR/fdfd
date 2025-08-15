// إصلاح النظام لاكتشاف التوكن كـ DANGER بدلاً من GOOD
// المشكلة: النظام لا يكتشف "Danger" و "Low amount of LP Providers" بشكل صحيح

console.log('🔧 تطبيق الإصلاح على النظام...');

// 1. قراءة ملف server.js
const fs = require('fs');
const serverContent = fs.readFileSync('server.js', 'utf8');

// 2. البحث عن الدوال التي تحتاج تحديث
let updatedContent = serverContent;

// 3. تحديث قائمة جمل الخطر لتشمل "danger" ككلمة منفصلة
const oldDangerPhrasesPattern = /const dangerPhrases = \[[\s\S]*?\];/g;
const newDangerPhrases = `const dangerPhrases = [
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

updatedContent = updatedContent.replace(oldDangerPhrasesPattern, newDangerPhrases);

// 4. تحديث قائمة جمل التحذير لتشمل "warning"
const oldWarningPhrasesPattern = /const warningPhrases = \[[\s\S]*?\];/g;
const newWarningPhrases = `const warningPhrases = [
      'copycat token',
      'high holder correlation',
      'low amount of holders',
      'creator history of rugged tokens',
      'warning' // إضافة كلمة Warning نفسها
    ];`;

updatedContent = updatedContent.replace(oldWarningPhrasesPattern, newWarningPhrases);

// 5. حفظ الملف المحدث
fs.writeFileSync('server_fixed.js', updatedContent);

console.log('✅ تم إنشاء server_fixed.js بالتحديثات المطلوبة');
console.log('📝 التحديثات المطبقة:');
console.log('   - إضافة "danger" لقائمة جمل الخطر');
console.log('   - إضافة "warning" لقائمة جمل التحذير');
console.log('   - إضافة "low amount of lp providers" (بدلاً من holders)');

console.log('\n🧪 اختبار التوكن المحدد...');

// اختبار مع النص الفعلي
const testContent = 'RugCheck Project Alaska Risk Analysis 10 / 100 Danger Low amount of LP Providers Only a few users are providing liquidity';
const lowercaseContent = testContent.toLowerCase();

const dangerPhrases = [
  'large amount of lp" unlocked',
  'large amount of lp unlocked',
  'mutable metadata', 
  'low liquidity',
  'low amount of lp providers',
  'top 10 holders high ownership',
  'single holder ownership',
  'honeypot',
  'danger'
];

const warningPhrases = [
  'copycat token',
  'high holder correlation',
  'low amount of holders',
  'creator history of rugged tokens',
  'warning'
];

let foundDanger = [];
let foundWarning = [];

for (const phrase of dangerPhrases) {
  if (lowercaseContent.includes(phrase)) {
    foundDanger.push(phrase);
    console.log(`🔴 وجدت جملة خطر: "${phrase}"`);
  }
}

for (const phrase of warningPhrases) {
  if (lowercaseContent.includes(phrase)) {
    foundWarning.push(phrase);
    console.log(`⚠️ وجدت جملة تحذير: "${phrase}"`);
  }
}

let result;
if (foundDanger.length > 0) {
  result = 'DANGER';
  console.log(`\n🔴 النتيجة النهائية: ${result}`);
  console.log(`   الجمل الخطيرة: ${foundDanger.join(', ')}`);
} else if (foundWarning.length > 0) {
  result = 'WARNING';
  console.log(`\n⚠️ النتيجة النهائية: ${result}`);
} else {
  result = 'GOOD';
  console.log(`\n✅ النتيجة النهائية: ${result}`);
}

console.log('\n📋 الخلاصة:');
console.log(`   التوكن 8Q9i4H7fi8DnE6ZzuutZLmZ3q65HDhzQxum5r5bDjFKB`);
console.log(`   يجب أن يظهر كـ: ${result}`);
console.log(`   بدلاً من: GOOD/UNKNOWN`);

console.log('\n🚀 لتطبيق الإصلاح:');
console.log('   1. أوقف السيرفر الحالي');
console.log('   2. cp server_fixed.js server.js');
console.log('   3. أعد تشغيل السيرفر');
