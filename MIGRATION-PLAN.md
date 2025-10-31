# Migration Plan: Math App to New Repository

## Objective
Move all files from the current math-app to `https://github.com/Manueltnc/starting-point-initiative-73fc32cb.git`, replacing all existing files except for any Loveable Hosting Configuration.

## Step-by-Step Migration Plan

### Phase 1: Preparation and Analysis

1. **Clone the new repository** (in a temporary location)
   ```bash
   cd ..
   git clone https://github.com/Manueltnc/starting-point-initiative-73fc32cb.git math-app-new-repo
   cd math-app-new-repo
   ```

2. **Identify Loveable Configuration Files**
   Look for any of these files/directories (common Loveable patterns):
   - `.loveable/` directory
   - `loveable.json` or `loveable.config.json`
   - `.loveableconfig`
   - `loveable.yml` or `loveable.yaml`
   - Any files in `.github/loveable/` or similar
   - Check `.gitignore` for Loveable-related entries
   - Check `package.json` for Loveable scripts or dependencies

3. **Backup Loveable Config** (if found)
   ```bash
   # Create a backup directory
   mkdir ../loveable-config-backup
   
   # Copy any Loveable files found
   # Example (adjust based on what's found):
   cp -r .loveable ../loveable-config-backup/ 2>/dev/null || true
   cp loveable.json ../loveable-config-backup/ 2>/dev/null || true
   cp loveable.config.json ../loveable-config-backup/ 2>/dev/null || true
   ```

### Phase 2: Clean New Repository

4. **Remove all existing files** (except Loveable config if found)
   ```bash
   # Remove all files except Loveable config
   # Method 1: Remove everything except specific files/dirs
   find . -maxdepth 1 -not -name '.' -not -name '.git' \
     -not -name '.loveable' -not -name 'loveable.json' \
     -not -name 'loveable.config.json' -exec rm -rf {} +
   
   # OR Method 2: If you've backed up Loveable config, just remove everything
   # git rm -r .
   # But keep .git directory
   ```

### Phase 3: Copy Files from Current App

5. **Copy all files from current math-app**
   ```bash
   # From the new repo directory, copy everything from math-app
   # Adjust paths based on your actual directory structure
   cp -r ../education-apps-unified/apps/math-app/* .
   cp -r ../education-apps-unified/apps/math-app/.* . 2>/dev/null || true
   
   # Remove .git from copied files (we want to keep the new repo's git history)
   rm -rf .git
   
   # If we backed up Loveable config, restore it
   if [ -d "../loveable-config-backup" ]; then
     cp -r ../loveable-config-backup/* .
   fi
   ```

### Phase 4: Verify and Commit

6. **Verify file structure**
   ```bash
   # Check that all files were copied
   ls -la
   
   # Verify Loveable config is present (if it existed)
   # Check for .loveable directory or loveable.json
   ```

7. **Stage and commit**
   ```bash
   git add .
   git commit -m "Migrate math-app from monorepo to standalone repository"
   ```

8. **Push to new repository**
   ```bash
   git push origin main
   # or git push origin master (depending on default branch)
   ```

## Files to Copy (Complete List)

### Configuration Files
- `package.json`
- `package.standalone.json` (if relevant)
- `tsconfig.json`
- `tsconfig.build.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vercel.json`
- `tailwind.config.js`
- `postcss.config.js`
- `.gitignore`
- `.env.example` (if exists)

### Source Code
- `src/` (entire directory)
- `index.html`

### Documentation
- `README.md`
- `CHANGES.md`
- `CONVERSION-COMPLETE.md`
- `DEPLOY-CHECKLIST.md`
- `DEPLOYMENT.md`
- `STANDALONE-DEPLOYMENT.md`
- `README-ANALYTICS.md`

### Database
- `supabase-migrations/` (entire directory)

### Build Output (optional - typically gitignored)
- `dist/` (usually in .gitignore)

## Files to Preserve from New Repo (if they exist)
- `.loveable/` directory or any Loveable configuration files
- `.git/` directory (preserve git history)

## Post-Migration Checklist

- [ ] All source files copied
- [ ] Loveable configuration preserved (if existed)
- [ ] `.gitignore` updated appropriately
- [ ] `package.json` verified
- [ ] Environment variables documented
- [ ] Git repository initialized/connected
- [ ] Files committed
- [ ] Pushed to remote
- [ ] Test clone of new repository
- [ ] Verify app builds in new location
- [ ] Update any hardcoded paths in documentation

## Important Notes

1. **Git History**: The new repository will replace all history. If you need to preserve git history from the current app, use `git subtree` or similar methods instead.

2. **Environment Variables**: Make sure to document and set up environment variables in the new repository:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Dependencies**: After copying, run `npm install` in the new repository to ensure all dependencies are installed.

4. **Loveable Hosting**: If Loveable configuration exists, it may reference specific paths or settings that need to be verified after migration.

## Alternative: PowerShell Script (Windows)

Since you're on Windows, here's a PowerShell version:

```powershell
# Step 1: Clone new repo
cd ..
git clone https://github.com/Manueltnc/starting-point-initiative-73fc32cb.git math-app-new-repo
cd math-app-new-repo

# Step 2: Backup Loveable config (if exists)
$loveableFiles = @(".loveable", "loveable.json", "loveable.config.json")
$backupDir = "..\loveable-config-backup"
New-Item -ItemType Directory -Path $backupDir -Force

foreach ($file in $loveableFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $backupDir -Recurse -Force
        Write-Host "Backed up: $file"
    }
}

# Step 3: Remove all files except .git and Loveable config
Get-ChildItem -Path . -Exclude ".git", ".loveable", "loveable.json", "loveable.config.json" | Remove-Item -Recurse -Force

# Step 4: Copy files from math-app
$sourcePath = "..\education-apps-unified\apps\math-app"
Get-ChildItem -Path $sourcePath -Exclude ".git", "node_modules", "dist" | Copy-Item -Destination . -Recurse -Force

# Step 5: Restore Loveable config
if (Test-Path $backupDir) {
    Get-ChildItem -Path $backupDir | Copy-Item -Destination . -Recurse -Force
    Remove-Item -Path $backupDir -Recurse -Force
}

# Step 6: Add and commit
git add .
git commit -m "Migrate math-app from monorepo to standalone repository"
git push origin main
```

