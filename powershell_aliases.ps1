# إضافة هذا إلى PowerShell Profile
# تشغيل: notepad $PROFILE

function GitPush {
    param([string]$message = "Quick update - $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
    
    git add .
    git commit -m $message
    git push
    
    Write-Host "✅ Repository updated!" -ForegroundColor Green
    Write-Host "🌐 View at: https://github.com/Legend1FR/fdfd" -ForegroundColor Cyan
}

# استخدام:
# GitPush
# أو
# GitPush "رسالة مخصصة"

Set-Alias -Name gp -Value GitPush
Set-Alias -Name push -Value GitPush

Write-Host "✅ Git aliases loaded!" -ForegroundColor Green
Write-Host "📝 Available commands:"
Write-Host "   • gp            - Quick push"
Write-Host "   • push          - Quick push"
Write-Host "   • GitPush       - Quick push"
Write-Host "   • GitPush 'msg' - Push with custom message"
