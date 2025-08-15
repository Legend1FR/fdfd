const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // مكتبة لإدخال البيانات من المستخدم
const fs = require("fs"); // لإدارة الملفات

const apiId = 23299626; // استبدل بـ API ID الخاص بك
const apiHash = "89de50a19288ec535e8b008ae2ff268d"; // استبدل بـ API Hash الخاص بك
const stringSession = new StringSession(""); // سلسلة جلسة فارغة

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

(async () => {
    console.log("🔐 بدء إنشاء جلسة تيليجرام...");
    
    try {
        await client.start({
            phoneNumber: async () => await input.text("أدخل رقم هاتفك (مع رمز الدولة، مثل: +967xxxxxxxxx): "),
            password: async () => await input.text("أدخل كلمة المرور 2FA (اتركها فارغة إذا لم تكن موجودة): "),
            phoneCode: async () => await input.text("أدخل رمز التحقق الذي وصلك: "),
            onError: (err) => console.log("❌ خطأ:", err),
        });
        
        console.log("✅ تم تسجيل الدخول بنجاح!");
        const sessionString = client.session.save();
        
        // حفظ سلسلة الجلسة في ملف session.txt
        fs.writeFileSync("session.txt", sessionString);
        console.log("💾 تم حفظ الجلسة في session.txt");
        console.log("📱 سلسلة الجلسة:", sessionString);
        
        // إرسال رسالة تأكيد
        await client.sendMessage("me", { message: "✅ تم إنشاء الجلسة بنجاح! يمكنك الآن رفع الملفات إلى Render." });
        console.log("📤 تم إرسال رسالة تأكيد إلى حسابك");
        console.log("� يمكنك الآن رفع الملفات إلى Render!");
        
    } catch (error) {
        console.error("❌ خطأ في إنشاء الجلسة:", error.message);
        
        if (error.errorMessage === 'PHONE_NUMBER_BANNED') {
            console.error("❌ رقم الهاتف محظور من تيليجرام.");
            console.error("💡 الحلول المقترحة:");
            console.error("   1. استخدم رقم هاتف آخر");
            console.error("   2. تواصل مع دعم تيليجرام");
            console.error("   3. انتظر فترة قبل المحاولة مرة أخرى");
        } else if (error.errorMessage === 'PHONE_CODE_INVALID') {
            console.error("❌ رمز التحقق غير صحيح. حاول مرة أخرى.");
        } else if (error.errorMessage === 'PHONE_NUMBER_INVALID') {
            console.error("❌ رقم الهاتف غير صحيح. تأكد من إدخال رقم صحيح مع رمز الدولة.");
        }
    } finally {
        await client.disconnect();
    }
})();
