// Simple alternative for rugcheck using direct API
const https = require('https');

// Try using direct rugcheck API
async function checkTokenSafetyAPI(token) {
  try {
    // Try direct rugcheck API (if available)
    const options = {
      hostname: 'api.rugcheck.xyz',
      port: 443,
      path: `/v1/tokens/${token}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            // Analyze data according to response structure
            if (jsonData.risk_score !== undefined) {
              const riskScore = jsonData.risk_score;
              if (riskScore <= 30) {
                resolve('GOOD');
              } else if (riskScore <= 69) {
                resolve('WARNING');
              } else {
                resolve('DANGER');
              }
            } else {
              resolve('UNKNOWN');
            }
          } catch (parseError) {
            console.log(`[${token}] JSON parsing error from API: ${parseError.message}`);
            resolve('UNKNOWN');
          }
        });
      });

      req.on('error', (error) => {
        console.log(`[${token}] API request error: ${error.message}`);
        resolve('UNKNOWN');
      });

      req.setTimeout(10000, () => {
        console.log(`[${token}] API request timeout`);
        req.abort();
        resolve('UNKNOWN');
      });

      req.end();
    });
  } catch (error) {
    console.error(`[${token}] General API error: ${error.message}`);
    return 'UNKNOWN';
  }
}

// Alternative using simple HTML page fetch
async function checkTokenSafetySimple(token) {
  try {
    const options = {
      hostname: 'rugcheck.xyz',
      port: 443,
      path: `/tokens/${token}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const htmlContent = data.toLowerCase();
            
            // Search for risk points in HTML
            const riskScoreMatch = htmlContent.match(/(\d+)\s*\/\s*100/) || 
                                 htmlContent.match(/risk[:\s]*(\d+)/i);
            
            if (riskScoreMatch) {
              const riskScore = parseInt(riskScoreMatch[1]);
              console.log(`[${token}] Found risk points: ${riskScore}`);
              
              if (riskScore <= 30) {
                resolve('GOOD');
              } else if (riskScore <= 69) {
                resolve('WARNING');
              } else {
                resolve('DANGER');
              }
            } else {
              // Search for keywords
              if (htmlContent.includes('high risk') || htmlContent.includes('dangerous') || 
                  htmlContent.includes('scam') || htmlContent.includes('honeypot')) {
                resolve('DANGER');
              } else if (htmlContent.includes('medium risk') || htmlContent.includes('warning')) {
                resolve('WARNING');
              } else if (htmlContent.includes('low risk') || htmlContent.includes('safe')) {
                resolve('GOOD');
              } else {
                resolve('UNKNOWN');
              }
            }
          } catch (parseError) {
            console.log(`[${token}] HTML parsing error: ${parseError.message}`);
            resolve('UNKNOWN');
          }
        });
      });

      req.on('error', (error) => {
        console.log(`[${token}] HTML request error: ${error.message}`);
        resolve('UNKNOWN');
      });

      req.setTimeout(15000, () => {
        console.log(`[${token}] HTML request timeout`);
        req.abort();
        resolve('UNKNOWN');
      });

      req.end();
    });
  } catch (error) {
    console.error(`[${token}] General HTML fetch error: ${error.message}`);
    return 'UNKNOWN';
  }
}

// Integrated function that tries different methods
async function checkTokenSafetyMultiMethod(token) {
  console.log(`[${token}] 🔍 Attempting to check token with multiple methods...`);
  
  // First: Try direct API
  console.log(`[${token}] Trying via API...`);
  let result = await checkTokenSafetyAPI(token);
  
  if (result !== 'UNKNOWN') {
    console.log(`[${token}] ✅ Got result from API: ${result}`);
    return result;
  }
  
  // Second: Try simple HTML
  console.log(`[${token}] Trying via simple HTML...`);
  result = await checkTokenSafetySimple(token);
  
  if (result !== 'UNKNOWN') {
    console.log(`[${token}] ✅ Got result from HTML: ${result}`);
    return result;
  }
  
  console.log(`[${token}] ⚠️ No clear result found`);
  return 'UNKNOWN';
}

module.exports = {
  checkTokenSafetyAPI,
  checkTokenSafetySimple,
  checkTokenSafetyMultiMethod
};
