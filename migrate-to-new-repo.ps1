# Migration Script: Math App to New Repository
# This script migrates all files from the current math-app to a new repository
# while preserving any Loveable Hosting Configuration

param(
    [string]$NewRepoUrl = "https://github.com/Manueltnc/starting-point-initiative-73fc32cb.git",
    [string]$TempCloneDir = "../math-app-new-repo",
    [string]$CurrentAppPath = "."
)

Write-Host "=== Math App Migration Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current directory
if (-not (Test-Path "$CurrentAppPath/package.json")) {
    Write-Host "Error: package.json not found. Are you in the math-app directory?" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Current app path verified: $CurrentAppPath" -ForegroundColor Green

# Step 2: Navigate to parent directory and clone new repo
$parentDir = Split-Path -Parent (Resolve-Path $CurrentAppPath)
$newRepoPath = Join-Path $parentDir (Split-Path -Leaf $TempCloneDir)

Write-Host ""
Write-Host "Step 1: Cloning new repository..." -ForegroundColor Yellow
Set-Location $parentDir

if (Test-Path $newRepoPath) {
    Write-Host "  Warning: $newRepoPath already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Path $newRepoPath -Recurse -Force
}

git clone $NewRepoUrl $newRepoPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to clone repository" -ForegroundColor Red
    exit 1
}

Set-Location $newRepoPath
Write-Host "[OK] Repository cloned successfully" -ForegroundColor Green

# Step 3: Identify and backup Loveable configuration files
Write-Host ""
Write-Host "Step 2: Checking for Loveable Hosting Configuration..." -ForegroundColor Yellow
$loveableConfigFiles = @(
    ".loveable",
    "loveable.json",
    "loveable.config.json",
    ".loveableconfig",
    "loveable.yml",
    "loveable.yaml"
)

$backupDir = Join-Path $parentDir "loveable-config-backup"
$loveableFilesFound = $false

foreach ($file in $loveableConfigFiles) {
    if (Test-Path $file) {
        if (-not $loveableFilesFound) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
            $loveableFilesFound = $true
        }
        Copy-Item -Path $file -Destination $backupDir -Recurse -Force
        Write-Host "  [OK] Backed up: $file" -ForegroundColor Green
    }
}

# Check .github directory for Loveable config
if (Test-Path ".github") {
    $githubLoveable = Join-Path ".github" "loveable"
    if (Test-Path $githubLoveable) {
        if (-not $loveableFilesFound) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
            $loveableFilesFound = $true
        }
        New-Item -ItemType Directory -Path (Join-Path $backupDir ".github") -Force | Out-Null
        Copy-Item -Path $githubLoveable -Destination (Join-Path $backupDir ".github") -Recurse -Force
        Write-Host "  [OK] Backed up: .github/loveable" -ForegroundColor Green
        $loveableFilesFound = $true
    }
}

if (-not $loveableFilesFound) {
    Write-Host "  ℹ No Loveable configuration files found" -ForegroundColor Gray
}

# Step 4: Remove all files except .git and Loveable config
Write-Host ""
Write-Host "Step 3: Removing existing files (preserving .git and Loveable config)..." -ForegroundColor Yellow

# Build exclusion list
$exclusions = @(".git")
foreach ($file in $loveableConfigFiles) {
    if (Test-Path $file) {
        $exclusions += $file
    }
}
if (Test-Path ".github") {
    $exclusions += ".github"
}

# Remove files not in exclusion list
Get-ChildItem -Path . -Force | Where-Object { 
    $name = $_.Name
    $exclude = $false
    foreach ($exc in $exclusions) {
        if ($name -eq $exc) {
            $exclude = $true
            break
        }
    }
    -not $exclude
} | Remove-Item -Recurse -Force

# If we excluded .github, check if we need to keep it
if (Test-Path ".github") {
    $githubContents = Get-ChildItem -Path ".github" -Force
    $hasLoveable = $false
    foreach ($item in $githubContents) {
        if ($item.Name -eq "loveable") {
            $hasLoveable = $true
            break
        }
    }
    if (-not $hasLoveable) {
        Remove-Item -Path ".github" -Recurse -Force
    }
}

Write-Host "[OK] Files removed" -ForegroundColor Green

# Step 5: Copy files from current math-app
Write-Host ""
Write-Host "Step 4: Copying files from current math-app..." -ForegroundColor Yellow

$sourcePath = Resolve-Path $CurrentAppPath

# Files/directories to exclude when copying
$copyExclusions = @(".git", "node_modules", "dist", ".vite", ".env", ".env.local")

Get-ChildItem -Path $sourcePath -Force | Where-Object {
    $name = $_.Name
    $exclude = $false
    foreach ($exc in $copyExclusions) {
        if ($name -eq $exc) {
            $exclude = $true
            break
        }
    }
    -not $exclude
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination . -Recurse -Force
}

Write-Host "[OK] Files copied" -ForegroundColor Green

# Step 6: Restore Loveable config if it was backed up
if ($loveableFilesFound -and (Test-Path $backupDir)) {
    Write-Host ""
    Write-Host "Step 5: Restoring Loveable configuration..." -ForegroundColor Yellow
    Get-ChildItem -Path $backupDir -Force | Copy-Item -Destination . -Recurse -Force
    Write-Host "[OK] Loveable configuration restored" -ForegroundColor Green
    
    # Cleanup backup
    Remove-Item -Path $backupDir -Recurse -Force
}

# Step 7: Verify critical files
Write-Host ""
Write-Host "Step 6: Verifying migration..." -ForegroundColor Yellow

$criticalFiles = @("package.json", "src/App.tsx", "vite.config.ts", "index.html")
$allPresent = $true

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host ""
    Write-Host "Warning: Some critical files are missing!" -ForegroundColor Red
}

# Step 8: Show git status
Write-Host ""
Write-Host "Step 7: Git status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the changes: git status" -ForegroundColor White
Write-Host "2. Check that Loveable config is preserved (if it existed)" -ForegroundColor White
Write-Host "3. Install dependencies: npm install" -ForegroundColor White
Write-Host "4. Test the build: npm run build" -ForegroundColor White
Write-Host "5. Commit and push:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Migrate math-app from monorepo to standalone repository'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "New repository location: $newRepoPath" -ForegroundColor Cyan

