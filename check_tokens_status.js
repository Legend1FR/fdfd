// اختبار سريع لحالة التوكن
const fs = require('fs');

// قراءة التوكنات المتتبعة
if (fs.existsSync('tracked_tokens.json')) {
    const trackedTokens = JSON.parse(fs.readFileSync('tracked_tokens.json', 'utf8'));
    
    console.log('🔍 التوكنات المتتبعة حالياً:');
    console.log('='.repeat(50));
    
    Object.keys(trackedTokens).forEach(token => {
        const data = trackedTokens[token];
        console.log(`📍 التوكن: ${token}`);
        console.log(`🛡️ حالة rugcheck: ${data.rugcheckStatus || 'غير محددة'}`);
        console.log(`💰 السعر الأول: ${data.firstPrice || 'غير محدد'}`);
        console.log(`💰 السعر الحالي: ${data.lastPrice || 'غير محدد'}`);
        console.log(`📊 اسم التوكن: ${data.name || 'غير محدد'}`);
        console.log(`🔗 رمز التوكن: ${data.symbol || 'غير محدد'}`);
        console.log('─'.repeat(30));
    });
    
    console.log(`📊 إجمالي التوكنات: ${Object.keys(trackedTokens).length}`);
} else {
    console.log('❌ لا يوجد ملف tracked_tokens.json');
}
