/**
 * اختبار محسن لتوكن محدد باستخدام النظام الجديد
 * تشغيل: node test_specific_token.js
 */

const https = require('https');
const cheerio = require('cheerio');

// نسخ الدوال المحسنة من server.js للاختبار
async function testTokenWithAllMethods(token) {
  console.log(`\n🧪 اختبار شامل للتوكن: ${token}`);
  console.log('='.repeat(80));
  
  const results = [];
  
  // 1. اختبار API مباشر
  console.log('\n1️⃣ اختبار API مباشر...');
  const apiResult = await testAPI(token);
  if (apiResult !== 'UNKNOWN') {
    results.push({ method: 'API', result: apiResult });
    console.log(`✅ نتيجة API: ${apiResult}`);
  } else {
    console.log(`❌ API: لم يتم العثور على نتيجة`);
  }
  
  // 2. اختبار Cheerio
  console.log('\n2️⃣ اختبار Cheerio...');
  const cheerioResult = await testCheerio(token);
  if (cheerioResult !== 'UNKNOWN') {
    results.push({ method: 'Cheerio', result: cheerioResult });
    console.log(`✅ نتيجة Cheerio: ${cheerioResult}`);
  } else {
    console.log(`❌ Cheerio: لم يتم العثور على نتيجة`);
  }
  
  // 3. اختبار الفحص المباشر
  console.log('\n3️⃣ اختبار الفحص المباشر...');
  const directResult = await testDirect(token);
  if (directResult !== 'UNKNOWN') {
    results.push({ method: 'Direct', result: directResult });
    console.log(`✅ نتيجة الفحص المباشر: ${directResult}`);
  } else {
    console.log(`❌ الفحص المباشر: لم يتم العثور على نتيجة`);
  }
  
  // 4. اختبار HTML البسيط
  console.log('\n4️⃣ اختبار HTML البسيط...');
  const htmlResult = await testHTML(token);
  if (htmlResult !== 'UNKNOWN') {
    results.push({ method: 'HTML', result: htmlResult });
    console.log(`✅ نتيجة HTML البسيط: ${htmlResult}`);
  } else {
    console.log(`❌ HTML البسيط: لم يتم العثور على نتيجة`);
  }
  
  // 5. تحليل النتائج
  console.log('\n📊 تحليل النتائج النهائي...');
  const finalResult = analyzeResults(token, results);
  
  console.log('\n' + '='.repeat(80));
  console.log(`🎯 القرار النهائي: ${finalResult.decision}`);
  console.log(`📈 مستوى الثقة: ${finalResult.confidence}%`);
  console.log(`📋 النتائج المجمعة:`);
  results.forEach(r => {
    console.log(`   - ${r.method}: ${r.result}`);
  });
  
  return finalResult;
}

// دالة تحليل النتائج (نسخة محسنة من server.js)
function analyzeResults(token, results) {
  if (results.length === 0) {
    return { decision: 'UNKNOWN', confidence: 0 };
  }
  
  const scores = { GOOD: 0, WARNING: 0, DANGER: 0 };
  const weights = { 'API': 4, 'Cheerio': 3, 'Direct': 2, 'HTML': 1 };
  
  results.forEach(r => {
    const weight = weights[r.method] || 1;
    scores[r.result] += weight;
  });
  
  console.log(`📊 نقاط التحليل: GOOD=${scores.GOOD}, WARNING=${scores.WARNING}, DANGER=${scores.DANGER}`);
  
  const maxScore = Math.max(scores.GOOD, scores.WARNING, scores.DANGER);
  const totalScore = scores.GOOD + scores.WARNING + scores.DANGER;
  
  let decision = 'UNKNOWN';
  if (scores.GOOD === maxScore) decision = 'GOOD';
  else if (scores.WARNING === maxScore) decision = 'WARNING';  
  else if (scores.DANGER === maxScore) decision = 'DANGER';
  
  const confidence = Math.round((maxScore / totalScore) * 100);
  
  console.log(`🔍 التحليل الأولي: قرار=${decision}, ثقة=${confidence}%`);
  
  // قواعد إضافية للأمان - تتطلب تأكيد من مصدرين للخطر
  if (decision === 'DANGER') {
    const dangerCount = results.filter(r => r.result === 'DANGER').length;
    const totalMethods = results.length;
    
    console.log(`🔎 فحص DANGER: تأكيدات=${dangerCount}/${totalMethods}, ثقة=${confidence}%`);
    
    // يجب أن يكون هناك تأكيد من مصدرين على الأقل أو ثقة عالية جداً
    if (dangerCount < 2) {
      console.log(`⚠️ تخفيف تقييم DANGER - تأكيدات قليلة (${dangerCount}/${totalMethods})`);
      
      // إذا كان HTML البسيط هو المصدر الوحيد، قلل التقييم
      const htmlOnlyDanger = results.length === 1 && results[0].method === 'HTML';
      console.log(`🔍 HTML فقط؟ ${htmlOnlyDanger}`);
      
      if (htmlOnlyDanger) {
        console.log(`🤔 HTML البسيط فقط يشير للخطر - تغيير إلى WARNING للمراجعة اليدوية`);
        decision = 'WARNING';
      } else if (dangerCount === 1 && totalMethods < 3) {
        console.log(`📉 مصدر واحد فقط من ${totalMethods} - تغيير إلى WARNING`);
        decision = 'WARNING';
      }
    }
  }
  
  return { decision, confidence };
}

// اختبار API
async function testAPI(token) {
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
              console.log(`📊 نقاط المخاطر من API: ${riskScore}`);
              if (riskScore <= 30) resolve('GOOD');
              else if (riskScore <= 69) resolve('WARNING');
              else resolve('DANGER');
            } else {
              resolve('UNKNOWN');
            }
          } catch (parseError) {
            console.log(`❌ خطأ في تحليل JSON من API: ${parseError.message}`);
            resolve('UNKNOWN');
          }
        });
      });

      req.on('error', (error) => {
        console.log(`❌ خطأ في طلب API: ${error.message}`);
        resolve('UNKNOWN');
      });

      req.setTimeout(10000, () => {
        console.log(`⏰ انتهت مهلة طلب API`);
        req.abort();
        resolve('UNKNOWN');
      });

      req.end();
    });
  } catch (error) {
    return 'UNKNOWN';
  }
}

// اختبار Cheerio
async function testCheerio(token) {
  try {
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
            const $ = cheerio.load(data);
            let riskScore = null;
            
            // البحث عن نقاط المخاطر
            const bodyText = $('body').text();
            const scoreMatch = bodyText.match(/(\d+)\s*\/\s*100/) || 
                             bodyText.match(/risk[:\s]*(\d+)/i) ||
                             bodyText.match(/score[:\s]*(\d+)/i);
            
            if (scoreMatch) {
              riskScore = parseInt(scoreMatch[1]);
              console.log(`📊 نقاط من Cheerio: ${riskScore}/100`);
              
              if (riskScore <= 25) resolve('GOOD');
              else if (riskScore <= 60) resolve('WARNING');
              else resolve('DANGER');
              return;
            }
            
            // البحث في الكلمات المفتاحية
            const pageText = $('body').text().toLowerCase();
            console.log(`📄 حجم النص: ${pageText.length} حرف`);
            
            const indicators = {
              danger: ['high risk', 'dangerous', 'scam', 'honeypot', 'rug pull', 'avoid'],
              safe: ['low risk', 'safe', 'verified', 'legitimate', 'good', 'secure'],
              warning: ['medium risk', 'moderate', 'careful', 'attention']
            };
            
            let foundDanger = [];
            let foundSafe = [];
            let foundWarning = [];
            
            indicators.danger.forEach(keyword => {
              if (pageText.includes(keyword)) foundDanger.push(keyword);
            });
            
            indicators.safe.forEach(keyword => {
              if (pageText.includes(keyword)) foundSafe.push(keyword);
            });
            
            indicators.warning.forEach(keyword => {
              if (pageText.includes(keyword)) foundWarning.push(keyword);
            });
            
            console.log(`🔍 مؤشرات: خطر=${foundDanger.length}, تحذير=${foundWarning.length}, أمان=${foundSafe.length}`);
            
            if (foundDanger.length > 0) {
              console.log(`⚠️ كلمات خطيرة: ${foundDanger.join(', ')}`);
              if (foundSafe.length > foundDanger.length) {
                console.log(`🤔 مؤشرات متضاربة - تخفيف إلى WARNING`);
                resolve('WARNING');
              } else {
                resolve('DANGER');
              }
              return;
            }
            
            if (foundWarning.length > 0) {
              console.log(`⚠️ كلمات تحذيرية: ${foundWarning.join(', ')}`);
              resolve('WARNING');
              return;
            }
            
            if (foundSafe.length > 0) {
              console.log(`✅ كلمات آمنة: ${foundSafe.join(', ')}`);
              resolve('GOOD');
              return;
            }
            
            resolve('UNKNOWN');
            
          } catch (parseError) {
            console.log(`❌ خطأ في Cheerio: ${parseError.message}`);
            resolve('UNKNOWN');
          }
        });
      });

      req.on('error', (error) => {
        console.log(`❌ خطأ في Cheerio: ${error.message}`);
        resolve('UNKNOWN');
      });

      req.setTimeout(10000, () => {
        console.log(`⏰ انتهت مهلة Cheerio`);
        req.abort();
        resolve('UNKNOWN');
      });

      req.end();
    });
  } catch (error) {
    return 'UNKNOWN';
  }
}

// اختبار الفحص المباشر
async function testDirect(token) {
  try {
    const endpoints = [
      `https://rugcheck.xyz/tokens/${token}/report`,
      `https://rugcheck.xyz/api/v1/tokens/${token}/summary`,
      `https://api.rugcheck.xyz/tokens/${token}/status`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 جاري فحص: ${endpoint}`);
        const url = new URL(endpoint);
        const options = {
          hostname: url.hostname,
          port: 443,
          path: url.pathname,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/html, */*',
          }
        };

        const result = await new Promise((resolve) => {
          const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              try {
                if (res.headers['content-type']?.includes('application/json')) {
                  const jsonData = JSON.parse(data);
                  if (jsonData.risk_score !== undefined || jsonData.score !== undefined) {
                    const score = jsonData.risk_score || jsonData.score;
                    console.log(`📊 نقاط من ${endpoint}: ${score}`);
                    if (score <= 25) resolve('GOOD');
                    else if (score <= 60) resolve('WARNING');
                    else resolve('DANGER');
                    return;
                  }
                }
                
                const $ = cheerio.load(data);
                const text = $('body').text().toLowerCase();
                const scoreMath = text.match(/(\d+)\/100/) || text.match(/score:\s*(\d+)/i);
                if (scoreMath) {
                  const score = parseInt(scoreMath[1]);
                  console.log(`📊 نقاط من HTML ${endpoint}: ${score}`);
                  if (score <= 25) resolve('GOOD');
                  else if (score <= 60) resolve('WARNING');
                  else resolve('DANGER');
                  return;
                }
                
                resolve('UNKNOWN');
              } catch (parseError) {
                resolve('UNKNOWN');
              }
            });
          });

          req.on('error', () => resolve('UNKNOWN'));
          req.setTimeout(8000, () => {
            req.abort();
            resolve('UNKNOWN');
          });

          req.end();
        });

        if (result !== 'UNKNOWN') {
          console.log(`✅ نتيجة من ${endpoint}: ${result}`);
          return result;
        }
      } catch (endpointError) {
        console.log(`❌ خطأ في ${endpoint}: ${endpointError.message}`);
        continue;
      }
    }
    
    return 'UNKNOWN';
  } catch (error) {
    return 'UNKNOWN';
  }
}

// اختبار HTML البسيط
async function testHTML(token) {
  try {
    const options = {
      hostname: 'rugcheck.xyz',
      port: 443,
      path: `/tokens/${token}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const htmlContent = data.toLowerCase();
            
            const riskScoreMatch = htmlContent.match(/(\d+)\s*\/\s*100/) || 
                                 htmlContent.match(/risk[:\s]*(\d+)/i);
            
            if (riskScoreMatch) {
              const riskScore = parseInt(riskScoreMatch[1]);
              console.log(`📊 نقاط من HTML البسيط: ${riskScore}`);
              
              if (riskScore <= 30) resolve('GOOD');
              else if (riskScore <= 69) resolve('WARNING');
              else resolve('DANGER');
            } else {
              if (htmlContent.includes('high risk') || htmlContent.includes('dangerous') || 
                  htmlContent.includes('scam') || htmlContent.includes('honeypot')) {
                console.log(`⚠️ كلمات خطيرة في HTML البسيط`);
                resolve('DANGER');
              } else if (htmlContent.includes('medium risk') || htmlContent.includes('warning')) {
                console.log(`⚠️ كلمات تحذيرية في HTML البسيط`);
                resolve('WARNING');
              } else if (htmlContent.includes('low risk') || htmlContent.includes('safe')) {
                console.log(`✅ كلمات آمنة في HTML البسيط`);
                resolve('GOOD');
              } else {
                resolve('UNKNOWN');
              }
            }
          } catch (parseError) {
            resolve('UNKNOWN');
          }
        });
      });

      req.on('error', () => resolve('UNKNOWN'));
      req.setTimeout(10000, () => {
        req.abort();
        resolve('UNKNOWN');
      });

      req.end();
    });
  } catch (error) {
    return 'UNKNOWN';
  }
}

// تشغيل الاختبار
async function runTest() {
  // التوكن المحدد للاختبار
  const testToken = 'CWX6t6pGJ1zsnuywnyd2ZMZJ7inB2sWuPdsteoT6pump';
  
  console.log('🔬 بدء الاختبار الشامل للنظام المحسن');
  console.log('=' .repeat(80));
  
  const result = await testTokenWithAllMethods(testToken);
  
  console.log('\n🎯 خلاصة الاختبار:');
  console.log(`التوكن: ${testToken}`);
  console.log(`القرار: ${result.decision}`);
  console.log(`الثقة: ${result.confidence}%`);
  
  if (result.decision === 'DANGER' && result.confidence < 80) {
    console.log('\n⚠️ تحذير: قرار DANGER بثقة منخفضة - يُنصح بالمراجعة اليدوية');
  }
  
  console.log('\n✅ انتهى الاختبار');
}

// تشغيل الاختبار إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runTest().catch(error => {
    console.error('❌ خطأ في تشغيل الاختبار:', error);
  });
}

module.exports = { testTokenWithAllMethods };
