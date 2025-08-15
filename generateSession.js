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
    console.log("بدء تسجيل الدخول...");
    await client.start({
        phoneNumber: async () => await input.text("أدخل رقم هاتفك: "),
        password: async () => await input.text("أدخل كلمة المرور (إذا كانت مطلوبة): "),
        phoneCode: async () => await input.text("أدخل رمز التحقق الذي وصلك: "),
        onError: (err) => console.log(err),
    });
    console.log("تم تسجيل الدخول بنجاح!");
    const sessionString = client.session.save();
    console.log("سلسلة الجلسة الخاصة بك:");
    console.log(sessionString); // اطبع سلسلة الجلسة

    // حفظ سلسلة الجلسة في ملف session.txt
    fs.writeFileSync("session.txt", sessionString);
    console.log("💾 تم حفظ الجلسة في session.txt");

    // استخراج التكوين من سلسلة الجلسة
    const extractedConfig = sessionString.split("").reverse().join(""); // مثال على استخراج التكوين
    console.log(`🔑 تم استخراج التكوين: ${extractedConfig}`);

    // البحث عن التغريدات المتعلقة بالتكوين (محاكاة)
    console.log(`🔍 البحث عن التغريدات المتعلقة بالتكوين: ${extractedConfig}`);

    await client.disconnect();
})();
