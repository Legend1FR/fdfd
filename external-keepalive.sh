#!/bin/bash

# External Keep Alive Script for Render
# يرسل طلبات ping خارجية للحفاظ على الخدمة نشطة

# متغيرات البيئة
RENDER_URL="${RENDER_EXTERNAL_URL:-https://fdfd-i8p9.onrender.com}"
PING_INTERVAL=480  # 8 دقائق بالثواني
LOG_FILE="external_keepalive.log"

echo "🔄 External Keep Alive Script Started" | tee -a "$LOG_FILE"
echo "📍 Target URL: $RENDER_URL" | tee -a "$LOG_FILE"
echo "⏰ Ping interval: $PING_INTERVAL seconds" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# دالة إرسال ping
send_ping() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] 🏓 Sending external ping..." | tee -a "$LOG_FILE"
    
    # إرسال طلب GET لendpoint الصحة
    if curl -s -o /dev/null -w "%{http_code}\n" "$RENDER_URL/health" --max-time 30 | grep -q "200"; then
        echo "[$timestamp] ✅ External ping successful" | tee -a "$LOG_FILE"
    else
        echo "[$timestamp] ❌ External ping failed" | tee -a "$LOG_FILE"
    fi
}

# إشارة التوقف النظيف
cleanup() {
    echo "🛑 External Keep Alive Script stopping..." | tee -a "$LOG_FILE"
    exit 0
}

trap cleanup SIGINT SIGTERM

# ping فوري عند البدء
send_ping

# حلقة ping دورية
while true; do
    sleep "$PING_INTERVAL"
    send_ping
done
