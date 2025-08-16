/**
 * نظام Keep Alive لمنع دخول الخدمة في وضع النوم على Render
 * يرسل طلبات دورية للخدمة للحفاظ على النشاط
 */

const https = require('https');
const http = require('http');

class KeepAliveService {
  constructor(options = {}) {
    this.url = options.url || process.env.RENDER_EXTERNAL_URL || 'http://localhost:10000';
    this.interval = options.interval || 10 * 60 * 1000; // 10 دقائق افتراضياً
    this.endpoint = options.endpoint || '/ping';
    this.isRunning = false;
    this.intervalId = null;
    this.lastPingTime = null;
    this.successCount = 0;
    this.errorCount = 0;
    
    console.log(`🔄 Keep Alive Service initialized`);
    console.log(`📍 Target URL: ${this.url}${this.endpoint}`);
    console.log(`⏰ Ping interval: ${this.interval / 1000} seconds`);
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Keep Alive Service is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Keep Alive Service...');
    
    // ping فوري عند البدء
    this.ping();
    
    // ping دوري
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.interval);
    
    console.log('✅ Keep Alive Service started successfully');
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Keep Alive Service is not running');
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 Keep Alive Service stopped');
    this.printStats();
  }

  ping() {
    const startTime = Date.now();
    this.lastPingTime = new Date();
    
    console.log(`🏓 Sending keep-alive ping at ${this.lastPingTime.toLocaleString('ar-SA')}...`);
    
    const isHttps = this.url.startsWith('https');
    const requestModule = isHttps ? https : http;
    
    try {
      const parsedUrl = new URL(this.url + this.endpoint);
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname,
        method: 'GET',
        timeout: 30000, // 30 ثانية timeout
        headers: {
          'User-Agent': 'KeepAlive/1.0',
          'Accept': 'text/plain',
          'Connection': 'close'
        }
      };

      const req = requestModule.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          this.successCount++;
          
          console.log(`✅ Keep-alive ping successful`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response: ${data.trim()}`);
          console.log(`   Duration: ${duration}ms`);
          console.log(`   Success rate: ${this.successCount}/${this.successCount + this.errorCount}`);
        });
      });

      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        this.errorCount++;
        
        console.error(`❌ Keep-alive ping failed`);
        console.error(`   Error: ${error.message}`);
        console.error(`   Duration: ${duration}ms`);
        console.error(`   Success rate: ${this.successCount}/${this.successCount + this.errorCount}`);
      });

      req.on('timeout', () => {
        req.destroy();
        this.errorCount++;
        console.error(`⏰ Keep-alive ping timeout (30s)`);
      });

      req.end();
      
    } catch (error) {
      this.errorCount++;
      console.error(`❌ Keep-alive ping setup failed: ${error.message}`);
    }
  }

  printStats() {
    const total = this.successCount + this.errorCount;
    const successRate = total > 0 ? ((this.successCount / total) * 100).toFixed(1) : '0';
    
    console.log(`📊 Keep Alive Service Statistics:`);
    console.log(`   Total pings: ${total}`);
    console.log(`   Successful: ${this.successCount}`);
    console.log(`   Failed: ${this.errorCount}`);
    console.log(`   Success rate: ${successRate}%`);
    console.log(`   Last ping: ${this.lastPingTime ? this.lastPingTime.toLocaleString('ar-SA') : 'Never'}`);
  }

  getStatus() {
    const total = this.successCount + this.errorCount;
    const successRate = total > 0 ? ((this.successCount / total) * 100).toFixed(1) : '0';
    
    return {
      isRunning: this.isRunning,
      url: this.url + this.endpoint,
      interval: this.interval,
      lastPingTime: this.lastPingTime,
      totalPings: total,
      successfulPings: this.successCount,
      failedPings: this.errorCount,
      successRate: `${successRate}%`
    };
  }
}

module.exports = KeepAliveService;
