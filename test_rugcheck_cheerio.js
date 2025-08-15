/**
 * اختبار دالة Rugcheck المحسنة باستخدام Cheerio
 * تشغيل: node test_rugcheck_cheerio.js
 */

const https = require('https');
const cheerio = require('cheerio');

// دالة محسنة لتحليل HTML باستخدام Cheerio - نسخة مستقلة للاختبار
async function testRugcheckCheerio(token) {
  try {
    console.log(`[TEST] 🔍 اختبار تحليل ${token} باستخدام Cheerio...`);
    
    const options = {
      hostname: 'rugcheck.xyz',
      port: 443,
      path: `/tokens/${token}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const fetchTime = Date.now() - startTime;
          console.log(`[TEST] ⏱️ وقت جلب البيانات: ${fetchTime}ms`);
          
          try {
            const parseStartTime = Date.now();
            
            // تحليل HTML باستخدام Cheerio
            const $ = cheerio.load(data);
            
            // البحث عن نقاط المخاطر بطرق متعددة ودقيقة
            let riskScore = null;
            let foundIn = '';
            
            // 1. البحث في عناصر محددة تحتوي على نقاط المخاطر
            const riskElements = [
              'span:contains("/")', 
              'div:contains("/100")',
              '.risk-score',
              '.score',
              '[data-score]',
              'span[class*="score"]',
              'div[class*="risk"]',
              '*:contains("/100")'
            ];
            
            for (const selector of riskElements) {
              try {
                const elements = $(selector);
                console.log(`[TEST] 🔍 فحص ${selector}: وُجد ${elements.length} عنصر`);
                
                elements.each((i, elem) => {
                  const text = $(elem).text();
                  const scoreMatch = text.match(/(\d+)\s*\/\s*100/) || 
                                   text.match(/(\d+)\/100/) || 
                                   text.match(/(\d+)\s*%/);
                  if (scoreMatch) {
                    riskScore = parseInt(scoreMatch[1]);
                    foundIn = selector;
                    console.log(`[TEST] ✅ تم العثور على نقاط المخاطر في ${selector}: ${riskScore} من النص: "${text.trim()}"`);
                    return false; // break من each loop
                  }
                });
                if (riskScore !== null) break;
              } catch (selectorError) {
                console.log(`[TEST] ⚠️ خطأ في محدد ${selector}: ${selectorError.message}`);
              }
            }
            
            // 2. إذا لم نجد نقاط محددة، ابحث في النص العام
            if (riskScore === null) {
              const bodyText = $('body').text();
              console.log(`[TEST] 🔍 البحث في النص العام (${bodyText.length} حرف)`);
              
              const generalScoreMatch = bodyText.match(/(\d+)\s*\/\s*100/) || 
                                      bodyText.match(/risk[:\s]*(\d+)/i) ||
                                      bodyText.match(/score[:\s]*(\d+)/i);
              
              if (generalScoreMatch) {
                riskScore = parseInt(generalScoreMatch[1]);
                foundIn = 'النص العام';
                console.log(`[TEST] ✅ تم العثور على نقاط المخاطر في النص العام: ${riskScore}`);
              }
            }
            
            const parseTime = Date.now() - parseStartTime;
            console.log(`[TEST] ⏱️ وقت تحليل Cheerio: ${parseTime}ms`);
            
            // 3. تقييم النقاط إذا وُجدت
            let result = 'UNKNOWN';
            if (riskScore !== null && !isNaN(riskScore)) {
              console.log(`[TEST] 📊 نقاط المخاطر النهائية: ${riskScore}/100 (من ${foundIn})`);
              
              if (riskScore <= 25) {
                result = 'GOOD';
              } else if (riskScore <= 60) {
                result = 'WARNING';
              } else {
                result = 'DANGER';
              }
            } else {
              // البحث عن الكلمات المفتاحية
              const pageText = $('body').text().toLowerCase();
              console.log(`[TEST] 🔍 البحث في الكلمات المفتاحية...`);
              
              const dangerKeywords = ['high risk', 'dangerous', 'scam', 'honeypot'];
              const safeKeywords = ['low risk', 'safe', 'verified', 'legitimate'];
              const warningKeywords = ['medium risk', 'moderate', 'careful'];
              
              for (const keyword of dangerKeywords) {
                if (pageText.includes(keyword)) {
                  result = 'DANGER';
                  console.log(`[TEST] ⚠️ تم العثور على كلمة خطيرة: ${keyword}`);
                  break;
                }
              }
              
              if (result === 'UNKNOWN') {
                for (const keyword of warningKeywords) {
                  if (pageText.includes(keyword)) {
                    result = 'WARNING';
                    console.log(`[TEST] ⚠️ تم العثور على كلمة تحذيرية: ${keyword}`);
                    break;
                  }
                }
              }
              
              if (result === 'UNKNOWN') {
                for (const keyword of safeKeywords) {
                  if (pageText.includes(keyword)) {
                    result = 'GOOD';
                    console.log(`[TEST] ✅ تم العثور على كلمة آمنة: ${keyword}`);
                    break;
                  }
                }
              }
            }
            
            const totalTime = Date.now() - startTime;
            console.log(`[TEST] ⏱️ الوقت الإجمالي: ${totalTime}ms`);
            console.log(`[TEST] 🎯 النتيجة النهائية: ${result}`);
            
            resolve({
              result,
              riskScore,
              foundIn,
              timings: {
                fetch: fetchTime,
                parse: parseTime,
                total: totalTime
              }
            });
            
          } catch (parseError) {
            console.log(`[TEST] ❌ خطأ في تحليل HTML: ${parseError.message}`);
            resolve({ result: 'UNKNOWN', error: parseError.message });
          }
        });
      });

      req.on('error', (error) => {
        console.log(`[TEST] ❌ خطأ في الطلب: ${error.message}`);
        resolve({ result: 'UNKNOWN', error: error.message });
      });

      req.setTimeout(15000, () => {
        console.log(`[TEST] ⏰ انتهت المهلة الزمنية`);
        req.abort();
        resolve({ result: 'UNKNOWN', error: 'Timeout' });
      });

      req.end();
    });
  } catch (error) {
    console.error(`[TEST] ❌ خطأ عام: ${error.message}`);
    return { result: 'UNKNOWN', error: error.message };
  }
}

// دالة الاختبار الرئيسية
async function runTests() {
  console.log('🧪 بدء اختبار دالة Rugcheck مع Cheerio\n');
  
  // عناوين توكنات للاختبار (يمكن تغييرها)
  const testTokens = [
    'So11111111111111111111111111111111111111112', // SOL
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'  // USDC
  ];
  
  for (const token of testTokens) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🪙 اختبار التوكن: ${token}`);
    console.log(`${'='.repeat(60)}`);
    
    const result = await testRugcheckCheerio(token);
    
    console.log('\n📊 ملخص النتائج:');
    console.log(`   🎯 النتيجة: ${result.result}`);
    if (result.riskScore !== undefined) {
      console.log(`   📈 النقاط: ${result.riskScore}/100`);
    }
    if (result.foundIn) {
      console.log(`   📍 المصدر: ${result.foundIn}`);
    }
    if (result.timings) {
      console.log(`   ⏱️ الأوقات:`);
      console.log(`      - جلب البيانات: ${result.timings.fetch}ms`);
      console.log(`      - تحليل Cheerio: ${result.timings.parse}ms`);
      console.log(`      - المجموع: ${result.timings.total}ms`);
    }
    if (result.error) {
      console.log(`   ❌ خطأ: ${result.error}`);
    }
    
    // انتظار بين الطلبات
    console.log('\n⏳ انتظار 3 ثواني قبل الطلب التالي...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n✅ انتهى الاختبار!');
}

// تشغيل الاختبار
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ خطأ في تشغيل الاختبار:', error);
  });
}

module.exports = { testRugcheckCheerio };
