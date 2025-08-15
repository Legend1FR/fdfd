const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class WebScraper {
    constructor() {
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
    }

    async scrapeWebsite(url) {
        try {
            console.log(`🔍 جاري استخراج البيانات من: ${url}`);
            
            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 30000,
                maxRedirects: 5
            });

            const html = response.data;
            const $ = cheerio.load(html);

            // استخراج معلومات أساسية
            const title = $('title').text() || 'لا يوجد عنوان';
            const metaDescription = $('meta[name="description"]').attr('content') || 'لا يوجد وصف';

            // استخراج جميع النصوص
            const allText = $('body').text().replace(/\s+/g, ' ').trim();

            // استخراج الروابط
            const links = [];
            $('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                const text = $(elem).text().trim();
                if (href && text) {
                    links.push({
                        url: href,
                        text: text
                    });
                }
            });

            // استخراج البيانات المنظمة (JSON-LD)
            const jsonLdData = [];
            $('script[type="application/ld+json"]').each((i, elem) => {
                try {
                    const jsonData = JSON.parse($(elem).html());
                    jsonLdData.push(jsonData);
                } catch (error) {
                    console.log('خطأ في تحليل JSON-LD:', error.message);
                }
            });

            // استخراج معلومات خاصة بـ rugcheck
            const rugcheckData = this.extractRugcheckData($, url);

            const result = {
                url: url,
                timestamp: new Date().toISOString(),
                title: title,
                metaDescription: metaDescription,
                contentLength: html.length,
                textContent: allText,
                links: links,
                jsonLdData: jsonLdData,
                rugcheckSpecific: rugcheckData,
                rawHtml: html
            };

            return result;

        } catch (error) {
            console.error('❌ خطأ في استخراج البيانات:', error.message);
            throw error;
        }
    }

    extractRugcheckData($, url = '') {
        const rugcheckData = {
            tokenAddress: null,
            riskLevel: null,
            checks: [],
            warnings: [],
            tokenInfo: {}
        };

        // استخراج عنوان التوكن من URL
        const urlMatch = url.match(/tokens\/([A-Za-z0-9]+)/) || [];
        if (urlMatch[1]) {
            rugcheckData.tokenAddress = urlMatch[1];
        }

        // استخراج معلومات التوكن
        $('.token-info, .token-details, [class*="token"]').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text) {
                rugcheckData.tokenInfo.details = text;
            }
        });

        // استخراج التحذيرات والمخاطر
        $('.warning, .danger, .risk, [class*="warning"], [class*="danger"], [class*="risk"]').each((i, elem) => {
            const warningText = $(elem).text().trim();
            if (warningText) {
                rugcheckData.warnings.push(warningText);
            }
        });

        // استخراج نتائج الفحص
        $('.check, .test, .result, [class*="check"], [class*="test"], [class*="result"]').each((i, elem) => {
            const checkText = $(elem).text().trim();
            if (checkText) {
                rugcheckData.checks.push(checkText);
            }
        });

        return rugcheckData;
    }

    async saveToFile(data, filename) {
        try {
            const filePath = path.join(__dirname, filename);
            
            // حفظ البيانات المنظمة كـ JSON
            const jsonFilePath = filePath.replace('.html', '_data.json');
            fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
            
            // حفظ HTML الخام
            const htmlFilePath = filePath.replace('.json', '.html');
            fs.writeFileSync(htmlFilePath, data.rawHtml, 'utf8');
            
            // حفظ تقرير مبسط
            const reportPath = filePath.replace('.html', '_report.txt');
            const report = this.generateReport(data);
            fs.writeFileSync(reportPath, report, 'utf8');
            
            console.log(`✅ تم حفظ البيانات في:`);
            console.log(`   📊 JSON: ${jsonFilePath}`);
            console.log(`   🌐 HTML: ${htmlFilePath}`);
            console.log(`   📋 التقرير: ${reportPath}`);
            
        } catch (error) {
            console.error('❌ خطأ في حفظ الملف:', error.message);
            throw error;
        }
    }

    generateReport(data) {
        let report = `تقرير استخراج البيانات من الموقع
======================================

الرابط: ${data.url}
التاريخ: ${data.timestamp}
العنوان: ${data.title}
الوصف: ${data.metaDescription}
حجم المحتوى: ${data.contentLength} حرف

معلومات Rugcheck المستخرجة:
----------------------------`;

        if (data.rugcheckSpecific.tokenAddress) {
            report += `\nعنوان التوكن: ${data.rugcheckSpecific.tokenAddress}`;
        }

        if (data.rugcheckSpecific.warnings.length > 0) {
            report += `\n\nالتحذيرات:\n`;
            data.rugcheckSpecific.warnings.forEach((warning, i) => {
                report += `${i + 1}. ${warning}\n`;
            });
        }

        if (data.rugcheckSpecific.checks.length > 0) {
            report += `\nنتائج الفحص:\n`;
            data.rugcheckSpecific.checks.forEach((check, i) => {
                report += `${i + 1}. ${check}\n`;
            });
        }

        if (data.links.length > 0) {
            report += `\n\nالروابط المستخرجة (أول 10):\n`;
            data.links.slice(0, 10).forEach((link, i) => {
                report += `${i + 1}. ${link.text} - ${link.url}\n`;
            });
        }

        return report;
    }
}

// دالة رئيسية للتشغيل
async function main() {
    const scraper = new WebScraper();
    
    // الرابط المطلوب فحصه
    const url = 'https://rugcheck.xyz/tokens/9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi';
    
    try {
        console.log('🚀 بدء عملية استخراج البيانات...');
        
        const data = await scraper.scrapeWebsite(url);
        
        // إنشاء اسم ملف بناءً على عنوان التوكن
        const tokenAddress = url.split('/').pop();
        const filename = `rugcheck_${tokenAddress}_${Date.now()}.html`;
        
        await scraper.saveToFile(data, filename);
        
        console.log('\n📊 ملخص البيانات المستخرجة:');
        console.log(`   🔤 العنوان: ${data.title}`);
        console.log(`   📏 طول المحتوى: ${data.contentLength} حرف`);
        console.log(`   🔗 عدد الروابط: ${data.links.length}`);
        console.log(`   ⚠️  عدد التحذيرات: ${data.rugcheckSpecific.warnings.length}`);
        console.log(`   ✅ عدد الفحوصات: ${data.rugcheckSpecific.checks.length}`);
        
        console.log('\n🎉 تمت العملية بنجاح!');
        
    } catch (error) {
        console.error('❌ فشلت العملية:', error.message);
        process.exit(1);
    }
}

// تشغيل البرنامج إذا تم استدعاؤه مباشرة
if (require.main === module) {
    main();
}

module.exports = WebScraper;
