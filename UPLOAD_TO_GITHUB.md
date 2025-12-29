# 🚀 Upload Storyverse to GitHub

Your project is ready for upload! Since Git is not installed on your system, follow these steps to upload manually:

---

## 📦 **Option 1: GitHub Web Interface (Easiest)**

### Step 1: Create Repository
1. Go to https://github.com/new
2. **Repository name:** `storyverse`
3. **Description:** "A modern storytelling platform - Your words matter"
4. **Visibility:** Choose Public or Private
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click "Create repository"

### Step 2: Upload Files
1. On the repository page, click "uploading an existing file"
2. **Drag and drop ALL files** from `D:\storyverse\` folder into the upload area
   - OR click "choose your files" and select all
3. **Important:** Make sure to upload these key files:
   - ✅ `.github/workflows/deploy.yml` (for auto-deployment)
   - ✅ `.gitignore`
   - ✅ `package.json`
   - ✅ `vite.config.ts`
   - ✅ All `src/` files
   - ✅ `public/` folder
   - ✅ `README.md`

4. Scroll down, add commit message: `Initial commit - Complete dashboard with Figma design`
5. Click "Commit changes"

### Step 3: Enable GitHub Pages
1. Go to repository **Settings** → **Pages** (left sidebar)
2. **Source:** Select "GitHub Actions"
3. Save

🎉 **Done!** Your site will be live at: `https://YOUR_USERNAME.github.io/storyverse/`

---

## 📦 **Option 2: Install Git & Push (Recommended for Updates)**

### Step 1: Install Git
Download from: https://git-scm.com/download/win

### Step 2: Initialize & Push
Open PowerShell in `D:\storyverse\` and run:

```powershell
# Initialize repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Complete dashboard implementation"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/storyverse.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages
Same as Option 1, Step 3

---

## 🔐 **Add Secrets for GitHub Actions**

After uploading, add this secret for the deployment workflow:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click "New repository secret"
3. **Name:** `VITE_FIGMA_API_TOKEN`
4. **Value:** `figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD`
5. Click "Add secret"

---

## 📋 **What's Included**

✅ Complete dashboard with all Figma assets  
✅ Firebase authentication setup  
✅ All 34 icons and images  
✅ Activity heatmap  
✅ Story preview cards  
✅ Bottom navigation  
✅ Production build configuration  
✅ GitHub Actions deployment workflow  

---

## 🌐 **Accessing Your Site**

After GitHub Actions completes (2-3 minutes):
- **Live URL:** `https://YOUR_USERNAME.github.io/storyverse/`
- **Check deployment:** Go to **Actions** tab to see build progress

---

## 🔄 **Making Updates Later**

### With Git installed:
```bash
git add .
git commit -m "Update description"
git push
```

### Without Git:
1. Go to repository on GitHub
2. Click on the file you want to edit
3. Click the pencil icon (✏️) to edit
4. Make changes and commit

---

## 📁 **Files to Upload**

Make sure these are included:

**Root Files:**
- ✅ package.json
- ✅ vite.config.ts
- ✅ tsconfig.json
- ✅ index.html
- ✅ .gitignore
- ✅ README.md

**Folders:**
- ✅ `.github/workflows/` (deployment automation)
- ✅ `src/` (all source code)
- ✅ `public/` (static assets)

**Note:** DO NOT upload:
- ❌ node_modules/
- ❌ dist/
- ❌ .env files

These are excluded by .gitignore

---

## 🆘 **Troubleshooting**

**File size too large?**
- GitHub has 100MB per file limit
- Large files should already be excluded by .gitignore

**Deployment failing?**
- Check Actions tab for error messages
- Ensure `VITE_FIGMA_API_TOKEN` secret is added
- Verify `base: '/storyverse/'` is in vite.config.ts

**Page shows 404?**
- Wait 2-3 minutes for deployment to complete
- Check Settings → Pages is set to "GitHub Actions"
- Clear browser cache

---

## ✨ **Success Checklist**

- [ ] Repository created on GitHub
- [ ] All files uploaded
- [ ] GitHub Pages enabled
- [ ] Figma API secret added
- [ ] First deployment completed
- [ ] Site accessible at github.io URL

---

**Your Storyverse dashboard is ready to go live! 🚀**
