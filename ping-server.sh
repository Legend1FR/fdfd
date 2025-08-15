#!/bin/bash

# سكريبت بسيط لـ ping السيرفر ومنعه من النوم
# يمكن تشغيله من أي جهاز Linux/Mac أو WSL

SERVER_URL="https://cdcdcd.onrender.com"
PING_INTERVAL=480  # 8 دقائق بالثواني

echo "🚀 بدء مراقبة السيرفر: $SERVER_URL"
echo "⏰ فترة المراقبة: كل $((PING_INTERVAL / 60)) دقيقة"
echo "📅 بدء المراقبة: $(date)"
echo ""

ping_count=0
success_count=0

# دالة ping
ping_server() {
    ping_count=$((ping_count + 1))
    echo "🔍 Ping #$ping_count - $(date)"
    
    # محاولة الوصول لـ health endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL/health" --max-time 30)
    
    if [ "$response" = "200" ]; then
        success_count=$((success_count + 1))
        echo "✅ Ping نجح - Status: $response"
        
        # جلب معلومات السيرفر
        health_info=$(curl -s "$SERVER_URL/health" --max-time 10)
        uptime=$(echo "$health_info" | grep -o '"uptime":"[^"]*"' | cut -d'"' -f4)
        tokens=$(echo "$health_info" | grep -o '"trackedTokens":[0-9]*' | cut -d':' -f2)
        
        if [ ! -z "$uptime" ]; then
            echo "🕒 Server uptime: $uptime"
        fi
        if [ ! -z "$tokens" ]; then
            echo "📈 Tracked tokens: $tokens"
        fi
    else
        echo "❌ Ping فشل - Status: $response"
        
        # محاولة ping endpoint بديل
        ping_response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL/ping" --max-time 15)
        if [ "$ping_response" = "200" ]; then
            success_count=$((success_count + 1))
            echo "✅ البديل نجح - Status: $ping_response"
        else
            echo "❌ جميع المحاولات فشلت"
        fi
    fi
    
    # حساب معدل النجاح
    if [ $ping_count -gt 0 ]; then
        success_rate=$((success_count * 100 / ping_count))
        echo "📊 معدل النجاح: $success_rate% ($success_count/$ping_count)"
    fi
    echo ""
}

# دالة التعامل مع إيقاف البرنامج
cleanup() {
    echo ""
    echo "🛑 إيقاف المراقبة..."
    echo "📊 الإحصائيات النهائية:"
    echo "   - إجمالي المحاولات: $ping_count"
    echo "   - النجح: $success_count"
    echo "   - الفاشل: $((ping_count - success_count))"
    if [ $ping_count -gt 0 ]; then
        success_rate=$((success_count * 100 / ping_count))
        echo "   - معدل النجاح: $success_rate%"
    fi
    echo "📅 إنتهاء المراقبة: $(date)"
    exit 0
}

# التعامل مع Ctrl+C
trap cleanup INT TERM

# بدء المراقبة
ping_server  # ping فوري

# استمرار المراقبة
while true; do
    sleep $PING_INTERVAL
    ping_server
done
