# Deploy to candiceshen.com/pitch/

## Build the App

The app is configured with `base: '/pitch/'` in `vite.config.ts`. 

```bash
npm run build
```

This creates a `dist/` folder with all the static files.

## Deployment Options

### Option 1: GitHub Pages (Recommended)

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add deploy script to `package.json`:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. Deploy:
```bash
npm run deploy
```

4. Enable GitHub Pages in repo settings:
   - Settings → Pages
   - Source: `gh-pages` branch
   - Path: `/ (root)`

### Option 2: Direct Upload to Server

If you have SSH/FTP access to candiceshen.com:

1. Build the app:
```bash
npm run build
```

2. Upload the contents of `dist/` folder to `/pitch/` directory on your server:
```bash
# Example with rsync
rsync -avz dist/ user@candiceshen.com:/path/to/pitch/

# Or use FTP/SFTP client to upload dist/ contents to /pitch/ directory
```

### Option 3: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Important Notes

- The app is configured for `/pitch/` subdirectory
- All asset paths are relative to `/pitch/`
- Make sure your server serves the files correctly at that path
