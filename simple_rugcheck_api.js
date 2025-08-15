const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SimpleRugcheckAPI {
    constructor() {
        this.baseUrl = 'https://api.rugcheck.xyz';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://rugcheck.xyz',
            'Referer': 'https://rugcheck.xyz/'
        };
    }

    async getTokenReport(tokenAddress) {
        try {
            console.log(`🔍 جاري الحصول على تقرير التوكن: ${tokenAddress}`);
            
            const url = `${this.baseUrl}/v1/tokens/${tokenAddress}/report`;
            console.log(`📡 الاستعلام: ${url}`);
            
            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 30000
            });
            
            console.log('✅ تم الحصول على البيانات بنجاح');
            return response.data;
            
        } catch (error) {
            if (error.response) {
                console.log(`❌ خطأ من الخادم: ${error.response.status} - ${error.response.statusText}`);
                if (error.response.data) {
                    console.log('تفاصيل الخطأ:', error.response.data);
                }
            } else {
                console.log(`❌ خطأ في الشبكة: ${error.message}`);
            }
            throw error;
        }
    }

    async getTokenInfo(tokenAddress) {
        try {
            console.log(`📊 جاري الحصول على معلومات التوكن الأساسية...`);
            
            const url = `${this.baseUrl}/v1/tokens/${tokenAddress}`;
            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 15000
            });
            
            return response.data;
            
        } catch (error) {
            console.log(`⚠️ فشل في الحصول على معلومات التوكن: ${error.message}`);
            return null;
        }
    }

    formatReport(reportData, tokenAddress) {
        if (!reportData) {
            return `❌ لم يتم العثور على بيانات للتوكن: ${tokenAddress}`;
        }

        let report = `🛡️ تقرير RugCheck للتوكن
================================

📍 عنوان التوكن: ${tokenAddress}
🕒 وقت التحليل: ${new Date().toLocaleString('ar-SA')}

`;

        // معلومات أساسية
        if (reportData.token) {
            const token = reportData.token;
            report += `📊 معلومات التوكن:
==================
الاسم: ${token.name || 'غير محدد'}
الرمز: ${token.symbol || 'غير محدد'}
إجمالي المعروض: ${token.supply ? token.supply.toLocaleString() : 'غير محدد'}
القيمة السوقية: ${token.marketCap || 'غير محدد'}
عدد الحاملين: ${token.holders || 'غير محدد'}

`;
        }

        // تحليل المخاطر
        if (reportData.score !== undefined) {
            const score = reportData.score;
            let riskLevel = '';
            
            if (score >= 80) riskLevel = '🟢 آمن';
            else if (score >= 60) riskLevel = '🟡 متوسط المخاطر';
            else if (score >= 40) riskLevel = '🟠 عالي المخاطر';
            else riskLevel = '🔴 خطير جداً';

            report += `🚨 تحليل المخاطر:
=================
النتيجة: ${score} / 100
التقييم: ${riskLevel}

`;
        }

        // المخاطر المحددة
        if (reportData.risks && reportData.risks.length > 0) {
            report += `⚠️ المخاطر المكتشفة (${reportData.risks.length}):
=====================================\n`;
            
            reportData.risks.forEach((risk, index) => {
                const riskIcon = risk.level === 'danger' ? '🔴' : risk.level === 'warning' ? '🟡' : '🟢';
                report += `${index + 1}. ${riskIcon} ${risk.name}\n`;
                if (risk.description) {
                    report += `   📝 ${risk.description}\n`;
                }
                if (risk.value) {
                    report += `   📊 القيمة: ${risk.value}\n`;
                }
                report += '\n';
            });
        }

        // معلومات الحاملين
        if (reportData.holders && reportData.holders.length > 0) {
            report += `👥 أكبر الحاملين (أول 10):
========================\n`;
            
            reportData.holders.slice(0, 10).forEach((holder, index) => {
                const address = holder.address || 'غير محدد';
                const percentage = holder.percentage || 0;
                const amount = holder.amount || 'غير محدد';
                
                report += `${index + 1}. ${address.substring(0, 8)}...${address.substring(-6)}\n`;
                report += `   📊 النسبة: ${percentage}%\n`;
                report += `   💰 الكمية: ${amount}\n\n`;
            });
        }

        // معلومات السوق
        if (reportData.markets && reportData.markets.length > 0) {
            report += `💱 أسواق التداول (${reportData.markets.length}):
============================\n`;
            
            reportData.markets.forEach((market, index) => {
                report += `${index + 1}. ${market.name || 'سوق غير محدد'}\n`;
                if (market.liquidity) {
                    report += `   💧 السيولة: ${market.liquidity}\n`;
                }
                if (market.volume24h) {
                    report += `   📈 حجم التداول 24ساعة: ${market.volume24h}\n`;
                }
                report += '\n';
            });
        }

        // معلومات إضافية
        if (reportData.meta) {
            report += `ℹ️ معلومات إضافية:
==================\n`;
            Object.entries(reportData.meta).forEach(([key, value]) => {
                report += `${key}: ${value}\n`;
            });
        }

        return report;
    }

    async saveReport(reportData, tokenAddress) {
        const timestamp = Date.now();
        const baseName = `rugcheck_api_${tokenAddress}_${timestamp}`;
        
        // حفظ البيانات الخام
        const jsonPath = path.join(__dirname, `${baseName}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2), 'utf8');
        
        // حفظ التقرير المنسق
        const formattedReport = this.formatReport(reportData, tokenAddress);
        const reportPath = path.join(__dirname, `${baseName}_report.txt`);
        fs.writeFileSync(reportPath, formattedReport, 'utf8');
        
        console.log(`✅ تم حفظ التقارير:`);
        console.log(`   📊 البيانات الخام: ${jsonPath}`);
        console.log(`   📋 التقرير المنسق: ${reportPath}`);
        
        return { jsonPath, reportPath };
    }

    async analyzeToken(tokenAddress) {
        try {
            console.log(`🚀 بدء تحليل التوكن: ${tokenAddress}`);
            
            // الحصول على التقرير الرئيسي
            const reportData = await this.getTokenReport(tokenAddress);
            
            // محاولة الحصول على معلومات إضافية
            const tokenInfo = await this.getTokenInfo(tokenAddress);
            if (tokenInfo) {
                reportData.additionalInfo = tokenInfo;
            }
            
            // حفظ التقارير
            const filePaths = await this.saveReport(reportData, tokenAddress);
            
            // عرض ملخص
            console.log('\n📊 ملخص التحليل:');
            if (reportData.token) {
                console.log(`🏷️ الاسم: ${reportData.token.name || 'غير محدد'}`);
                console.log(`🎫 الرمز: ${reportData.token.symbol || 'غير محدد'}`);
            }
            
            if (reportData.score !== undefined) {
                console.log(`📈 النتيجة: ${reportData.score}/100`);
            }
            
            if (reportData.risks) {
                console.log(`⚠️ عدد المخاطر: ${reportData.risks.length}`);
            }
            
            console.log('\n🎉 تم التحليل بنجاح!');
            
            return reportData;
            
        } catch (error) {
            console.error('❌ فشل في تحليل التوكن:', error.message);
            throw error;
        }
    }
}

// الاستخدام المباشر
async function main() {
    const scraper = new SimpleRugcheckAPI();
    const tokenAddress = '9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi';
    
    try {
        await scraper.analyzeToken(tokenAddress);
    } catch (error) {
        console.error('خطأ في التشغيل:', error.message);
    }
}

// تشغيل البرنامج
if (require.main === module) {
    main();
}

module.exports = SimpleRugcheckAPI;
