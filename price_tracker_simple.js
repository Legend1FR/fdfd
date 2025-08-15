// نظام جلب الأسعار المبسط - بديل عن puppeteer

// دالة جلب السعر باستخدام API مبسط
async function getTokenPriceSimple(token) {
  console.log(`[${token}] 💰 Fetching price...`);
  
  try {
    // محاولة متعددة APIs لضمان الحصول على السعر
    const priceAPIs = [
      {
        name: 'DexScreener',
        url: `https://api.dexscreener.com/latest/dex/tokens/${token}`,
        parser: (data) => {
          if (data.pairs && data.pairs.length > 0) {
            return parseFloat(data.pairs[0].priceUsd);
          }
          return null;
        }
      },
      {
        name: 'CoinGecko',
        url: `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${token}&vs_currencies=usd`,
        parser: (data) => {
          if (data[token] && data[token].usd) {
            return parseFloat(data[token].usd);
          }
          return null;
        }
      },
      {
        name: 'Jupiter',
        url: `https://price.jup.ag/v4/price?ids=${token}`,
        parser: (data) => {
          if (data.data && data.data[token] && data.data[token].price) {
            return parseFloat(data.data[token].price);
          }
          return null;
        }
      }
    ];

    for (const api of priceAPIs) {
      try {
        console.log(`[${token}] Trying ${api.name}...`);
        
        const options = {
          hostname: new URL(api.url).hostname,
          port: 443,
          path: new URL(api.url).pathname + new URL(api.url).search,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          }
        };

        const price = await new Promise((resolve) => {
          const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              try {
                const jsonData = JSON.parse(data);
                const price = api.parser(jsonData);
                resolve(price);
              } catch (parseError) {
                console.log(`[${token}] خطأ في تحليل ${api.name}: ${parseError.message}`);
                resolve(null);
              }
            });
          });

          req.on('error', (error) => {
            console.log(`[${token}] خطأ في ${api.name}: ${error.message}`);
            resolve(null);
          });

          req.setTimeout(10000, () => {
            console.log(`[${token}] انتهت مهلة ${api.name}`);
            req.abort();
            resolve(null);
          });

          req.end();
        });

        if (price && price > 0) {
          console.log(`[${token}] ✅ Price fetched from ${api.name}: $${price}`);
          return price;
        }

      } catch (apiError) {
        console.log(`[${token}] فشل ${api.name}: ${apiError.message}`);
        continue;
      }
    }

    console.log(`[${token}] ❌ فشل جلب السعر من جميع المصادر`);
    return null;

  } catch (error) {
    console.error(`[${token}] ❌ خطأ عام في جلب السعر: ${error.message}`);
    return null;
  }
}

// دالة مراقبة الأسعار المبسطة
async function trackTokenPriceSimple(token) {
  console.log(`[${token}] 🚀 بدء مراقبة السعر المبسطة...`);
  
  // جلب السعر الأول
  let firstPrice = await getTokenPriceSimple(token);
  if (!firstPrice) {
    console.log(`[${token}] ❌ فشل في جلب السعر الأول، إعادة المحاولة...`);
    // إعادة محاولة مرة واحدة
    await new Promise(resolve => setTimeout(resolve, 5000));
    firstPrice = await getTokenPriceSimple(token);
    
    if (!firstPrice) {
      console.log(`[${token}] ❌ فشل نهائي في جلب السعر`);
      return;
    }
  }

  // حفظ السعر الأول
  if (trackedTokens[token]) {
    trackedTokens[token].firstPrice = firstPrice;
    trackedTokens[token].currentPrice = firstPrice;
    trackedTokens[token].lastPriceTime = Date.now();
    console.log(`[${token}] 💰 السعر الأول: $${firstPrice.toFixed(8)}`);
  }

  // مراقبة دورية للسعر
  const priceInterval = setInterval(async () => {
    try {
      if (!trackedTokens[token]) {
        console.log(`[${token}] توقف المراقبة - التوكن محذوف`);
        clearInterval(priceInterval);
        return;
      }

      const currentPrice = await getTokenPriceSimple(token);
      if (currentPrice && currentPrice > 0) {
        const previousPrice = trackedTokens[token].currentPrice;
        trackedTokens[token].currentPrice = currentPrice;
        trackedTokens[token].lastPriceTime = Date.now();

        // حساب التغيير
        const priceChange = ((currentPrice - firstPrice) / firstPrice) * 100;
        const priceChangeFromLast = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

        console.log(`[${token}] 💰 Current price: $${currentPrice.toFixed(8)} | Change: ${priceChange.toFixed(2)}% from first | ${priceChangeFromLast.toFixed(2)}% from last`);

        // فحص شروط التنبيه (مثال: ارتفاع 50% أو أكثر)
        if (priceChange >= 50) {
          console.log(`[${token}] 🚀 ارتفاع كبير! ${priceChange.toFixed(2)}%`);
          // هنا يمكن إضافة كود إرسال التنبيه
        }
      } else {
        console.log(`[${token}] ⚠️ فشل في جلب السعر الحالي`);
      }

    } catch (error) {
      console.error(`[${token}] خطأ في مراقبة السعر: ${error.message}`);
    }
  }, 10000); // كل 10 ثوان

  // حفظ الـ interval للتحكم به لاحقاً
  if (trackedTokens[token]) {
    trackedTokens[token].priceInterval = priceInterval;
  }
}

// دالة مساعدة لتنسيق الأسعار
function formatPrice(price) {
  if (!price || price === 0) return 'غير متاح';
  
  if (price < 0.0001) {
    return price.toExponential(2);
  } else if (price < 0.01) {
    return price.toFixed(8);
  } else if (price < 1) {
    return price.toFixed(6);
  } else {
    return price.toFixed(4);
  }
}

// دالة لعرض معلومات السعر بشكل جميل
function displayPriceInfo(token) {
  if (!trackedTokens[token]) return;
  
  const tokenData = trackedTokens[token];
  const firstPrice = tokenData.firstPrice;
  const currentPrice = tokenData.currentPrice;
  
  if (firstPrice && currentPrice) {
    const priceChange = ((currentPrice - firstPrice) / firstPrice) * 100;
    const changeEmoji = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➡️';
    
    console.log(`
🪙 ${token}
💰 السعر الأول: $${formatPrice(firstPrice)}
💰 السعر الحالي: $${formatPrice(currentPrice)}
${changeEmoji} التغيير: ${priceChange.toFixed(2)}%
⏰ آخر تحديث: ${new Date(tokenData.lastPriceTime || Date.now()).toLocaleString()}
    `);
  }
}

module.exports = {
  getTokenPriceSimple,
  trackTokenPriceSimple,
  formatPrice,
  displayPriceInfo
};
