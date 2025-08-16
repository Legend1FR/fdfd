// اختبار سريع للتحسينات المطبقة على نظام جلب الأسعار
const https = require('https');
const zlib = require('zlib');

// نظام إدارة الطلبات (مبسط للاختبار)
class TestRequestManager {
  constructor() {
    this.lastRequestTime = 0;
    this.minDelay = 3000; // 3 ثوانٍ بين الطلبات
  }
  
  async makeRequest(requestFn) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest;
      console.log(`⏳ انتظار ${waitTime}ms لتجنب Rate Limiting...`);
      await new Promise(r => setTimeout(r, waitTime));
    }
    
    try {
      const result = await requestFn();
      this.lastRequestTime = Date.now();
      return result;
    } catch (error) {
      this.lastRequestTime = Date.now();
      throw error;
    }
  }
}

const requestManager = new TestRequestManager();

// دالة اختبار محسنة لجلب سعر التوكن
async function testTokenPrice(token) {
  console.log(`🔍 اختبار جلب سعر التوكن: ${token}`);
  
  return await requestManager.makeRequest(async () => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.dexscreener.com',
        port: 443,
        path: `/latest/dex/tokens/${token}`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            // التحقق من Status Code
            if (res.statusCode !== 200) {
              console.log(`❌ HTTP Error: ${res.statusCode}`);
              resolve({ success: false, error: `HTTP ${res.statusCode}` });
              return;
            }
            
            // التحقق من نوع المحتوى
            const contentType = res.headers['content-type'] || '';
            if (!contentType.includes('application/json')) {
              console.log(`❌ خطأ: الاستجابة ليست JSON (${contentType})`);
              const preview = data.substring(0, 200);
              console.log(`معاينة الاستجابة: ${preview}...`);
              resolve({ success: false, error: 'Non-JSON response' });
              return;
            }
            
            // التحقق من أخطاء Cloudflare
            if (data.includes('error code: 1015') || data.includes('Cloudflare')) {
              console.log(`❌ خطأ Cloudflare: Rate limiting detected`);
              resolve({ success: false, error: 'Cloudflare rate limit' });
              return;
            }
            
            const jsonData = JSON.parse(data);
            if (jsonData.pairs && jsonData.pairs.length > 0) {
              const price = parseFloat(jsonData.pairs[0].priceUsd);
              console.log(`✅ نجح الحصول على السعر: $${price}`);
              resolve({ success: true, price: price });
            } else {
              console.log(`⚠️ لا توجد بيانات أسعار متاحة`);
              resolve({ success: false, error: 'No price data' });
            }
          } catch (parseError) {
            console.log(`❌ خطأ في تحليل JSON: ${parseError.message}`);
            const preview = data.substring(0, 100);
            console.log(`بيانات خام: ${preview}...`);
            resolve({ success: false, error: parseError.message });
          }
        });
      });

      req.on('error', (error) => {
        console.log(`❌ خطأ في الشبكة: ${error.message}`);
        resolve({ success: false, error: error.message });
      });

      req.setTimeout(15000, () => {
        console.log(`⏰ انتهت المهلة الزمنية`);
        req.abort();
        resolve({ success: false, error: 'Timeout' });
      });

      req.end();
    });
  });
}

// اختبار النظام
async function runTest() {
  console.log('🚀 بدء اختبار النظام المحسن...\n');
  
  // توكن الاختبار (نفس التوكن من السجلات)
  const testToken = '8SFpQ1kRbfjbmpnhKzzgd6GA9PZwhiAMQywZh75Dpump';
  
  // اختبار 3 طلبات متتالية لرؤية كيفية عمل Rate Limiting
  for (let i = 1; i <= 3; i++) {
    console.log(`--- الاختبار ${i}/3 ---`);
    const startTime = Date.now();
    
    const result = await testTokenPrice(testToken);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ مدة الطلب: ${duration}ms`);
    
    if (result.success) {
      console.log(`✅ الاختبار ${i}: نجح`);
    } else {
      console.log(`❌ الاختبار ${i}: فشل - ${result.error}`);
    }
    
    console.log(''); // سطر فارغ
  }
  
  console.log('🏁 انتهى الاختبار');
}

// تشغيل الاختبار
runTest().catch(console.error);
