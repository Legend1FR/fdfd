// دالة محدثة للفحص تشمل النصوص الفعلية من صفحة RugCheck
async function checkTokenSafetyUpdated(token) {
  console.log(`[${token}] 🔍 فحص التوكن باستخدام النظام المحسن للجمل (محدث)...`);
  
  try {
    // استخدام rugcheck_content_extractor.js
    const RugcheckContentExtractor = require('./rugcheck_content_extractor');
    const extractor = new RugcheckContentExtractor();
    
    // استخراج المحتوى المنسق
    const formattedContent = await extractor.extractFormattedContent(token);
    
    // تحويل المحتوى إلى أحرف صغيرة للبحث بسهولة
    const content = formattedContent.toLowerCase();
    
    console.log(`[${token}] 🔍 المحتوى المستخرج للفحص:`);
    console.log(content.substring(0, 1000) + '...');
    
    // جمل الخطر (DANGER) - تم تحديثها لتشمل النصوص الفعلية
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
    ];
    
    // جمل التحذير (WARNING)
    const warningPhrases = [
      'copycat token',
      'high holder correlation',
      'low amount of holders',
      'creator history of rugged tokens',
      'warning' // إضافة كلمة Warning نفسها
    ];
    
    console.log(`[${token}] 🔍 البحث عن الجمل في المحتوى...`);
    
    // البحث عن جمل الخطر
    let foundDangerPhrases = [];
    for (const phrase of dangerPhrases) {
      if (content.includes(phrase)) {
        foundDangerPhrases.push(phrase);
        console.log(`[${token}] 🔴 تم العثور على جملة خطر: "${phrase}"`);
      }
    }
    
    // البحث عن جمل التحذير
    let foundWarningPhrases = [];
    for (const phrase of warningPhrases) {
      if (content.includes(phrase)) {
        foundWarningPhrases.push(phrase);
        console.log(`[${token}] ⚠️ تم العثور على جملة تحذير: "${phrase}"`);
      }
    }
    
    // تحديد الحالة النهائية
    let status;
    if (foundDangerPhrases.length > 0) {
      // في حال وجود أي جملة خطر أو خلط بين خطر وتحذير
      status = 'DANGER';
      console.log(`[${token}] 🔴 التوكن خطر - تم العثور على ${foundDangerPhrases.length} جملة خطر`);
      console.log(`[${token}] الجمل الخطيرة: ${foundDangerPhrases.join(', ')}`);
    } else if (foundWarningPhrases.length > 0) {
      // في حال وجود جمل تحذير فقط
      status = 'WARNING';
      console.log(`[${token}] ⚠️ التوكن تحذيري - تم العثور على ${foundWarningPhrases.length} جملة تحذير`);
      console.log(`[${token}] جمل التحذير: ${foundWarningPhrases.join(', ')}`);
    } else {
      // في حال عدم وجود أي جمل خطيرة أو تحذيرية
      status = 'GOOD';
      console.log(`[${token}] ✅ التوكن آمن - لم يتم العثور على أي جمل خطيرة أو تحذيرية`);
    }
    
    return status;
    
  } catch (error) {
    console.error(`[${token}] ❌ خطأ في فحص التوكن: ${error.message}`);
    
    // الرجوع للطريقة القديمة في حالة الخطأ
    try {
      const apiResult = await checkTokenSafetyAPI(token);
      if (apiResult !== 'UNKNOWN') {
        console.log(`[${token}] ✅ نتيجة API البديل بعد الخطأ: ${apiResult}`);
        return apiResult;
      }
    } catch (fallbackError) {
      console.error(`[${token}] ❌ خطأ في API البديل أيضاً: ${fallbackError.message}`);
    }
    
    return 'UNKNOWN';
  }
}

module.exports = { checkTokenSafetyUpdated };
