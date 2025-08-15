const { checkTokenSafetyCheerio } = require('./server.js');

async function testSpecificToken() {
  const token = 'CWX6t6pGJ1zsnuywnyd2ZMZJ7inB2sWuPdsteoT6pump';
  
  console.log('🔍 اختبار محدد للتوكن الذي يحتوي على عنصر <h1>Danger</h1>');
  console.log(`التوكن: ${token}`);
  console.log('===============================================');
  
  try {
    console.log('🚀 بدء فحص التوكن بالنظام المحسن...');
    const result = await checkTokenSafetyCheerio(token);
    
    console.log('===============================================');
    console.log(`🎯 النتيجة النهائية: ${result}`);
    
    // تحليل النتيجة
    if (result === 'GOOD') {
      console.log('✅ النظام تعرف بنجاح على أن التوكن آمن رغم وجود عنصر "Danger"');
      console.log('✅ هذا يعني أن النظام أصبح ذكياً في تمييز العناوين العامة من التقييمات المحددة');
    } else if (result === 'WARNING') {
      console.log('⚠️ النظام غير متأكد - قد يحتاج تحسين إضافي');
    } else if (result === 'DANGER') {
      console.log('❌ النظام ما زال يصنف التوكن كخطر');
      console.log('❌ يحتاج مراجعة منطق التحليل');
    } else {
      console.log('❓ نتيجة غير محددة - قد تكون مشكلة في الشبكة أو الصفحة');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// فحص مباشر للحصول على تفاصيل أكثر
async function analyzePageStructure() {
  const token = 'CWX6t6pGJ1zsnuywnyd2ZMZJ7inB2sWuPdsteoT6pump';
  const https = require('https');
  const cheerio = require('cheerio');
  
  console.log('\n🔍 تحليل مفصل لبنية الصفحة...');
  
  const options = {
    hostname: 'rugcheck.xyz',
    port: 443,
    path: `/tokens/${token}`,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const $ = cheerio.load(data);
          
          console.log('📄 معلومات الصفحة:');
          console.log(`   - حجم الصفحة: ${data.length} بايت`);
          console.log(`   - عنوان الصفحة: "${$('title').text()}"`);
          
          // البحث عن جميع عناصر H1
          console.log('\n📋 جميع عناصر H1:');
          $('h1').each((i, elem) => {
            const element = $(elem);
            const text = element.text().trim();
            const classes = element.attr('class') || 'لا يوجد';
            const style = element.attr('style') || 'لا يوجد';
            console.log(`   ${i + 1}. النص: "${text}"`);
            console.log(`      الكلاسات: ${classes}`);
            console.log(`      الستايل: ${style}`);
          });
          
          // البحث عن كلمة "good"
          console.log('\n🟢 البحث عن "good":');
          $('*:contains("good"), *:contains("Good"), *:contains("GOOD")').each((i, elem) => {
            const element = $(elem);
            const text = element.text().trim();
            const tagName = element.prop('tagName');
            const classes = element.attr('class') || 'لا يوجد';
            const style = element.attr('style') || 'لا يوجد';
            
            if (text.length < 100) { // تجنب النصوص الطويلة
              console.log(`   ${i + 1}. <${tagName}> "${text}"`);
              console.log(`      الكلاسات: ${classes}`);
              console.log(`      الستايل: ${style}`);
            }
          });
          
          // البحث عن العناصر الملونة
          console.log('\n🎨 العناصر الملونة:');
          $('[style*="color"], [class*="green"], [class*="red"], [class*="success"], [class*="danger"]').each((i, elem) => {
            const element = $(elem);
            const text = element.text().trim();
            const tagName = element.prop('tagName');
            const classes = element.attr('class') || 'لا يوجد';
            const style = element.attr('style') || 'لا يوجد';
            
            if (text.length > 0 && text.length < 50) {
              console.log(`   ${i + 1}. <${tagName}> "${text}"`);
              console.log(`      الكلاسات: ${classes}`);
              console.log(`      الستايل: ${style}`);
            }
          });
          
          resolve();
        } catch (error) {
          console.error('خطأ في تحليل الصفحة:', error);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.error('خطأ في جلب الصفحة:', error);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log('انتهت مهلة الطلب');
      req.abort();
      resolve();
    });

    req.end();
  });
}

async function runFullTest() {
  await testSpecificToken();
  await analyzePageStructure();
}

runFullTest().catch(console.error);
