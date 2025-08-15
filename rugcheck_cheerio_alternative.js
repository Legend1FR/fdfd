// بديل باستخدام Cheerio لتحليل HTML (أسرع من Puppeteer)
const https = require('https');
const cheerio = require('cheerio'); // يجب تثبيتها: npm install cheerio

async function checkTokenSafetyCheerio(token) {
  try {
    console.log(`[${token}] 🔍 فحص التوكن باستخدام Cheerio...`);
    
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
            const pageText = $('body').text().toLowerCase();
            
            console.log(`[${token}] تم تحميل الصفحة بنجاح`);
            
            // البحث عن نقاط المخاطر
            const riskScoreMatch = pageText.match(/(\d+)\s*\/\s*100/) || 
                                 pageText.match(/risk[:\s]*(\d+)/i);
            
            if (riskScoreMatch) {
              const riskScore = parseInt(riskScoreMatch[1]);
              console.log(`[${token}] تم العثور على نقاط المخاطر: ${riskScore}`);
              
              if (riskScore <= 30) {
                resolve('GOOD');
              } else if (riskScore <= 69) {
                resolve('WARNING');
              } else {
                resolve('DANGER');
              }
              return;
            }
            
            // البحث في العناصر الملونة
            let tokenStatus = null;
            
            // البحث عن عناصر حمراء (خطر)
            $('*').each((i, element) => {
              const $el = $(element);
              const text = $el.text().toLowerCase();
              const className = $el.attr('class') || '';
              
              if (className.includes('danger') || className.includes('red') || 
                  text.includes('high risk') || text.includes('dangerous')) {
                tokenStatus = 'DANGER';
                console.log(`[${token}] ⚠️ عنصر خطر: ${text.slice(0, 50)}`);
                return false; // توقف عن البحث
              }
            });
            
            // البحث عن عناصر برتقالية (تحذير)
            if (!tokenStatus) {
              $('*').each((i, element) => {
                const $el = $(element);
                const text = $el.text().toLowerCase();
                const className = $el.attr('class') || '';
                
                if (className.includes('warning') || className.includes('orange') || 
                    text.includes('medium risk') || text.includes('warning')) {
                  tokenStatus = 'WARNING';
                  console.log(`[${token}] ⚠️ عنصر تحذير: ${text.slice(0, 50)}`);
                  return false;
                }
              });
            }
            
            // البحث عن عناصر خضراء (آمن)
            if (!tokenStatus) {
              $('*').each((i, element) => {
                const $el = $(element);
                const text = $el.text().toLowerCase();
                const className = $el.attr('class') || '';
                
                if (className.includes('good') || className.includes('green') || 
                    text.includes('low risk') || text.includes('safe')) {
                  tokenStatus = 'GOOD';
                  console.log(`[${token}] ✅ عنصر أمان: ${text.slice(0, 50)}`);
                  return false;
                }
              });
            }
            
            // البحث في الكلمات المفتاحية
            if (!tokenStatus) {
              if (pageText.includes('high risk') || pageText.includes('dangerous') || 
                  pageText.includes('scam') || pageText.includes('honeypot')) {
                tokenStatus = 'DANGER';
                console.log(`[${token}] ⚠️ كلمة مفتاحية خطر موجودة`);
              } else if (pageText.includes('medium risk') || pageText.includes('warning')) {
                tokenStatus = 'WARNING';
                console.log(`[${token}] ⚠️ كلمة مفتاحية تحذير موجودة`);
              } else if (pageText.includes('low risk') || pageText.includes('safe')) {
                tokenStatus = 'GOOD';
                console.log(`[${token}] ✅ كلمة مفتاحية أمان موجودة`);
              }
            }
            
            resolve(tokenStatus || 'UNKNOWN');
            
          } catch (parseError) {
            console.log(`[${token}] خطأ في تحليل HTML: ${parseError.message}`);
            resolve('UNKNOWN');
          }
        });
      });

      req.on('error', (error) => {
        console.log(`[${token}] خطأ في طلب HTML: ${error.message}`);
        resolve('UNKNOWN');
      });

      req.setTimeout(15000, () => {
        console.log(`[${token}] انتهت مهلة طلب HTML`);
        req.abort();
        resolve('UNKNOWN');
      });

      req.end();
    });
  } catch (error) {
    console.error(`[${token}] خطأ عام في Cheerio: ${error.message}`);
    return 'UNKNOWN';
  }
}

module.exports = { checkTokenSafetyCheerio };
