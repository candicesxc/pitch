# Push App to GitHub

## Footer Added ✅
The copyright footer has been added to all generated pitch pages:
- "© 2026 Candice Shen. All rights reserved."
- "Built with AI while backed by 100% true info"

## Push to GitHub Repo "pitch"

Run these commands in your terminal:

```bash
cd "/Users/xinchenshen/Desktop/Vibe Coding/Personal Pitch"

# Update remote to point to candicesxc/pitch
git remote set-url origin https://github.com/candicesxc/pitch.git

# Verify remote
git remote -v

# Add all files
git add .

# Commit changes
git commit -m "Add Personal Pitch Generator app with footer"

# Push to GitHub
git push -u origin main
```

If the repo doesn't exist yet, create it first:
1. Go to https://github.com/new
2. Repository name: `pitch`
3. Make it public or private (your choice)
4. Don't initialize with README (we already have files)
5. Click "Create repository"
6. Then run the commands above

## Deploy to GitHub Pages (Optional)

To host the app on GitHub Pages:

```bash
# Install gh-pages package
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

Then enable GitHub Pages in repo settings → Pages → Source: `gh-pages` branch.
