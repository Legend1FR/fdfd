const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class AdvancedRugcheckScraper {
    constructor() {
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        };
        this.baseApiUrl = 'https://api.rugcheck.xyz';
    }

    async scrapeRugcheckToken(tokenAddress) {
        try {
            console.log(`🔍 جاري تحليل التوكن: ${tokenAddress}`);
            
            // محاولة الحصول على البيانات من API مباشرة
            const apiData = await this.getTokenDataFromAPI(tokenAddress);
            
            // الحصول على بيانات إضافية من الصفحة الرئيسية
            const webData = await this.getWebPageData(tokenAddress);
            
            // دمج البيانات
            const combinedData = this.combineData(apiData, webData, tokenAddress);
            
            return combinedData;
            
        } catch (error) {
            console.error('❌ خطأ في تحليل التوكن:', error.message);
            throw error;
        }
    }

    async getTokenDataFromAPI(tokenAddress) {
        const apiEndpoints = [
            `/v1/tokens/${tokenAddress}/report`,
            `/v1/tokens/${tokenAddress}`,
            `/v1/tokens/${tokenAddress}/risks`,
            `/v1/tokens/${tokenAddress}/holders`,
            `/v1/tokens/${tokenAddress}/markets`
        ];

        const apiData = {};

        for (const endpoint of apiEndpoints) {
            try {
                console.log(`📡 جاري الاستعلام: ${this.baseApiUrl}${endpoint}`);
                const response = await axios.get(`${this.baseApiUrl}${endpoint}`, {
                    headers: this.headers,
                    timeout: 15000
                });
                
                const endpointName = endpoint.split('/').pop();
                apiData[endpointName] = response.data;
                
                console.log(`✅ تم الحصول على بيانات: ${endpointName}`);
                
                // تأخير قصير بين الطلبات
                await this.delay(1000);
                
            } catch (error) {
                console.log(`⚠️ فشل في الحصول على ${endpoint}: ${error.message}`);
                apiData[endpoint.split('/').pop()] = null;
            }
        }

        return apiData;
    }

    async getWebPageData(tokenAddress) {
        try {
            const url = `https://rugcheck.xyz/tokens/${tokenAddress}`;
            console.log(`🌐 جاري تحليل الصفحة: ${url}`);
            
            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 30000
            });

            const $ = cheerio.load(response.data);
            
            return {
                title: $('title').text(),
                metaDescription: $('meta[name="description"]').attr('content'),
                rawHtml: response.data,
                scripts: this.extractScripts($),
                stylesheets: this.extractStylesheets($)
            };
            
        } catch (error) {
            console.log(`⚠️ فشل في تحليل الصفحة: ${error.message}`);
            return null;
        }
    }

    combineData(apiData, webData, tokenAddress) {
        const timestamp = new Date().toISOString();
        
        // استخراج البيانات الرئيسية
        const report = apiData.report || {};
        const tokenInfo = apiData[tokenAddress] || {};
        const risks = apiData.risks || {};
        const holders = apiData.holders || {};
        const markets = apiData.markets || {};

        // تحليل المخاطر
        const riskAnalysis = this.analyzeRisks(risks, report);
        
        // تحليل أصحاب التوكن
        const holderAnalysis = this.analyzeHolders(holders);
        
        // تحليل الأسواق
        const marketAnalysis = this.analyzeMarkets(markets);

        const combinedData = {
            tokenAddress: tokenAddress,
            timestamp: timestamp,
            webInfo: webData,
            
            // معلومات أساسية
            tokenOverview: {
                name: tokenInfo.name || 'غير محدد',
                symbol: tokenInfo.symbol || 'غير محدد',
                supply: tokenInfo.supply || 'غير محدد',
                creator: tokenInfo.creator || 'غير محدد',
                creatorBalance: tokenInfo.creatorBalance || 'غير محدد',
                marketCap: tokenInfo.marketCap || 'غير محدد',
                holders: tokenInfo.holders || 'غير محدد',
                mintAuthority: tokenInfo.mintAuthority || 'غير محدد'
            },

            // تحليل المخاطر
            riskAnalysis: riskAnalysis,
            
            // تحليل أصحاب التوكن
            holderAnalysis: holderAnalysis,
            
            // تحليل الأسواق
            marketAnalysis: marketAnalysis,
            
            // البيانات الخام
            rawApiData: {
                report: report,
                tokenInfo: tokenInfo,
                risks: risks,
                holders: holders,
                markets: markets
            }
        };

        return combinedData;
    }

    analyzeRisks(risks, report) {
        const analysis = {
            overallScore: 'غير محدد',
            riskLevel: 'غير محدد',
            dangers: [],
            warnings: [],
            summary: 'لم يتم العثور على بيانات المخاطر'
        };

        if (risks && risks.score) {
            analysis.overallScore = `${risks.score} / 100`;
            
            if (risks.score >= 80) analysis.riskLevel = 'آمن';
            else if (risks.score >= 60) analysis.riskLevel = 'متوسط المخاطر';
            else if (risks.score >= 40) analysis.riskLevel = 'عالي المخاطر';
            else analysis.riskLevel = 'خطير جداً';
        }

        if (risks && risks.risks) {
            risks.risks.forEach(risk => {
                const riskData = {
                    name: risk.name || 'مخاطرة غير محددة',
                    description: risk.description || '',
                    level: risk.level || 'غير محدد',
                    percentage: risk.percentage || 'غير محدد'
                };

                if (risk.level === 'danger' || risk.level === 'high') {
                    analysis.dangers.push(riskData);
                } else {
                    analysis.warnings.push(riskData);
                }
            });
        }

        analysis.summary = `تم اكتشاف ${analysis.dangers.length} مخاطر عالية و ${analysis.warnings.length} تحذير`;

        return analysis;
    }

    analyzeHolders(holders) {
        const analysis = {
            totalHolders: 'غير محدد',
            topHolders: [],
            ownershipDistribution: 'غير محدد',
            summary: 'لم يتم العثور على بيانات الملكية'
        };

        if (holders && holders.holders) {
            analysis.totalHolders = holders.total || holders.holders.length;
            
            // أول 10 مالكين
            analysis.topHolders = holders.holders.slice(0, 10).map(holder => ({
                address: holder.address || 'غير محدد',
                amount: holder.amount || 'غير محدد',
                percentage: holder.percentage || 'غير محدد'
            }));

            // تحليل توزيع الملكية
            if (holders.holders.length > 0) {
                const topTenPercentage = holders.holders.slice(0, 10)
                    .reduce((sum, holder) => sum + (parseFloat(holder.percentage) || 0), 0);
                
                analysis.ownershipDistribution = `أول 10 مالكين يملكون ${topTenPercentage.toFixed(2)}%`;
            }
        }

        return analysis;
    }

    analyzeMarkets(markets) {
        const analysis = {
            totalMarkets: 0,
            markets: [],
            totalLiquidity: 'غير محدد',
            summary: 'لم يتم العثور على بيانات الأسواق'
        };

        if (markets && markets.markets) {
            analysis.totalMarkets = markets.markets.length;
            
            analysis.markets = markets.markets.map(market => ({
                address: market.address || 'غير محدد',
                pair: market.pair || 'غير محدد',
                liquidity: market.liquidity || 'غير محدد',
                lpLocked: market.lpLocked || 'غير محدد'
            }));

            // حساب إجمالي السيولة
            const totalLiq = markets.markets.reduce((sum, market) => {
                const liq = parseFloat(market.liquidity?.replace(/[^0-9.]/g, '')) || 0;
                return sum + liq;
            }, 0);

            analysis.totalLiquidity = `$${totalLiq.toLocaleString()}`;
            analysis.summary = `${analysis.totalMarkets} سوق بإجمالي سيولة ${analysis.totalLiquidity}`;
        }

        return analysis;
    }

    extractScripts($) {
        const scripts = [];
        $('script').each((i, elem) => {
            const src = $(elem).attr('src');
            const content = $(elem).html();
            scripts.push({
                src: src || null,
                content: content || null
            });
        });
        return scripts;
    }

    extractStylesheets($) {
        const stylesheets = [];
        $('link[rel="stylesheet"]').each((i, elem) => {
            stylesheets.push($(elem).attr('href'));
        });
        return stylesheets;
    }

    async saveDetailedReport(data, filename) {
        const filePath = path.join(__dirname, filename);
        
        // حفظ البيانات الكاملة
        const jsonPath = filePath.replace('.html', '_complete.json');
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
        
        // إنشاء تقرير مفصل
        const detailedReport = this.generateDetailedReport(data);
        const reportPath = filePath.replace('.html', '_detailed_report.txt');
        fs.writeFileSync(reportPath, detailedReport, 'utf8');
        
        // إنشاء تقرير HTML منسق
        const htmlReport = this.generateHtmlReport(data);
        const htmlPath = filePath.replace('.html', '_formatted_report.html');
        fs.writeFileSync(htmlPath, htmlReport, 'utf8');
        
        console.log(`✅ تم حفظ التقارير:`);
        console.log(`   📊 البيانات الكاملة: ${jsonPath}`);
        console.log(`   📋 التقرير المفصل: ${reportPath}`);
        console.log(`   🌐 التقرير المنسق: ${htmlPath}`);
    }

    generateDetailedReport(data) {
        let report = `🛡️ تقرير تحليل التوكن المفصل - RugCheck
=============================================

📍 عنوان التوكن: ${data.tokenAddress}
🕒 وقت التحليل: ${data.timestamp}

📊 معلومات التوكن الأساسية:
==============================
الاسم: ${data.tokenOverview.name}
الرمز: ${data.tokenOverview.symbol}
إجمالي المعروض: ${data.tokenOverview.supply}
المنشئ: ${data.tokenOverview.creator}
رصيد المنشئ: ${data.tokenOverview.creatorBalance}
القيمة السوقية: ${data.tokenOverview.marketCap}
عدد المالكين: ${data.tokenOverview.holders}
سلطة الإنتاج: ${data.tokenOverview.mintAuthority}

🚨 تحليل المخاطر:
=================
النتيجة الإجمالية: ${data.riskAnalysis.overallScore}
مستوى المخاطر: ${data.riskAnalysis.riskLevel}
ملخص: ${data.riskAnalysis.summary}

`;

        if (data.riskAnalysis.dangers.length > 0) {
            report += `🔴 المخاطر العالية (${data.riskAnalysis.dangers.length}):\n`;
            data.riskAnalysis.dangers.forEach((danger, i) => {
                report += `${i + 1}. ${danger.name} (${danger.percentage})\n   ${danger.description}\n\n`;
            });
        }

        if (data.riskAnalysis.warnings.length > 0) {
            report += `🟡 التحذيرات (${data.riskAnalysis.warnings.length}):\n`;
            data.riskAnalysis.warnings.forEach((warning, i) => {
                report += `${i + 1}. ${warning.name} (${warning.percentage})\n   ${warning.description}\n\n`;
            });
        }

        report += `👥 تحليل الملكية:
=================
إجمالي المالكين: ${data.holderAnalysis.totalHolders}
توزيع الملكية: ${data.holderAnalysis.ownershipDistribution}

`;

        if (data.holderAnalysis.topHolders.length > 0) {
            report += `🔝 أكبر المالكين:\n`;
            data.holderAnalysis.topHolders.forEach((holder, i) => {
                report += `${i + 1}. ${holder.address.substring(0, 8)}...${holder.address.substring(-4)} - ${holder.percentage}% (${holder.amount})\n`;
            });
        }

        report += `\n💱 تحليل الأسواق:
================
عدد الأسواق: ${data.marketAnalysis.totalMarkets}
إجمالي السيولة: ${data.marketAnalysis.totalLiquidity}
ملخص: ${data.marketAnalysis.summary}

`;

        if (data.marketAnalysis.markets.length > 0) {
            report += `📈 تفاصيل الأسواق:\n`;
            data.marketAnalysis.markets.forEach((market, i) => {
                report += `${i + 1}. ${market.pair} - السيولة: ${market.liquidity} - مقفل: ${market.lpLocked}\n`;
            });
        }

        return report;
    }

    generateHtmlReport(data) {
        return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير تحليل التوكن - ${data.tokenAddress}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .risk-high { background: #ffebee; border-left: 4px solid #f44336; }
        .risk-medium { background: #fff3e0; border-left: 4px solid #ff9800; }
        .risk-low { background: #e8f5e8; border-left: 4px solid #4caf50; }
        .token-info { background: #f3e5f5; }
        .holders { background: #e1f5fe; }
        .markets { background: #f1f8e9; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: right; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: bold; }
        .address { font-family: monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
        .percentage { font-weight: bold; color: #1976d2; }
        .warning { color: #f57c00; }
        .danger { color: #d32f2f; }
        .safe { color: #388e3c; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ تقرير تحليل التوكن - RugCheck</h1>
            <p><strong>عنوان التوكن:</strong> <span class="address">${data.tokenAddress}</span></p>
            <p><strong>وقت التحليل:</strong> ${data.timestamp}</p>
        </div>

        <div class="section token-info">
            <h2>📊 معلومات التوكن الأساسية</h2>
            <table>
                <tr><th>البيان</th><th>القيمة</th></tr>
                <tr><td>الاسم</td><td>${data.tokenOverview.name}</td></tr>
                <tr><td>الرمز</td><td>${data.tokenOverview.symbol}</td></tr>
                <tr><td>إجمالي المعروض</td><td>${data.tokenOverview.supply}</td></tr>
                <tr><td>المنشئ</td><td class="address">${data.tokenOverview.creator}</td></tr>
                <tr><td>رصيد المنشئ</td><td>${data.tokenOverview.creatorBalance}</td></tr>
                <tr><td>القيمة السوقية</td><td>${data.tokenOverview.marketCap}</td></tr>
                <tr><td>عدد المالكين</td><td>${data.tokenOverview.holders}</td></tr>
            </table>
        </div>

        <div class="section ${data.riskAnalysis.riskLevel === 'خطير جداً' ? 'risk-high' : data.riskAnalysis.riskLevel === 'عالي المخاطر' ? 'risk-medium' : 'risk-low'}">
            <h2>🚨 تحليل المخاطر</h2>
            <p><strong>النتيجة الإجمالية:</strong> <span class="percentage">${data.riskAnalysis.overallScore}</span></p>
            <p><strong>مستوى المخاطر:</strong> <span class="${data.riskAnalysis.riskLevel === 'آمن' ? 'safe' : data.riskAnalysis.riskLevel === 'خطير جداً' ? 'danger' : 'warning'}">${data.riskAnalysis.riskLevel}</span></p>
            <p><strong>ملخص:</strong> ${data.riskAnalysis.summary}</p>
        </div>

        <div class="section holders">
            <h2>👥 تحليل الملكية</h2>
            <p><strong>إجمالي المالكين:</strong> ${data.holderAnalysis.totalHolders}</p>
            <p><strong>توزيع الملكية:</strong> ${data.holderAnalysis.ownershipDistribution}</p>
        </div>

        <div class="section markets">
            <h2>💱 تحليل الأسواق</h2>
            <p><strong>عدد الأسواق:</strong> ${data.marketAnalysis.totalMarkets}</p>
            <p><strong>إجمالي السيولة:</strong> ${data.marketAnalysis.totalLiquidity}</p>
            <p><strong>ملخص:</strong> ${data.marketAnalysis.summary}</p>
        </div>
    </div>
</body>
</html>`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// دالة الاستخدام الرئيسية
async function analyzeToken(tokenAddress) {
    const scraper = new AdvancedRugcheckScraper();
    
    try {
        console.log('🚀 بدء التحليل المتقدم...');
        
        const data = await scraper.scrapeRugcheckToken(tokenAddress);
        
        const filename = `advanced_rugcheck_${tokenAddress}_${Date.now()}.html`;
        await scraper.saveDetailedReport(data, filename);
        
        console.log('\n📊 ملخص التحليل:');
        console.log(`🔹 التوكن: ${data.tokenOverview.name} (${data.tokenOverview.symbol})`);
        console.log(`🔹 النتيجة: ${data.riskAnalysis.overallScore}`);
        console.log(`🔹 مستوى المخاطر: ${data.riskAnalysis.riskLevel}`);
        console.log(`🔹 عدد المالكين: ${data.holderAnalysis.totalHolders}`);
        console.log(`🔹 عدد الأسواق: ${data.marketAnalysis.totalMarkets}`);
        
        console.log('\n🎉 تم التحليل بنجاح!');
        
        return data;
        
    } catch (error) {
        console.error('❌ فشل التحليل:', error.message);
        throw error;
    }
}

// تشغيل التحليل إذا تم استدعاؤه مباشرة
if (require.main === module) {
    const tokenAddress = '9Et4sK11v9RNZfFJ396Wt2twhbbj9gD83pkv4Yfnqxoi';
    analyzeToken(tokenAddress);
}

module.exports = { AdvancedRugcheckScraper, analyzeToken };
