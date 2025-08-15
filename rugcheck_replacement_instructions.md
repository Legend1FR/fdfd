// استبدال دالة checkTokenSafety بهذا الكود البسيط

// 1. احذف الدالة الحالية checkTokenSafety (من السطر 337 إلى السطر 700 تقريباً)

// 2. استبدلها بهذا الكود:

// التحقق من حالة التوكن على rugcheck.xyz بطريقة مبسطة (بدون puppeteer)
async function checkTokenSafety(token) {
  console.log(`[${token}] 🔍 فحص التوكن على rugcheck.xyz...`);
  
  try {
    // أولاً: محاولة API مباشر
    const apiResult = await checkTokenSafetyAPI(token);
    if (apiResult !== 'UNKNOWN') {
      console.log(`[${token}] ✅ تم الحصول على النتيجة من API: ${apiResult}`);
      return apiResult;
    }
    
    // ثانياً: محاولة HTML البسيط
    const htmlResult = await checkTokenSafetySimple(token);
    if (htmlResult !== 'UNKNOWN') {
      console.log(`[${token}] ✅ تم الحصول على النتيجة من HTML: ${htmlResult}`);
      return htmlResult;
    }
    
    console.log(`[${token}] ⚠️ لم يتم العثور على نتيجة واضحة`);
    return 'UNKNOWN';
    
  } catch (error) {
    console.error(`[${token}] ❌ خطأ في فحص التوكن: ${error.message}`);
    return 'UNKNOWN';
  }
}

// محاولة استخدام API مباشر لـ rugcheck
async function checkTokenSafetyAPI(token) {
  try {
    const options = {
      hostname: 'api.rugcheck.xyz',
      port: 443,
      path: `/v1/tokens/${token}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            if (jsonData.risk_score !== undefined) {
              const riskScore = jsonData.risk_score;
              console.log(`[${token}] API risk score: ${riskScore}`);
              if (riskScore <= 30) {
                resolve('GOOD');
              } else if (riskScore <= 69) {
                resolve('WARNING');
              } else {
                resolve('DANGER');
              }
            } else if (jsonData.status) {
              // تجربة مفاتيح أخرى محتملة
              const status = jsonData.status.toLowerCase();
              if (status.includes('safe') || status.includes('good')) {
                resolve('GOOD');
              } else if (status.includes('warning') || status.includes('medium')) {
                resolve('WARNING');
              } else if (status.includes('danger') || status.includes('high')) {
                resolve('DANGER');
              } else {
                resolve('UNKNOWN');
              }
            } else {
              resolve('UNKNOWN');
            }
          } catch (parseError) {
            console.log(`[${token}] خطأ في تحليل JSON من API: ${parseError.message}`);
            resolve('UNKNOWN');
          }
        });
      });

      req.on('error', (error) => {
        console.log(`[${token}] خطأ في طلب API: ${error.message}`);
        resolve('UNKNOWN');
      });

      req.setTimeout(10000, () => {
        console.log(`[${token}] انتهت مهلة طلب API`);
        req.abort();
        resolve('UNKNOWN');
      });

      req.end();
    });
  } catch (error) {
    console.error(`[${token}] خطأ عام في API: ${error.message}`);
    return 'UNKNOWN';
  }
}

// بديل باستخدام fetch بسيط للصفحة HTML
async function checkTokenSafetySimple(token) {
  try {
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
            const htmlContent = data.toLowerCase();
            
            // البحث عن نقاط المخاطر في HTML
            const riskScoreMatch = htmlContent.match(/(\d+)\s*\/\s*100/) || 
                                 htmlContent.match(/risk[:\s]*(\d+)/i) ||
                                 htmlContent.match(/score[:\s]*(\d+)/i);
            
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
            
            // البحث عن كلمات مفتاحية بترتيب الأولوية
            if (htmlContent.includes('high risk') || htmlContent.includes('dangerous') || 
                htmlContent.includes('scam') || htmlContent.includes('honeypot') ||
                htmlContent.includes('malicious') || htmlContent.includes('rug pull')) {
              resolve('DANGER');
            } else if (htmlContent.includes('medium risk') || htmlContent.includes('warning') ||
                      htmlContent.includes('caution') || htmlContent.includes('moderate')) {
              resolve('WARNING');
            } else if (htmlContent.includes('low risk') || htmlContent.includes('safe') ||
                      htmlContent.includes('legitimate') || htmlContent.includes('verified')) {
              resolve('GOOD');
            } else {
              resolve('UNKNOWN');
            }
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
    console.error(`[${token}] خطأ عام في HTML fetch: ${error.message}`);
    return 'UNKNOWN';
  }
}

// 3. اختياري: يمكنك أيضاً إزالة أو تعليق المتغيرات التالية المتعلقة بـ puppeteer:
// - const puppeteer = require('puppeteer');
// - let sharedBrowser = null;
// - دالة getSharedBrowser إذا كانت موجودة

// هذا التغيير سيجعل البرنامج:
// 1. أسرع بكثير (لا توجد حاجة لتشغيل متصفح)
// 2. يستهلك ذاكرة أقل
// 3. أقل تعقيداً في الصيانة
// 4. أكثر استقراراً
