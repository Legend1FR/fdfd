/**
 * نظام الاستمرارية المحسن لضمان استمرار تتبع التوكنات
 * Enhanced Persistence System for Token Tracking
 */

const fs = require('fs');
const path = require('path');

class EnhancedPersistence {
  constructor(options = {}) {
    this.trackedTokensFile = options.trackedTokensFile || 'tracked_tokens.json';
    this.backupDir = options.backupDir || 'backups';
    this.maxBackups = options.maxBackups || 10;
    this.saveInterval = options.saveInterval || 30000; // 30 ثانية
    this.heartbeatInterval = options.heartbeatInterval || 60000; // دقيقة
    this.isRunning = false;
    this.saveIntervalId = null;
    this.heartbeatIntervalId = null;
    
    // إنشاء مجلد النسخ الاحتياطية
    this.ensureBackupDir();
    
    console.log('🔄 Enhanced Persistence System initialized');
  }

  /**
   * إنشاء مجلد النسخ الاحتياطية
   */
  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}`);
    }
  }

  /**
   * بدء نظام الاستمرارية المحسن
   */
  start(trackedTokensRef) {
    if (this.isRunning) {
      console.log('⚠️ Enhanced Persistence System is already running');
      return;
    }

    this.trackedTokens = trackedTokensRef;
    this.isRunning = true;
    
    console.log('🚀 Starting Enhanced Persistence System...');
    
    // حفظ دوري للبيانات
    this.saveIntervalId = setInterval(() => {
      this.saveWithBackup();
    }, this.saveInterval);
    
    // heartbeat للتأكد من عمل النظام
    this.heartbeatIntervalId = setInterval(() => {
      this.writeHeartbeat();
    }, this.heartbeatInterval);
    
    // حفظ فوري عند البدء
    this.saveWithBackup();
    
    console.log('✅ Enhanced Persistence System started');
    console.log(`💾 Auto-save every ${this.saveInterval / 1000} seconds`);
    console.log(`💓 Heartbeat every ${this.heartbeatInterval / 1000} seconds`);
  }

  /**
   * إيقاف نظام الاستمرارية
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Enhanced Persistence System is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.saveIntervalId) {
      clearInterval(this.saveIntervalId);
      this.saveIntervalId = null;
    }
    
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
    
    // حفظ أخير قبل الإيقاف
    this.saveWithBackup();
    
    console.log('🛑 Enhanced Persistence System stopped');
  }

  /**
   * حفظ البيانات مع إنشاء نسخة احتياطية
   */
  saveWithBackup() {
    try {
      if (!this.trackedTokens || Object.keys(this.trackedTokens).length === 0) {
        console.log('📝 No tokens to save');
        return;
      }

      // إنشاء نسخة احتياطية من الملف الحالي
      if (fs.existsSync(this.trackedTokensFile)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupDir, `tracked_tokens_${timestamp}.json`);
        fs.copyFileSync(this.trackedTokensFile, backupFile);
        
        // تنظيف النسخ الاحتياطية القديمة
        this.cleanupOldBackups();
      }

      // حفظ البيانات الحالية
      const dataToSave = JSON.stringify(this.trackedTokens, null, 2);
      fs.writeFileSync(this.trackedTokensFile, dataToSave, 'utf8');
      
      const tokenCount = Object.keys(this.trackedTokens).length;
      console.log(`💾 Saved ${tokenCount} tokens with backup - ${new Date().toLocaleString('ar-SA')}`);
      
    } catch (error) {
      console.error('❌ Error saving tokens with backup:', error.message);
    }
  }

  /**
   * تنظيف النسخ الاحتياطية القديمة
   */
  cleanupOldBackups() {
    try {
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('tracked_tokens_') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      // حذف النسخ الاحتياطية الزائدة
      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`🗑️ Deleted old backup: ${file.name}`);
        });
      }
    } catch (error) {
      console.error('❌ Error cleaning up old backups:', error.message);
    }
  }

  /**
   * كتابة heartbeat للتأكد من عمل النظام
   */
  writeHeartbeat() {
    try {
      const heartbeatData = {
        timestamp: new Date().toISOString(),
        activeTokens: this.trackedTokens ? Object.keys(this.trackedTokens).filter(
          token => !this.trackedTokens[token].stopped
        ).length : 0,
        totalTokens: this.trackedTokens ? Object.keys(this.trackedTokens).length : 0,
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      };
      
      fs.writeFileSync('heartbeat.json', JSON.stringify(heartbeatData, null, 2));
      
      console.log(`💓 Heartbeat: ${heartbeatData.activeTokens}/${heartbeatData.totalTokens} tokens active`);
    } catch (error) {
      console.error('❌ Error writing heartbeat:', error.message);
    }
  }

  /**
   * استعادة البيانات من آخر نسخة احتياطية سليمة
   */
  restoreFromBackup() {
    try {
      console.log('🔄 Attempting to restore from backup...');
      
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('tracked_tokens_') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      if (backupFiles.length === 0) {
        console.log('❌ No backup files found');
        return null;
      }

      // محاولة استعادة من أحدث نسخة احتياطية
      for (const backup of backupFiles) {
        try {
          const data = fs.readFileSync(backup.path, 'utf8');
          const parsedData = JSON.parse(data);
          
          console.log(`✅ Successfully restored from backup: ${backup.name}`);
          console.log(`📊 Restored ${Object.keys(parsedData).length} tokens`);
          
          return parsedData;
        } catch (parseError) {
          console.error(`❌ Failed to parse backup ${backup.name}: ${parseError.message}`);
          continue;
        }
      }
      
      console.log('❌ All backup files are corrupted');
      return null;
      
    } catch (error) {
      console.error('❌ Error restoring from backup:', error.message);
      return null;
    }
  }

  /**
   * فحص سلامة ملف البيانات
   */
  validateDataFile() {
    try {
      if (!fs.existsSync(this.trackedTokensFile)) {
        console.log('⚠️ Main data file does not exist');
        return false;
      }

      const data = fs.readFileSync(this.trackedTokensFile, 'utf8');
      JSON.parse(data);
      
      console.log('✅ Main data file is valid');
      return true;
    } catch (error) {
      console.error('❌ Main data file is corrupted:', error.message);
      return false;
    }
  }

  /**
   * الحصول على إحصائيات النظام
   */
  getStats() {
    const backupFiles = fs.existsSync(this.backupDir) ? 
      fs.readdirSync(this.backupDir).filter(f => f.endsWith('.json')).length : 0;
    
    return {
      isRunning: this.isRunning,
      saveInterval: this.saveInterval,
      heartbeatInterval: this.heartbeatInterval,
      backupCount: backupFiles,
      maxBackups: this.maxBackups,
      dataFileExists: fs.existsSync(this.trackedTokensFile),
      heartbeatExists: fs.existsSync('heartbeat.json')
    };
  }
}

module.exports = EnhancedPersistence;
