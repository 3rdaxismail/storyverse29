# 🚀 Storyverse Deployment - Quick Reference

## Deploy Commands

```powershell
# Deploy hosting only (most common)
npm run deploy

# Deploy hosting + Firestore rules
npm run deploy:full

# Just build (for testing)
npm run build
```

## Verification Checklist

After deployment:

1. ✅ Open live site
2. ✅ Press F12 (open console)
3. ✅ Look for: `🚀 Storyverse Deployment Info`
4. ✅ Verify version matches package.json
5. ✅ Verify build time is recent

## Common Issues

### Old UI showing after deploy
```powershell
# Solution: Hard refresh
Ctrl+Shift+R  # Windows
Cmd+Shift+R   # Mac
```

### Build version shows "dev"
```powershell
# Solution: Use npm script (not manual commands)
npm run deploy  # ✅ Correct
# NOT: npm run build && firebase deploy  # ❌ Wrong
```

### Changes not deploying
```powershell
# Check build was cleaned
# dist/ should be deleted before build
# Verify in deploy script output
```

## What Changed

| Component | Fix |
|-----------|-----|
| **firebase.json** | Cache-busting headers |
| **vite.config.ts** | NetworkFirst for code files |
| **main.tsx** | Build version logging |
| **package.json** | Deploy scripts + version bump |
| **deploy.ps1** | Clean build pipeline |

## Cache Strategy

- **HTML/JS/CSS**: NetworkFirst (always check for updates)
- **Images**: CacheFirst (hashed filenames)
- **Service Worker**: No cache (always fresh)
- **index.html**: No cache (entry point)

## Emergency: Clear Everything

If all else fails:

```powershell
# 1. Clear local build
Remove-Item -Recurse -Force dist

# 2. Clear node modules (if corrupted)
Remove-Item -Recurse -Force node_modules
npm install

# 3. Build and deploy fresh
npm run deploy

# 4. Hard refresh browser
Ctrl+Shift+R

# 5. Clear browser cache completely
# Browser Settings > Privacy > Clear browsing data
```

## Success Indicators

✅ Console shows recent build time  
✅ Version matches package.json  
✅ UI matches VS Code changes  
✅ Works without hard refresh  
✅ Works across devices  

## File Checklist

**Modified:**
- ✅ firebase.json
- ✅ vite.config.ts
- ✅ src/main.tsx
- ✅ package.json

**Created:**
- ✅ deploy.ps1
- ✅ deploy-full.ps1
- ✅ DEPLOYMENT-PIPELINE-FIX.md
- ✅ DEPLOYMENT-QUICK-REF.md

---

**Next Deploy:** `npm run deploy`  
**Check Version:** Open console on live site  
**Update Version:** Edit `package.json` → `"version": "1.0.X"`
