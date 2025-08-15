// اختبار سريع للنظام الجديد
const dangerSentences = [
  'Large Amount of LP\" Unlocked\"',
  'Mutable metadata',
  'Low Liquidity',
  'Top 10 holders high ownership', 
  'Single holder ownership',
  'honeypot'
];

const warningSentences = [
  'Copycat token',
  'High holder correlation',
  'Low Amount of holders',
  'Creator history of rugged tokens'
];

function testClassification(content) {
  console.log('اختبار المحتوى:', content);
  
  // البحث عن جمل الخطر
  for (const sentence of dangerSentences) {
    if (content.includes(sentence)) {
      console.log('🔴 النتيجة: DANGER - وجدت:', sentence);
      return 'DANGER';
    }
  }
  
  // البحث عن جمل التحذير
  for (const sentence of warningSentences) {
    if (content.includes(sentence)) {
      console.log('⚠️ النتيجة: WARNING - وجدت:', sentence);
      return 'WARNING';
    }
  }
  
  console.log('✅ النتيجة: GOOD - لم توجد جمل خطر أو تحذير');
  return 'GOOD';
}

// اختبارات
console.log('=== اختبار النظام الجديد ===');
testClassification('Token has Low Liquidity issues');
console.log('---');
testClassification('This is a Copycat token');
console.log('---');
testClassification('Low Amount of holder'); // ناقصة حرف s
console.log('---');
testClassification('Score 85/100 but honeypot detected');
console.log('---');
testClassification('Safe token with no issues');
console.log('=== انتهى الاختبار ===');
