// اختبار تكامل نظام rugcheck الجديد
const RugcheckContentExtractor = require('./rugcheck_content_extractor');

async function testRugcheckIntegration() {
    console.log('🧪 اختبار تكامل نظام rugcheck الجديد...\n');
    
    const extractor = new RugcheckContentExtractor();
    
    // توكن اختبار
    const testToken = '9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi'; // التوكن من المرفقات
    
    try {
        console.log(`🔍 فحص التوكن: ${testToken}`);
        
        // استخراج المحتوى
        const formattedContent = await extractor.extractFormattedContent(testToken);
        
        // البحث عن النقاط
        const scoreMatch = formattedContent.match(/(\d+)\s*\/\s*100/);
        
        if (scoreMatch) {
            const score = parseInt(scoreMatch[1]);
            console.log(`\n📊 النقاط المستخرجة: ${score}/100`);
            
            // تصنيف التوكن حسب المعايير الجديدة
            let status;
            let statusEmoji;
            let description;
            
            if (score >= 10 && score <= 20) {
                status = 'SAFE';
                statusEmoji = '✅';
                description = 'آمن';
            } else if (score > 20 && score < 35) {
                status = 'WARNING';
                statusEmoji = '⚠️';
                description = 'تحذيري';
            } else if (score >= 35) {
                status = 'DANGER';
                statusEmoji = '🔴';
                description = 'خطر';
            } else {
                // أقل من 10 نقاط - آمن جداً
                status = 'SAFE';
                statusEmoji = '✅';
                description = 'آمن جداً';
            }
            
            console.log(`${statusEmoji} الحالة: ${status} (${description})`);
            console.log(`\n📋 معايير التصنيف:`);
            console.log(`   0-9 نقطة: آمن جداً ✅`);
            console.log(`   10-20 نقطة: آمن ✅`);
            console.log(`   21-34 نقطة: تحذيري ⚠️`);
            console.log(`   35+ نقطة: خطر 🔴`);
            
        } else {
            console.log('❌ لم يتم العثور على تقييم نقاط في المحتوى');
            console.log('\n🔍 البحث في المحتوى عن نمط: \\d+\\s*/\\s*100');
            
            // عرض جزء من المحتوى للتشخيص
            const contentLines = formattedContent.split('\n');
            console.log('\n📄 أول 20 سطر من المحتوى:');
            contentLines.slice(0, 20).forEach((line, index) => {
                console.log(`${index + 1}: ${line}`);
            });
        }
        
    } catch (error) {
        console.error('❌ خطأ في الاختبار:', error.message);
        console.error('📍 Stack trace:', error.stack);
    }
}

// تشغيل الاختبار
if (require.main === module) {
    testRugcheckIntegration();
}

module.exports = testRugcheckIntegration;
