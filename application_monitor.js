/**
 * نظام مراقبة التطبيق لضمان الاستمرارية
 * Application Monitor for Continuous Operation
 */

const fs = require('fs');
const { spawn } = require('child_process');

class ApplicationMonitor {
  constructor(options = {}) {
    this.scriptPath = options.scriptPath || 'server.js';
    this.restartDelay = options.restartDelay || 5000; // 5 ثواني
    this.maxRestarts = options.maxRestarts || 10;
    this.restartWindow = options.restartWindow || 60000; // دقيقة واحدة
    this.heartbeatTimeout = options.heartbeatTimeout || 120000; // دقيقتان
    this.logFile = options.logFile || 'monitor.log';
    
    this.process = null;
    this.restartCount = 0;
    this.lastRestartTime = 0;
    this.isRunning = false;
    this.restartHistory = [];
    this.monitorInterval = null;
    
    console.log('🔍 Application Monitor initialized');
  }

  /**
   * بدء مراقبة التطبيق
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Application Monitor is already running');
      return;
    }

    this.isRunning = true;
    this.log('🚀 Starting Application Monitor...');
    
    // بدء التطبيق
    this.startApplication();
    
    // مراقبة دورية
    this.monitorInterval = setInterval(() => {
      this.checkApplicationHealth();
    }, 30000); // كل 30 ثانية
    
    console.log('✅ Application Monitor started');
  }

  /**
   * إيقاف مراقبة التطبيق
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Application Monitor is not running');
      return;
    }

    this.isRunning = false;
    this.log('🛑 Stopping Application Monitor...');
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
    
    console.log('🛑 Application Monitor stopped');
  }

  /**
   * بدء تشغيل التطبيق
   */
  startApplication() {
    this.log(`🚀 Starting application: ${this.scriptPath}`);
    
    this.process = spawn('node', [this.scriptPath], {
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: process.env
    });

    // معالجة مخرجات التطبيق
    this.process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`[APP] ${output}`);
      this.log(`[APP] ${output}`);
    });

    this.process.stderr.on('data', (data) => {
      const error = data.toString().trim();
      console.error(`[APP ERROR] ${error}`);
      this.log(`[APP ERROR] ${error}`);
    });

    // معالجة إنهاء التطبيق
    this.process.on('exit', (code, signal) => {
      const message = `Application exited with code ${code} and signal ${signal}`;
      console.log(`❌ ${message}`);
      this.log(`❌ ${message}`);
      
      this.process = null;
      
      if (this.isRunning) {
        this.handleApplicationCrash();
      }
    });

    this.process.on('error', (error) => {
      const message = `Application error: ${error.message}`;
      console.error(`❌ ${message}`);
      this.log(`❌ ${message}`);
      
      if (this.isRunning) {
        this.handleApplicationCrash();
      }
    });

    console.log(`✅ Application started with PID: ${this.process.pid}`);
    this.log(`✅ Application started with PID: ${this.process.pid}`);
  }

  /**
   * معالجة تعطل التطبيق
   */
  handleApplicationCrash() {
    const now = Date.now();
    
    // تسجيل وقت إعادة التشغيل
    this.restartHistory.push(now);
    
    // تنظيف سجل إعادة التشغيل (الاحتفاظ بآخر ساعة فقط)
    this.restartHistory = this.restartHistory.filter(
      time => now - time < this.restartWindow
    );
    
    // فحص عدد إعادات التشغيل في النافذة الزمنية
    if (this.restartHistory.length >= this.maxRestarts) {
      const message = `Too many restarts (${this.maxRestarts}) in ${this.restartWindow / 1000} seconds. Stopping monitor.`;
      console.error(`❌ ${message}`);
      this.log(`❌ ${message}`);
      this.stop();
      return;
    }
    
    this.restartCount++;
    const message = `Application crashed. Attempting restart ${this.restartCount} in ${this.restartDelay / 1000} seconds...`;
    console.log(`🔄 ${message}`);
    this.log(`🔄 ${message}`);
    
    // إعادة تشغيل بعد تأخير
    setTimeout(() => {
      if (this.isRunning) {
        this.startApplication();
      }
    }, this.restartDelay);
  }

  /**
   * فحص صحة التطبيق
   */
  checkApplicationHealth() {
    if (!this.isRunning) return;
    
    // فحص وجود العملية
    if (!this.process || this.process.killed) {
      this.log('⚠️ Application process not found - attempting restart');
      this.handleApplicationCrash();
      return;
    }
    
    // فحص heartbeat
    this.checkHeartbeat();
  }

  /**
   * فحص heartbeat
   */
  checkHeartbeat() {
    try {
      if (!fs.existsSync('heartbeat.json')) {
        this.log('⚠️ Heartbeat file not found');
        return;
      }
      
      const heartbeatData = JSON.parse(fs.readFileSync('heartbeat.json', 'utf8'));
      const lastHeartbeat = new Date(heartbeatData.timestamp);
      const now = new Date();
      const timeDiff = now - lastHeartbeat;
      
      if (timeDiff > this.heartbeatTimeout) {
        const message = `Heartbeat timeout (${timeDiff / 1000} seconds). Application may be frozen.`;
        this.log(`⚠️ ${message}`);
        console.log(`⚠️ ${message}`);
        
        // إعادة تشغيل التطبيق المجمد
        if (this.process) {
          this.log('🔄 Killing frozen application...');
          this.process.kill('SIGKILL');
        }
      } else {
        this.log(`💓 Heartbeat OK - ${heartbeatData.activeTokens}/${heartbeatData.totalTokens} tokens active`);
      }
      
    } catch (error) {
      this.log(`❌ Error checking heartbeat: ${error.message}`);
    }
  }

  /**
   * تسجيل رسالة في ملف السجل
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * الحصول على إحصائيات المراقب
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      processRunning: this.process && !this.process.killed,
      processPid: this.process ? this.process.pid : null,
      restartCount: this.restartCount,
      recentRestarts: this.restartHistory.length,
      maxRestarts: this.maxRestarts,
      restartWindow: this.restartWindow,
      heartbeatTimeout: this.heartbeatTimeout,
      uptime: this.process ? process.uptime() : 0
    };
  }

  /**
   * إعادة تشغيل يدوي للتطبيق
   */
  restart() {
    this.log('🔄 Manual restart requested');
    
    if (this.process) {
      this.process.kill('SIGTERM');
    } else {
      this.startApplication();
    }
  }
}

module.exports = ApplicationMonitor;
