/**
 * فحص مفصل لصفحة rugcheck لفهم المشكلة
 */

const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

async function debugRugcheckPage(token) {
  console.log(`🔍 فحص مفصل لصفحة rugcheck للتوكن: ${token}`);
  
  const options = {
    hostname: 'rugcheck.xyz',
    port: 443,
    path: `/tokens/${token}`,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          // حفظ HTML للمراجعة
          const filename = `debug_${token}_rugcheck_detailed.html`;
          fs.writeFileSync(filename, data);
          console.log(`💾 تم حفظ HTML في: ${filename}`);
          
          // تحليل HTML باستخدام Cheerio
          const $ = cheerio.load(data);
          
          console.log('\n📋 تحليل مفصل للصفحة:');
          console.log('=' .repeat(50));
          
          // 1. البحث عن جميع النصوص التي تحتوي على "good"
          console.log('\n🟢 البحث عن كلمة "good":');
          $('*:contains("good"), *:contains("Good"), *:contains("GOOD")').each((i, elem) => {
            const element = $(elem);
            const text = element.text().trim();
            const tag = element.prop('tagName').toLowerCase();
            const classes = element.attr('class') || 'no-class';
            const style = element.attr('style') || 'no-style';
            
            // تحقق من اللون الأخضر
            const hasGreenColor = style.includes('green') || 
                                 style.includes('#0') || 
                                 style.includes('rgb(0') ||
                                 classes.includes('green') ||
                                 classes.includes('success') ||
                                 classes.includes('good');
            
            console.log(`  📄 <${tag}> "${text}" [${classes}] [${style}] ${hasGreenColor ? '🟢' : '⚪'}`);
          });
          
          // 2. البحث عن عناصر ملونة بالأخضر
          console.log('\n🎨 البحث عن عناصر خضراء:');
          $('*').each((i, elem) => {
            const element = $(elem);
            const style = element.attr('style') || '';
            const classes = element.attr('class') || '';
            
            const isGreen = style.includes('green') || 
                           style.includes('#0') || 
                           style.includes('rgb(0') ||
                           classes.includes('green') ||
                           classes.includes('success');
            
            if (isGreen) {
              const text = element.text().trim();
              const tag = element.prop('tagName').toLowerCase();
              console.log(`  🟢 <${tag}> "${text}" [${classes}] [${style}]`);
            }
          });
          
          // 3. البحث عن نقاط المخاطر
          console.log('\n📊 البحث عن نقاط المخاطر:');
          const bodyText = $('body').text();
          const scoreMatches = [
            bodyText.match(/(\d+)\s*\/\s*100/g),
            bodyText.match(/score[:\s]*(\d+)/gi),
            bodyText.match(/risk[:\s]*(\d+)/gi)
          ];
          
          scoreMatches.forEach((matches, index) => {
            if (matches) {
              console.log(`  📈 طريقة ${index + 1}: ${matches.join(', ')}`);
            }
          });
          
          // 4. البحث عن كلمات مفتاحية
          console.log('\n🔤 الكلمات المفتاحية الموجودة:');
          const keywords = {
            danger: ['high risk', 'dangerous', 'scam', 'honeypot', 'rug pull'],
            safe: ['low risk', 'safe', 'verified', 'legitimate', 'good', 'secure'],
            warning: ['medium risk', 'moderate', 'careful', 'attention']
          };
          
          const lowerText = bodyText.toLowerCase();
          
          Object.keys(keywords).forEach(category => {
            keywords[category].forEach(keyword => {
              if (lowerText.includes(keyword)) {
                console.log(`  ${category === 'danger' ? '🔴' : category === 'safe' ? '🟢' : '🟡'} "${keyword}" موجودة`);
              }
            });
          });
          
          // 5. فحص title الصفحة
          const title = $('title').text();
          console.log(`\n📰 عنوان الصفحة: "${title}"`);
          
          // 6. البحث عن CSS classes ذات مغزى
          console.log('\n🎭 CSS Classes المهمة:');
          $('[class*="risk"], [class*="safe"], [class*="good"], [class*="danger"], [class*="warning"], [class*="green"], [class*="red"]').each((i, elem) => {
            const element = $(elem);
            const text = element.text().trim();
            const classes = element.attr('class');
            console.log(`  🏷️  "${text}" [${classes}]`);
          });
          
          console.log('\n✅ انتهى التحليل المفصل');
          resolve(data);
          
        } catch (error) {
          console.error('❌ خطأ في التحليل:', error.message);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ خطأ في الطلب:', error.message);
      resolve(null);
    });

    req.setTimeout(15000, () => {
      console.log('⏰ انتهت المهلة');
      req.abort();
      resolve(null);
    });

    req.end();
  });
}

// تشغيل التحليل
const token = 'CWX6t6pGJ1zsnuywnyd2ZMZJ7inB2sWuPdsteoT6pump';
debugRugcheckPage(token).then(() => {
  console.log('\n🎯 التحليل اكتمل!');
}).catch(error => {
  console.error('❌ خطأ:', error);
});
