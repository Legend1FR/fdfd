/**
 * محاكاة اختبار يدوي لموقع rugcheck
 * يفتح الموقع ويتحقق من النتيجة المرئية
 */

const https = require('https');

// محاكاة طلب AJAX كما يفعل الموقع
async function simulateManualCheck(token) {
  console.log(`🌐 محاكاة الفحص اليدوي للتوكن: ${token}`);
  
  // جرب endpoints مختلفة قد يستخدمها الموقع
  const endpoints = [
    // API endpoints محتملة
    `https://api.rugcheck.xyz/v1/tokens/${token}/report`,
    `https://api.rugcheck.xyz/tokens/${token}/analysis`,
    `https://rugcheck.xyz/api/tokens/${token}`,
    `https://rugcheck.xyz/api/v1/check/${token}`,
    
    // WebSocket أو Server-sent events
    `https://rugcheck.xyz/api/live/${token}`,
    
    // Static endpoints
    `https://rugcheck.xyz/tokens/${token}.json`,
    `https://rugcheck.xyz/data/${token}`,
    
    // Third-party integrations
    `https://api.rugcheck.xyz/public/token/${token}`,
    `https://rugcheck.xyz/check?token=${token}`,
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 محاولة: ${endpoint}`);
      
      const result = await makeRequest(endpoint, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `https://rugcheck.xyz/tokens/${token}`,
        'Origin': 'https://rugcheck.xyz',
        'X-Requested-With': 'XMLHttpRequest'
      });
      
      if (result && result.data) {
        console.log(`✅ استجابة من ${endpoint}:`);
        console.log(`📄 نوع المحتوى: ${result.contentType}`);
        console.log(`📊 حجم البيانات: ${result.data.length} بايت`);
        
        // تحليل البيانات
        const analysis = analyzeResponse(result.data, result.contentType);
        if (analysis.found) {
          console.log(`🎯 نتيجة: ${analysis.result}`);
          console.log(`📝 التفاصيل: ${analysis.details}`);
          return analysis.result;
        }
      }
      
    } catch (error) {
      console.log(`❌ فشل: ${error.message}`);
    }
  }
  
  console.log('\n🤔 لم يتم العثور على بيانات من أي endpoint');
  return 'UNKNOWN';
}

// دالة طلب HTTP محسنة
function makeRequest(url, headers = {}) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const contentType = res.headers['content-type'] || '';
          console.log(`📡 استجابة: ${res.statusCode} - ${contentType}`);
          
          if (res.statusCode === 200 && data.length > 0) {
            resolve({
              data,
              contentType,
              statusCode: res.statusCode,
              headers: res.headers
            });
          } else {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.setTimeout(10000, () => {
        req.abort();
        resolve(null);
      });

      req.end();
    } catch (error) {
      resolve(null);
    }
  });
}

// تحليل الاستجابة
function analyzeResponse(data, contentType) {
  try {
    // JSON response
    if (contentType.includes('application/json')) {
      const json = JSON.parse(data);
      console.log(`🔍 JSON تحليل:`, JSON.stringify(json, null, 2));
      
      // البحث عن حقول مختلفة
      const fields = ['risk_score', 'score', 'rating', 'status', 'safety', 'result'];
      for (const field of fields) {
        if (json[field] !== undefined) {
          console.log(`📊 وُجد ${field}: ${json[field]}`);
          
          if (typeof json[field] === 'number') {
            if (json[field] <= 30) return { found: true, result: 'GOOD', details: `${field}: ${json[field]}` };
            else if (json[field] <= 70) return { found: true, result: 'WARNING', details: `${field}: ${json[field]}` };
            else return { found: true, result: 'DANGER', details: `${field}: ${json[field]}` };
          }
          
          if (typeof json[field] === 'string') {
            const value = json[field].toLowerCase();
            if (value.includes('good') || value.includes('safe') || value.includes('low')) {
              return { found: true, result: 'GOOD', details: `${field}: ${json[field]}` };
            }
            if (value.includes('danger') || value.includes('high') || value.includes('scam')) {
              return { found: true, result: 'DANGER', details: `${field}: ${json[field]}` };
            }
            if (value.includes('warning') || value.includes('medium')) {
              return { found: true, result: 'WARNING', details: `${field}: ${json[field]}` };
            }
          }
        }
      }
    }
    
    // HTML response
    if (contentType.includes('text/html')) {
      const lowerData = data.toLowerCase();
      console.log(`📄 HTML تحليل (${data.length} حرف)`);
      
      // ابحث عن مؤشرات إيجابية أولاً
      const goodIndicators = [
        'color: green', 'color:#00', 'class="good"', 'class="safe"',
        'style="color: green"', 'text-success', 'alert-success'
      ];
      
      const badIndicators = [
        'color: red', 'color:#ff', 'class="danger"', 'class="bad"',
        'style="color: red"', 'text-danger', 'alert-danger'
      ];
      
      let goodCount = 0;
      let badCount = 0;
      
      goodIndicators.forEach(indicator => {
        if (lowerData.includes(indicator)) {
          goodCount++;
          console.log(`🟢 مؤشر إيجابي: ${indicator}`);
        }
      });
      
      badIndicators.forEach(indicator => {
        if (lowerData.includes(indicator)) {
          badCount++;
          console.log(`🔴 مؤشر سلبي: ${indicator}`);
        }
      });
      
      if (goodCount > badCount) {
        return { found: true, result: 'GOOD', details: `مؤشرات إيجابية: ${goodCount}, سلبية: ${badCount}` };
      } else if (badCount > goodCount) {
        return { found: true, result: 'DANGER', details: `مؤشرات سلبية: ${badCount}, إيجابية: ${goodCount}` };
      }
    }
    
    // Plain text response
    if (contentType.includes('text/plain')) {
      console.log(`📝 نص خام:`, data);
      const lowerData = data.toLowerCase();
      
      if (lowerData.includes('good') || lowerData.includes('safe')) {
        return { found: true, result: 'GOOD', details: 'نص يحتوي على كلمات إيجابية' };
      }
      if (lowerData.includes('danger') || lowerData.includes('scam')) {
        return { found: true, result: 'DANGER', details: 'نص يحتوي على كلمات سلبية' };
      }
    }
    
  } catch (error) {
    console.log(`❌ خطأ في التحليل: ${error.message}`);
  }
  
  return { found: false };
}

// تشغيل المحاكاة
async function runSimulation() {
  const token = 'CWX6t6pGJ1zsnuywnyd2ZMZJ7inB2sWuPdsteoT6pump';
  
  console.log('🎭 بدء محاكاة الفحص اليدوي');
  console.log('=' .repeat(60));
  
  const result = await simulateManualCheck(token);
  
  console.log('\n🎯 النتيجة النهائية من المحاكاة:');
  console.log(`التوكن: ${token}`);
  console.log(`النتيجة: ${result}`);
  
  if (result === 'GOOD') {
    console.log('✅ التوكن يبدو آمناً حسب المحاكاة');
  } else if (result === 'DANGER') {
    console.log('❌ التوكن يبدو خطيراً حسب المحاكاة');
  } else {
    console.log('❓ لم يتم العثور على نتيجة واضحة');
  }
}

if (require.main === module) {
  runSimulation().catch(console.error);
}

module.exports = { simulateManualCheck };
