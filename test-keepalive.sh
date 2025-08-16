#!/bin/bash

# 🚀 Quick Test Script for Keep Alive System
# اختبار سريع لنظام Keep Alive

echo "🔄 Testing Keep Alive System..."
echo "==============================="

# متغيرات
RENDER_URL="${RENDER_EXTERNAL_URL:-https://fdfd-i8p9.onrender.com}"
ENDPOINTS=("/ping" "/health" "/status" "/keep-alive-status")

echo "📍 Target URL: $RENDER_URL"
echo "🕐 Test time: $(date)"
echo ""

# اختبار كل endpoint
for endpoint in "${ENDPOINTS[@]}"; do
    echo "🧪 Testing: $RENDER_URL$endpoint"
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.txt "$RENDER_URL$endpoint" --max-time 10)
        http_code=${response: -3}
        
        if [ "$http_code" == "200" ]; then
            echo "✅ SUCCESS ($http_code)"
            if [ "$endpoint" == "/ping" ]; then
                response_body=$(cat /tmp/response.txt)
                echo "   Response: $response_body"
            fi
        else
            echo "❌ FAILED ($http_code)"
        fi
    else
        echo "⚠️  curl not found, skipping test"
    fi
    echo ""
done

# تنظيف
rm -f /tmp/response.txt

echo "✅ Keep Alive Test Complete!"
echo "💡 For detailed monitoring, visit: $RENDER_URL/keep-alive-status"
