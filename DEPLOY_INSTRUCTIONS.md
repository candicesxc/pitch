# Deploy to candiceshen.com/pitch/

## Current Status

✅ App is configured with `base: '/pitch/'` in `vite.config.ts`
✅ Build creates files with correct `/pitch/` paths
✅ GitHub Actions workflow created for automated deployment

## Option 1: GitHub Pages (Automated)

1. **Enable GitHub Pages in repo settings:**
   - Go to: https://github.com/candicesxc/pitch/settings/pages
   - Source: `GitHub Actions` (not "Deploy from a branch")
   - Click Save

2. **Push the workflow:**
   ```bash
   git push origin main
   ```

3. **The workflow will automatically:**
   - Build the app on every push to `main`
   - Deploy to GitHub Pages
   - Available at: `https://candicesxc.github.io/pitch/`

4. **Point your domain (if needed):**
   - In repo settings → Pages → Custom domain: `candiceshen.com`
   - Configure DNS: Add CNAME record pointing to `candicesxc.github.io`

## Option 2: Manual Deployment to Your Server

If you have direct access to your server:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` contents to `/pitch/` directory:**
   ```bash
   # Using rsync
   rsync -avz dist/ user@candiceshen.com:/path/to/public_html/pitch/
   
   # Or using SFTP/FTP client:
   # Upload all files from dist/ folder to /pitch/ directory on server
   ```

3. **Ensure server configuration:**
   - Make sure your web server serves files from `/pitch/` directory
   - All requests to `https://candiceshen.com/pitch/` should serve `index.html`
   - Asset files should be accessible at `/pitch/assets/...`

## Option 3: Manual GitHub Pages Deploy

If GitHub Actions doesn't work, use gh-pages manually:

```bash
npm run deploy
```

Then enable Pages in settings → Source: `gh-pages` branch.

## Troubleshooting

If the page is blank:
1. Check browser console for 404 errors on assets
2. Verify files are in `/pitch/` directory (not root)
3. Check that `index.html` has correct paths (`/pitch/assets/...`)
4. Ensure server is configured to serve the files correctly
