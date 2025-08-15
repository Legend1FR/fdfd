#!/usr/bin/env node

/**
 * مراقب خارجي للسيرفر - يمكن تشغيله من جهاز آخر
 * هذا السكريبت يرسل ping كل فترة للتأكد من أن السيرفر لا ينام
 * يمكن تشغيله على خدمة مثل GitHub Actions أو أي VPS آخر
 */

const https = require('https');
const http = require('http');

// إعدادات المراقبة
const SERVER_URL = process.env.SERVER_URL || 'https://fdfd-i8p9.onrender.com';
const PING_INTERVAL = process.env.PING_INTERVAL || 8 * 60 * 1000; // 8 دقائق
const WEBHOOK_URL = process.env.WEBHOOK_URL || null; // Discord/Slack webhook للتنبيهات

let pingCount = 0;
let successCount = 0;
let lastResponseTime = 0;

// دالة إرسال تنبيه إلى webhook
function sendAlert(message, type = 'error') {
  if (!WEBHOOK_URL) return;

  const payload = {
    content: `🚨 **مراقب السيرفر** - ${type === 'error' ? '❌' : '✅'} ${message}`,
    timestamp: new Date().toISOString()
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = (WEBHOOK_URL.startsWith('https:') ? https : http).request(WEBHOOK_URL, options);
  req.write(JSON.stringify(payload));
  req.end();
}

// دالة ping للسيرفر
function pingServer() {
  const startTime = Date.now();
  pingCount++;
  
  console.log(`\n🔍 Ping #${pingCount} - ${new Date().toLocaleString()}`);
  console.log(`📡 Target: ${SERVER_URL}/health`);
  
  const request = SERVER_URL.startsWith('https:') ? https : http;
  
  const options = {
    hostname: SERVER_URL.replace(/^https?:\/\//, ''),
    path: '/health',
    method: 'GET',
    headers: {
      'User-Agent': 'External-Monitor/1.0',
      'Accept': 'application/json'
    },
    timeout: 30000
  };

  const req = request.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const responseTime = Date.now() - startTime;
      lastResponseTime = responseTime;
      
      if (res.statusCode === 200) {
        successCount++;
        console.log(`✅ Ping #${pingCount} successful`);
        console.log(`⏱️  Response time: ${responseTime}ms`);
        console.log(`📊 Success rate: ${((successCount / pingCount) * 100).toFixed(1)}% (${successCount}/${pingCount})`);
        
        try {
          const healthData = JSON.parse(data);
          console.log(`🕒 Server uptime: ${healthData.uptime}`);
          console.log(`📈 Tracked tokens: ${healthData.trackedTokens}`);
          console.log(`💾 Memory usage: ${Math.round(healthData.memoryUsage.heapUsed / 1024 / 1024)}MB`);
          
          if (healthData.keepAlive) {
            console.log(`🔄 Keep-alive: ${healthData.keepAlive.attempts} attempts, ${healthData.keepAlive.successRate} success rate`);
          }
        } catch (e) {
          console.log(`📄 Response received but couldn't parse JSON`);
        }
        
        // إرسال تنبيه عند العودة للعمل بعد خطأ
        if (pingCount > 1 && successCount === 1) {
          sendAlert(`السيرفر عاد للعمل بعد ${pingCount - 1} محاولة فاشلة`, 'success');
        }
      } else {
        console.log(`❌ Ping #${pingCount} failed with status: ${res.statusCode}`);
        console.log(`📊 Success rate: ${((successCount / pingCount) * 100).toFixed(1)}% (${successCount}/${pingCount})`);
        
        if (pingCount % 5 === 0) {
          sendAlert(`السيرفر لا يستجيب - Status: ${res.statusCode} - Success rate: ${((successCount / pingCount) * 100).toFixed(1)}%`);
        }
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Ping #${pingCount} failed: ${error.message}`);
    console.log(`📊 Success rate: ${((successCount / pingCount) * 100).toFixed(1)}% (${successCount}/${pingCount})`);
    
    if (pingCount % 5 === 0) {
      sendAlert(`خطأ في الاتصال بالسيرفر: ${error.message} - Success rate: ${((successCount / pingCount) * 100).toFixed(1)}%`);
    }
  });

  req.on('timeout', () => {
    console.log(`⏰ Ping #${pingCount} timed out`);
    console.log(`📊 Success rate: ${((successCount / pingCount) * 100).toFixed(1)}% (${successCount}/${pingCount})`);
    req.destroy();
    
    if (pingCount % 3 === 0) {
      sendAlert(`السيرفر لا يستجيب (Timeout) - Success rate: ${((successCount / pingCount) * 100).toFixed(1)}%`);
    }
  });

  req.setTimeout(30000);
  req.end();
}

// دالة عرض إحصائيات
function showStats() {
  console.log('\n' + '='.repeat(60));
  console.log(`📊 إحصائيات المراقبة`);
  console.log(`🕒 وقت البدء: ${startTime.toLocaleString()}`);
  console.log(`🔢 عدد المحاولات: ${pingCount}`);
  console.log(`✅ النجح: ${successCount}`);
  console.log(`❌ الفاشل: ${pingCount - successCount}`);
  console.log(`📈 معدل النجاح: ${pingCount > 0 ? ((successCount / pingCount) * 100).toFixed(1) : 0}%`);
  console.log(`⏱️  آخر زمن استجابة: ${lastResponseTime}ms`);
  console.log(`⏰ التحديث التالي خلال: ${Math.round(PING_INTERVAL / 1000 / 60)} دقيقة`);
  console.log('='.repeat(60));
}

// بدء المراقبة
const startTime = new Date();
console.log(`🚀 بدء مراقبة السيرفر: ${SERVER_URL}`);
console.log(`⏰ فترة المراقبة: كل ${Math.round(PING_INTERVAL / 1000 / 60)} دقيقة`);
console.log(`📡 Webhook للتنبيهات: ${WEBHOOK_URL ? 'مفعل' : 'غير مفعل'}`);

// إرسال ping فوري
pingServer();

// جدولة ping دوري
setInterval(pingServer, PING_INTERVAL);

// عرض إحصائيات كل 30 دقيقة
setInterval(showStats, 30 * 60 * 1000);

// التعامل مع إيقاف البرنامج
process.on('SIGINT', () => {
  console.log('\n🛑 إيقاف المراقب...');
  showStats();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 إيقاف المراقب...');
  showStats();
  process.exit(0);
});

// رسالة بدء للتنبيهات
if (WEBHOOK_URL) {
  sendAlert(`بدء مراقبة السيرفر ${SERVER_URL} - فترة المراقبة: ${Math.round(PING_INTERVAL / 1000 / 60)} دقيقة`, 'success');
}
