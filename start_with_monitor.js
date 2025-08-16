const ApplicationMonitor = require('./application_monitor');

/**
 * سكريبت بدء التطبيق مع المراقبة
 * Application Startup with Monitoring
 */

console.log('========================================');
console.log('    🚀 Token Tracker Monitor 🚀');
console.log('========================================');
console.log('');

// إنشاء مراقب التطبيق
const monitor = new ApplicationMonitor({
  scriptPath: 'server.js',
  restartDelay: 5000,      // 5 ثوانٍ
  maxRestarts: 10,         // حد أقصى 10 إعادة تشغيل
  restartWindow: 300000,   // في 5 دقائق
  heartbeatTimeout: 120000, // مهلة heartbeat دقيقتان
  logFile: 'app_monitor.log'
});

// معالجة إشارات الإنهاء
process.on('SIGINT', () => {
  console.log('\n🛑 تم تلقي إشارة الإنهاء - إيقاف المراقب...');
  monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 تم تلقي SIGTERM - إيقاف المراقب...');
  monitor.stop();
  process.exit(0);
});

// معالجة الأخطاء
process.on('uncaughtException', (error) => {
  console.error('❌ خطأ غير متوقع في المراقب:', error.message);
  monitor.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ رفض غير معالج في المراقب:', reason);
  monitor.stop();
  process.exit(1);
});

// بدء المراقبة
monitor.start();

console.log('✅ تم بدء مراقب التطبيق');
console.log('💡 استخدم Ctrl+C لإيقاف المراقبة');
console.log('📋 سيتم إعادة تشغيل التطبيق تلقائياً عند الحاجة');
console.log('');
