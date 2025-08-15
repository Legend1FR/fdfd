const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

// اختبار النظام الجديد للجمل
async function testNewSentenceSystem() {
  console.log('🧪 اختبار النظام الجديد المحسن للجمل...\n');
  
  try {
    // استخدام rugcheck_content_extractor.js
    const RugcheckContentExtractor = require('./rugcheck_content_extractor');
    const extractor = new RugcheckContentExtractor();
    
    // توكن اختبار (Solana token address)
    const testToken = 'So11111111111111111111111111111111111111112'; // SOL token for testing
    
    console.log(`🔍 اختبار التوكن: ${testToken}`);
    
    // استخراج المحتوى المنسق
    const formattedContent = await extractor.extractFormattedContent(testToken);
    
    // تحويل المحتوى إلى أحرف صغيرة للبحث بسهولة
    const content = formattedContent.toLowerCase();
    
    console.log('\n📄 المحتوى المستخرج:');
    console.log('='.repeat(50));
    console.log(content.substring(0, 500) + '...');
    console.log('='.repeat(50));
    
    // جمل الخطر (DANGER)
    const dangerPhrases = [
      'large amount of lp" unlocked',
      'mutable metadata', 
      'low liquidity',
      'top 10 holders high ownership',
      'single holder ownership',
      'honeypot'
    ];
    
    // جمل التحذير (WARNING)
    const warningPhrases = [
      'copycat token',
      'high holder correlation',
      'low amount of holders',
      'creator history of rugged tokens'
    ];
    
    console.log('\n🔍 البحث عن الجمل...');
    
    // البحث عن جمل الخطر
    let foundDangerPhrases = [];
    for (const phrase of dangerPhrases) {
      if (content.includes(phrase)) {
        foundDangerPhrases.push(phrase);
        console.log(`🔴 تم العثور على جملة خطر: "${phrase}"`);
      }
    }
    
    // البحث عن جمل التحذير
    let foundWarningPhrases = [];
    for (const phrase of warningPhrases) {
      if (content.includes(phrase)) {
        foundWarningPhrases.push(phrase);
        console.log(`⚠️ تم العثور على جملة تحذير: "${phrase}"`);
      }
    }
    
    // تحديد الحالة النهائية
    let status;
    if (foundDangerPhrases.length > 0) {
      status = 'DANGER';
      console.log(`\n🔴 النتيجة النهائية: التوكن خطر`);
      console.log(`🔴 الجمل الخطيرة الموجودة: ${foundDangerPhrases.join(', ')}`);
      if (foundWarningPhrases.length > 0) {
        console.log(`⚠️ جمل التحذير الموجودة أيضاً (مع الخطر = DANGER): ${foundWarningPhrases.join(', ')}`);
      }
    } else if (foundWarningPhrases.length > 0) {
      status = 'WARNING';
      console.log(`\n⚠️ النتيجة النهائية: التوكن تحذيري`);
      console.log(`⚠️ جمل التحذير الموجودة: ${foundWarningPhrases.join(', ')}`);
    } else {
      status = 'GOOD';
      console.log(`\n✅ النتيجة النهائية: التوكن آمن`);
      console.log(`✅ لم يتم العثور على أي جمل خطيرة أو تحذيرية`);
    }
    
    console.log(`\n📊 الحالة النهائية: ${status}`);
    console.log('\n✅ تم اختبار النظام الجديد بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في اختبار النظام:', error.message);
    console.error(error.stack);
  }
}

// تشغيل الاختبار
testNewSentenceSystem().catch(console.error);
