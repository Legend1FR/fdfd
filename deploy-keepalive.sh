#!/bin/bash

# 🚀 Git push script للتحديثات الجديدة

echo "🔄 Preparing Keep Alive System deployment..."
echo "==============================================="

# إضافة جميع الملفات الجديدة والمُحدثة
git add .

# إنشاء commit message شامل
cat > commit_message.txt << 'EOF'
🔄 Add Keep Alive System for 24/7 operation on Render

✅ New Features:
- Internal Keep Alive service (keep-alive.js)
- External Keep Alive scripts (bash & PowerShell) 
- New endpoints: /ping, /keep-alive-status
- Real-time monitoring dashboard
- Automatic service management

🔧 Technical Improvements:
- Prevent Render "Service waking up" issues
- 8-minute ping interval (less than 15min sleep threshold)
- Smart environment detection (production-only)
- Comprehensive error handling and logging
- Statistics and health monitoring

📁 Files Added/Modified:
- keep-alive.js (new Keep Alive service)
- server.js (integrated Keep Alive + new endpoints)
- package.json (added new scripts)
- render.yaml (updated environment variables)
- external-keepalive.sh/.ps1 (external ping scripts)
- test-keepalive.sh (testing script)
- KEEP_ALIVE_README.md (comprehensive documentation)
- RENDER_DEPLOYMENT_GUIDE.md (deployment instructions)
- KEEP_ALIVE_SUMMARY.md (quick summary)

🎯 Result: Bot now runs 24/7 without interruption on Render!

Target URL: https://fdfd-i8p9.onrender.com/
Monitor at: https://fdfd-i8p9.onrender.com/keep-alive-status
EOF

# عرض محتوى الcommit message
echo "📝 Commit message:"
echo "==================="
cat commit_message.txt
echo ""
echo "==================="

# تنفيذ commit
git commit -F commit_message.txt

# حذف ملف الرسالة المؤقت
rm commit_message.txt

echo ""
echo "✅ Commit created successfully!"
echo "🚀 Ready to push to GitHub..."
echo ""
echo "📝 Next steps:"
echo "1. Run: git push origin master"
echo "2. Wait for Render auto-deployment"
echo "3. Check: https://fdfd-i8p9.onrender.com/keep-alive-status"
echo "4. Monitor logs in Render Dashboard"
echo ""
echo "🎯 Expected result: 24/7 operation without 'Service waking up' messages!"
