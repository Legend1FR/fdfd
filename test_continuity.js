/**
 * اختبار نظام الاستمرارية
 * Continuity System Test
 */

const fs = require('fs');
const { spawn } = require('child_process');

class ContinuityTester {
  constructor() {
    this.testResults = [];
    this.testStartTime = new Date();
  }

  /**
   * تشغيل جميع الاختبارات
   */
  async runAllTests() {
    console.log('🧪 بدء اختبار نظام الاستمرارية...');
    console.log('='.repeat(50));
    
    await this.testEnhancedPersistence();
    await this.testBackupSystem();
    await this.testHeartbeat();
    await this.testApplicationMonitor();
    await this.testDataRecovery();
    
    this.printResults();
  }

  /**
   * اختبار نظام الاستمرارية المحسن
   */
  async testEnhancedPersistence() {
    console.log('\n🔧 اختبار نظام الاستمرارية المحسن...');
    
    try {
      const EnhancedPersistence = require('./enhanced_persistence');
      
      // إنشاء بيانات اختبار
      const testData = {
        'test_token_1': {
          name: 'Test Token 1',
          symbol: 'TEST1',
          price: 0.001,
          timestamp: new Date().toISOString()
        }
      };
      
      // إنشاء نظام الاستمرارية
      const persistence = new EnhancedPersistence({
        trackedTokensFile: 'test_tracked_tokens.json',
        backupDir: 'test_backups',
        saveInterval: 5000,
        maxBackups: 3
      });
      
      // بدء النظام
      persistence.start(testData);
      
      // انتظار الحفظ
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      // فحص إنشاء الملفات
      const mainFileExists = fs.existsSync('test_tracked_tokens.json');
      const backupDirExists = fs.existsSync('test_backups');
      
      persistence.stop();
      
      // تنظيف ملفات الاختبار
      this.cleanupTestFiles();
      
      if (mainFileExists && backupDirExists) {
        this.addTestResult('✅ نظام الاستمرارية المحسن', 'نجح');
      } else {
        this.addTestResult('❌ نظام الاستمرارية المحسن', 'فشل');
      }
      
    } catch (error) {
      this.addTestResult('❌ نظام الاستمرارية المحسن', `فشل: ${error.message}`);
    }
  }

  /**
   * اختبار نظام النسخ الاحتياطية
   */
  async testBackupSystem() {
    console.log('\n💾 اختبار نظام النسخ الاحتياطية...');
    
    try {
      const EnhancedPersistence = require('./enhanced_persistence');
      
      const testData = { test: 'backup_test' };
      const persistence = new EnhancedPersistence({
        trackedTokensFile: 'test_backup_main.json',
        backupDir: 'test_backup_dir',
        maxBackups: 2
      });
      
      persistence.start(testData);
      
      // محاكاة عدة عمليات حفظ
      for (let i = 0; i < 3; i++) {
        testData[`token_${i}`] = { test: `data_${i}` };
        persistence.saveWithBackup();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      persistence.stop();
      
      // فحص النسخ الاحتياطية
      const backupFiles = fs.existsSync('test_backup_dir') ? 
        fs.readdirSync('test_backup_dir').filter(f => f.endsWith('.json')) : [];
      
      this.cleanupTestFiles(['test_backup_main.json', 'test_backup_dir']);
      
      if (backupFiles.length > 0) {
        this.addTestResult('✅ نظام النسخ الاحتياطية', `نجح - ${backupFiles.length} نسخة`);
      } else {
        this.addTestResult('❌ نظام النسخ الاحتياطية', 'فشل - لا توجد نسخ');
      }
      
    } catch (error) {
      this.addTestResult('❌ نظام النسخ الاحتياطية', `فشل: ${error.message}`);
    }
  }

  /**
   * اختبار نظام Heartbeat
   */
  async testHeartbeat() {
    console.log('\n💓 اختبار نظام Heartbeat...');
    
    try {
      const EnhancedPersistence = require('./enhanced_persistence');
      
      const persistence = new EnhancedPersistence({
        heartbeatInterval: 2000
      });
      
      persistence.start({});
      
      // انتظار إنشاء heartbeat
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const heartbeatExists = fs.existsSync('heartbeat.json');
      let heartbeatValid = false;
      
      if (heartbeatExists) {
        try {
          const heartbeatData = JSON.parse(fs.readFileSync('heartbeat.json', 'utf8'));
          heartbeatValid = heartbeatData.timestamp && heartbeatData.pid;
        } catch (e) {
          heartbeatValid = false;
        }
      }
      
      persistence.stop();
      
      if (heartbeatExists && heartbeatValid) {
        this.addTestResult('✅ نظام Heartbeat', 'نجح');
      } else {
        this.addTestResult('❌ نظام Heartbeat', 'فشل');
      }
      
    } catch (error) {
      this.addTestResult('❌ نظام Heartbeat', `فشل: ${error.message}`);
    }
  }

  /**
   * اختبار مراقب التطبيق
   */
  async testApplicationMonitor() {
    console.log('\n🔍 اختبار مراقب التطبيق...');
    
    try {
      const ApplicationMonitor = require('./application_monitor');
      
      const monitor = new ApplicationMonitor({
        scriptPath: 'test_dummy_app.js',
        restartDelay: 1000,
        maxRestarts: 2,
        logFile: 'test_monitor.log'
      });
      
      // إنشاء تطبيق وهمي للاختبار
      const dummyAppCode = `
        console.log('Dummy app started');
        setTimeout(() => {
          console.log('Dummy app exiting');
          process.exit(0);
        }, 2000);
      `;
      
      fs.writeFileSync('test_dummy_app.js', dummyAppCode);
      
      // بدء المراقبة لفترة قصيرة
      monitor.start();
      await new Promise(resolve => setTimeout(resolve, 5000));
      monitor.stop();
      
      const logExists = fs.existsSync('test_monitor.log');
      
      // تنظيف
      this.cleanupTestFiles(['test_dummy_app.js', 'test_monitor.log']);
      
      if (logExists) {
        this.addTestResult('✅ مراقب التطبيق', 'نجح');
      } else {
        this.addTestResult('❌ مراقب التطبيق', 'فشل');
      }
      
    } catch (error) {
      this.addTestResult('❌ مراقب التطبيق', `فشل: ${error.message}`);
    }
  }

  /**
   * اختبار استعادة البيانات
   */
  async testDataRecovery() {
    console.log('\n🔄 اختبار استعادة البيانات...');
    
    try {
      const EnhancedPersistence = require('./enhanced_persistence');
      
      // إنشاء بيانات أولية
      const originalData = { token1: { name: 'Original Token' } };
      fs.writeFileSync('test_recovery_main.json', JSON.stringify(originalData));
      
      // إنشاء نسخة احتياطية صحيحة
      if (!fs.existsSync('test_recovery_backups')) {
        fs.mkdirSync('test_recovery_backups');
      }
      
      const backupData = { token1: { name: 'Backup Token' } };
      fs.writeFileSync('test_recovery_backups/tracked_tokens_backup.json', JSON.stringify(backupData));
      
      // إفساد الملف الرئيسي
      fs.writeFileSync('test_recovery_main.json', '{invalid json}');
      
      const persistence = new EnhancedPersistence({
        trackedTokensFile: 'test_recovery_main.json',
        backupDir: 'test_recovery_backups'
      });
      
      // محاولة الاستعادة
      const recoveredData = persistence.restoreFromBackup();
      
      this.cleanupTestFiles(['test_recovery_main.json', 'test_recovery_backups']);
      
      if (recoveredData && recoveredData.token1) {
        this.addTestResult('✅ استعادة البيانات', 'نجح');
      } else {
        this.addTestResult('❌ استعادة البيانات', 'فشل');
      }
      
    } catch (error) {
      this.addTestResult('❌ استعادة البيانات', `فشل: ${error.message}`);
    }
  }

  /**
   * إضافة نتيجة اختبار
   */
  addTestResult(test, result) {
    this.testResults.push({ test, result, timestamp: new Date() });
    console.log(`   ${test}: ${result}`);
  }

  /**
   * طباعة النتائج النهائية
   */
  printResults() {
    const duration = new Date() - this.testStartTime;
    const passed = this.testResults.filter(r => r.result === 'نجح').length;
    const total = this.testResults.length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 نتائج الاختبار النهائية');
    console.log('='.repeat(50));
    console.log(`⏱️  وقت التنفيذ: ${Math.round(duration / 1000)} ثانية`);
    console.log(`✅ نجح: ${passed}/${total}`);
    console.log(`❌ فشل: ${total - passed}/${total}`);
    console.log(`📈 معدل النجاح: ${Math.round((passed / total) * 100)}%`);
    
    if (passed === total) {
      console.log('\n🎉 جميع الاختبارات نجحت! نظام الاستمرارية جاهز للعمل.');
    } else {
      console.log('\n⚠️ بعض الاختبارات فشلت. راجع النتائج أعلاه.');
    }
    
    // حفظ تقرير الاختبار
    const report = {
      timestamp: this.testStartTime,
      duration: duration,
      passed: passed,
      total: total,
      successRate: Math.round((passed / total) * 100),
      details: this.testResults
    };
    
    fs.writeFileSync('continuity_test_report.json', JSON.stringify(report, null, 2));
    console.log('\n📋 تم حفظ تقرير مفصل في: continuity_test_report.json');
  }

  /**
   * تنظيف ملفات الاختبار
   */
  cleanupTestFiles(additionalFiles = []) {
    const filesToClean = [
      'test_tracked_tokens.json',
      'test_backups',
      'heartbeat.json',
      ...additionalFiles
    ];
    
    filesToClean.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          if (stats.isDirectory()) {
            fs.rmSync(file, { recursive: true, force: true });
          } else {
            fs.unlinkSync(file);
          }
        }
      } catch (error) {
        console.log(`⚠️ لم يتم حذف ${file}: ${error.message}`);
      }
    });
  }
}

// تشغيل الاختبارات إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  const tester = new ContinuityTester();
  tester.runAllTests().catch(error => {
    console.error('❌ خطأ في تشغيل الاختبارات:', error);
    process.exit(1);
  });
}

module.exports = ContinuityTester;
