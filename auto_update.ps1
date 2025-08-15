# Git Auto Update PowerShell Script

function Show-Header {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "      Git Auto Update Tool      " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Get-GitStatus {
    Write-Host "Checking repository status..." -ForegroundColor Blue
    $status = git status --porcelain
    if ($status) {
        Write-Host "Found changes:" -ForegroundColor Green
        git status --short
        return $true
    } else {
        Write-Host "No changes detected" -ForegroundColor Green
        return $false
    }
}

function Add-Changes {
    Write-Host "Adding all changes..." -ForegroundColor Blue
    git add .
    Write-Host "Changes staged" -ForegroundColor Green
}

function Create-Commit {
    $defaultMessage = "Auto update - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    
    Write-Host "Enter commit message (Enter for auto message):" -ForegroundColor Yellow
    $commitMessage = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = $defaultMessage
    }
    
    Write-Host "Creating commit: $commitMessage" -ForegroundColor Blue
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Commit created successfully" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Failed to create commit" -ForegroundColor Red
        return $false
    }
}

function Push-Changes {
    Write-Host "Pushing to GitHub..." -ForegroundColor Blue
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS! Repository updated" -ForegroundColor Green
        Write-Host "View at: https://github.com/Legend1FR/fdfd" -ForegroundColor Cyan
        return $true
    } else {
        Write-Host "Failed to push to GitHub" -ForegroundColor Red
        return $false
    }
}

# Main execution
Show-Header

if (Get-GitStatus) {
    Add-Changes
    if (Create-Commit) {
        Push-Changes
    }
} else {
    Write-Host "No changes to update" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
