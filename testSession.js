const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const fs = require("fs");

// إعدادات التطبيق
const apiId = 23299626;
const apiHash = "89de50a19288ec535e8b008ae2ff268d";

async function testSession() {
  console.log("🔍 فحص ملف الجلسة...");
  
  if (!fs.existsSync("session.txt")) {
    console.error("❌ ملف session.txt غير موجود!");
    console.log("💡 يرجى تشغيل generateSession.js أولاً لإنشاء جلسة.");
    return;
  }
  
  const savedSession = fs.readFileSync("session.txt", "utf8").trim();
  
  if (!savedSession || savedSession.length === 0) {
    console.error("❌ ملف session.txt فارغ!");
    return;
  }
  
  console.log("✅ تم العثور على ملف الجلسة");
  console.log(`📏 طول الجلسة: ${savedSession.length} حرف`);
  
  const stringSession = new StringSession(savedSession);
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 3,
  });
  
  try {
    console.log("🔗 محاولة الاتصال باستخدام الجلسة...");
    await client.connect();
    
    console.log("✅ تم الاتصال بنجاح!");
    
    // اختبار إرسال رسالة
    await client.sendMessage("me", { 
      message: "✅ اختبار الجلسة ناجح! الجلسة تعمل بشكل صحيح." 
    });
    
    console.log("📤 تم إرسال رسالة اختبار بنجاح!");
    console.log("🎉 الجلسة صالحة ويمكن استخدامها في Render!");
    
  } catch (error) {
    console.error("❌ خطأ في اختبار الجلسة:", error.message);
    
    if (error.errorMessage === 'SESSION_REVOKED') {
      console.error("❌ الجلسة منتهية الصلاحية. يرجى إنشاء جلسة جديدة.");
    } else if (error.errorMessage === 'AUTH_KEY_UNREGISTERED') {
      console.error("❌ مفتاح المصادقة غير مسجل. يرجى إنشاء جلسة جديدة.");
    } else {
      console.error("❌ خطأ غير متوقع:", error);
    }
    
    console.log("💡 يرجى تشغيل generateSession.js لإنشاء جلسة جديدة.");
  } finally {
    await client.disconnect();
  }
}

testSession().catch(console.error);
