#!/bin/bash
# Quick Git Update Script

echo "🔍 Checking current status..."
git status

echo ""
echo "📝 Adding all changes..."
git add .

echo ""
echo "💬 Enter commit message (or press Enter for default):"
read commit_message

if [ -z "$commit_message" ]; then
    commit_message="Quick update - $(date '+%Y-%m-%d %H:%M')"
fi

echo ""
echo "📦 Creating commit with message: $commit_message"
git commit -m "$commit_message"

echo ""
echo "🚀 Pushing to GitHub..."
git push

echo ""
echo "✅ Update completed successfully!"
echo "🌐 Check your repository at: https://github.com/Legend1FR/fdfd"
