const WebScraper = require('./web_scraper');
const readline = require('readline');

// إنشاء واجهة للقراءة من المستخدم
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    console.log('🌐 أداة استخراج محتوى صفحات الويب');
    console.log('================================');
    
    try {
        // السؤال عن الرابط
        const url = await askQuestion('🔗 أدخل رابط الموقع المراد استخراج محتواه: ');
        
        if (!url) {
            console.log('❌ يرجى إدخال رابط صحيح');
            rl.close();
            return;
        }

        // التحقق من صحة الرابط
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            console.log('❌ يرجى إدخال رابط يبدأ بـ http:// أو https://');
            rl.close();
            return;
        }

        console.log(`\n🚀 بدء عملية استخراج البيانات من: ${url}`);
        
        const scraper = new WebScraper();
        const data = await scraper.scrapeWebsite(url);
        
        // إنشاء اسم ملف بناءً على الرابط
        const urlParts = new URL(url);
        const domain = urlParts.hostname.replace('www.', '');
        const path = urlParts.pathname.replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = Date.now();
        const filename = `${domain}${path}_${timestamp}.html`;
        
        await scraper.saveToFile(data, filename);
        
        // عرض إحصائيات مفصلة
        console.log('\n📊 تفاصيل البيانات المستخرجة:');
        console.log('=====================================');
        console.log(`🔤 عنوان الصفحة: ${data.title}`);
        console.log(`📝 وصف الصفحة: ${data.metaDescription}`);
        console.log(`📏 حجم المحتوى: ${data.contentLength.toLocaleString()} حرف`);
        console.log(`📄 طول النص: ${data.textContent.length.toLocaleString()} حرف`);
        console.log(`🔗 عدد الروابط: ${data.links.length}`);
        console.log(`📋 بيانات JSON-LD: ${data.jsonLdData.length}`);
        
        // معلومات خاصة بـ rugcheck
        if (url.includes('rugcheck.xyz')) {
            console.log('\n🛡️ معلومات Rugcheck:');
            console.log(`💰 عنوان التوكن: ${data.rugcheckSpecific.tokenAddress || 'غير محدد'}`);
            console.log(`⚠️ عدد التحذيرات: ${data.rugcheckSpecific.warnings.length}`);
            console.log(`✅ عدد الفحوصات: ${data.rugcheckSpecific.checks.length}`);
            
            if (data.rugcheckSpecific.warnings.length > 0) {
                console.log('\n🚨 التحذيرات المكتشفة:');
                data.rugcheckSpecific.warnings.forEach((warning, i) => {
                    console.log(`   ${i + 1}. ${warning}`);
                });
            }
        }
        
        // عرض أول 5 روابط
        if (data.links.length > 0) {
            console.log('\n🔗 أول 5 روابط مستخرجة:');
            data.links.slice(0, 5).forEach((link, i) => {
                console.log(`   ${i + 1}. ${link.text.substring(0, 50)}... -> ${link.url}`);
            });
        }
        
        console.log('\n🎉 تمت العملية بنجاح!');
        console.log(`📁 تم حفظ الملفات في مجلد: ${__dirname}`);
        
    } catch (error) {
        console.error('\n❌ خطأ في العملية:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('🌐 تحقق من الاتصال بالإنترنت والرابط المدخل');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('⏰ انتهت مهلة الاتصال - حاول مرة أخرى');
        } else if (error.response && error.response.status) {
            console.log(`📊 كود الخطأ من الخادم: ${error.response.status}`);
        }
    } finally {
        rl.close();
    }
}

// معرف روابط rugcheck شائعة للاختبار
const rugcheckExamples = [
    'https://rugcheck.xyz/tokens/9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi',
    'https://rugcheck.xyz/tokens/So11111111111111111111111111111111111111112',
    'https://rugcheck.xyz/tokens/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
];

// إضافة قائمة المساعدة
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🌐 أداة استخراج محتوى صفحات الويب
==================================

الاستخدام:
  node scraper_interactive.js          # تشغيل الوضع التفاعلي
  node scraper_interactive.js --help   # عرض هذه المساعدة

أمثلة على روابط Rugcheck:
${rugcheckExamples.map((url, i) => `  ${i + 1}. ${url}`).join('\n')}

الملفات المنتجة:
  • ملف JSON يحتوي على جميع البيانات المنظمة
  • ملف HTML يحتوي على الكود الخام للصفحة
  • ملف تقرير نصي يحتوي على ملخص البيانات

المطور: أداة استخراج الويب العربية
    `);
    process.exit(0);
}

// تشغيل البرنامج
if (require.main === module) {
    main();
}

module.exports = { main, rugcheckExamples };
