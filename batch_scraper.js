const WebScraper = require('./web_scraper');
const fs = require('fs');
const path = require('path');

class BatchScraper {
    constructor() {
        this.scraper = new WebScraper();
        this.results = [];
        this.errors = [];
    }

    async scrapeMultipleUrls(urls, delayMs = 2000) {
        console.log(`🚀 بدء فحص ${urls.length} رابط...`);
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            console.log(`\n[${i + 1}/${urls.length}] 🔍 فحص: ${url}`);
            
            try {
                const data = await this.scraper.scrapeWebsite(url);
                this.results.push(data);
                
                // حفظ كل نتيجة منفصلة
                const urlParts = new URL(url);
                const domain = urlParts.hostname.replace('www.', '');
                const path_part = urlParts.pathname.replace(/[^a-zA-Z0-9]/g, '_');
                const filename = `batch_${domain}${path_part}_${i + 1}.html`;
                
                await this.scraper.saveToFile(data, filename);
                
                console.log(`✅ تم بنجاح - العنوان: ${data.title}`);
                
                // تأخير بين الطلبات لتجنب الحظر
                if (i < urls.length - 1 && delayMs > 0) {
                    console.log(`⏰ انتظار ${delayMs}ms...`);
                    await this.delay(delayMs);
                }
                
            } catch (error) {
                console.log(`❌ فشل: ${error.message}`);
                this.errors.push({
                    url: url,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // إنشاء تقرير شامل
        await this.generateBatchReport();
        
        return {
            successful: this.results.length,
            failed: this.errors.length,
            total: urls.length
        };
    }

    async generateBatchReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                total_processed: this.results.length + this.errors.length,
                successful: this.results.length,
                failed: this.errors.length,
                success_rate: ((this.results.length / (this.results.length + this.errors.length)) * 100).toFixed(2) + '%'
            },
            successful_results: this.results.map(result => ({
                url: result.url,
                title: result.title,
                content_length: result.contentLength,
                links_count: result.links.length,
                warnings_count: result.rugcheckSpecific.warnings.length
            })),
            errors: this.errors
        };

        // حفظ التقرير JSON
        const reportPath = path.join(__dirname, `batch_report_${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');

        // إنشاء تقرير نصي
        let textReport = `تقرير الفحص المتعدد
=====================

التاريخ: ${reportData.timestamp}
إجمالي الروابط: ${reportData.summary.total_processed}
نجح: ${reportData.summary.successful}
فشل: ${reportData.summary.failed}
معدل النجاح: ${reportData.summary.success_rate}

النتائج الناجحة:
================`;

        this.results.forEach((result, i) => {
            textReport += `\n${i + 1}. ${result.title}
   الرابط: ${result.url}
   حجم المحتوى: ${result.contentLength.toLocaleString()} حرف
   عدد الروابط: ${result.links.length}
   التحذيرات: ${result.rugcheckSpecific.warnings.length}
`;
        });

        if (this.errors.length > 0) {
            textReport += `\nالأخطاء:
========`;
            this.errors.forEach((error, i) => {
                textReport += `\n${i + 1}. ${error.url}
   الخطأ: ${error.error}
   التوقيت: ${error.timestamp}
`;
            });
        }

        const textReportPath = path.join(__dirname, `batch_report_${Date.now()}.txt`);
        fs.writeFileSync(textReportPath, textReport, 'utf8');

        console.log(`\n📊 تم إنشاء التقرير الشامل:`);
        console.log(`   📄 JSON: ${reportPath}`);
        console.log(`   📋 النص: ${textReportPath}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// مثال للاستخدام
async function testBatchScraping() {
    const batchScraper = new BatchScraper();
    
    // روابط rugcheck للاختبار
    const testUrls = [
        'https://rugcheck.xyz/tokens/9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi',
        'https://rugcheck.xyz/tokens/So11111111111111111111111111111111111111112',
        'https://rugcheck.xyz/tokens/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    ];
    
    try {
        const result = await batchScraper.scrapeMultipleUrls(testUrls, 3000); // 3 ثواني بين كل طلب
        
        console.log('\n🎉 انتهى الفحص المتعدد!');
        console.log(`✅ نجح: ${result.successful}/${result.total}`);
        console.log(`❌ فشل: ${result.failed}/${result.total}`);
        
    } catch (error) {
        console.error('❌ خطأ في الفحص المتعدد:', error.message);
    }
}

// تشغيل البرنامج إذا تم استدعاؤه مباشرة
if (require.main === module) {
    console.log('🔍 أداة الفحص المتعدد للمواقع');
    console.log('=============================');
    testBatchScraping();
}

module.exports = BatchScraper;
