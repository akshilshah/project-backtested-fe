# PWA Deployment Checklist

## ✅ Icons Created
- [x] pwa-192x192.png (13KB)
- [x] pwa-512x512.png (52KB)
- [x] pwa-maskable-192x192.png (8.8KB)
- [x] pwa-maskable-512x512.png (40KB)

## 📋 Pre-Deployment Steps

### 1. Build the App
```bash
yarn build
```

This will generate:
- `dist/manifest.webmanifest` - PWA manifest
- `dist/sw.js` - Service worker
- `dist/pwa-*.png` - Icons copied from public folder

### 2. Verify Build Output

Check that these files exist in `dist/`:
```bash
ls -la dist/manifest.webmanifest
ls -la dist/sw.js
ls -la dist/pwa-*.png
```

## 🚀 Deployment to S3/CloudFront

### Upload Files with Correct MIME Types

```bash
# 1. Upload PWA icons
aws s3 cp dist/pwa-192x192.png s3://your-bucket/ --content-type "image/png"
aws s3 cp dist/pwa-512x512.png s3://your-bucket/ --content-type "image/png"
aws s3 cp dist/pwa-maskable-192x192.png s3://your-bucket/ --content-type "image/png"
aws s3 cp dist/pwa-maskable-512x512.png s3://your-bucket/ --content-type "image/png"

# 2. Upload manifest with correct MIME type
aws s3 cp dist/manifest.webmanifest s3://your-bucket/ \
  --content-type "application/manifest+json" \
  --cache-control "max-age=3600"

# 3. Upload service worker (NO CACHE!)
aws s3 cp dist/sw.js s3://your-bucket/ \
  --content-type "application/javascript" \
  --cache-control "max-age=0, must-revalidate, no-store"

# 4. Upload workbox files (if they exist)
aws s3 cp dist/workbox-*.js s3://your-bucket/ \
  --content-type "application/javascript" \
  --cache-control "max-age=31536000, immutable" 2>/dev/null || true

# 5. Upload index.html (NO CACHE!)
aws s3 cp dist/index.html s3://your-bucket/ \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache, no-store, must-revalidate"

# 6. Upload assets
aws s3 sync dist/assets s3://your-bucket/assets \
  --exclude "*" --include "*.js" \
  --content-type "application/javascript" \
  --cache-control "max-age=31536000, immutable"

aws s3 sync dist/assets s3://your-bucket/assets \
  --exclude "*" --include "*.css" \
  --content-type "text/css" \
  --cache-control "max-age=31536000, immutable"

# 7. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 🔍 PWA Installation Requirements

For PWA to be installable on mobile, ALL these must be true:

### ✅ HTTPS
- [ ] Site served over HTTPS ✓ (you have this)

### ✅ Manifest Requirements
- [ ] Valid `manifest.webmanifest` file
- [ ] Manifest has `name` or `short_name`
- [ ] Manifest has at least one icon (192x192 or larger)
- [ ] Manifest has `start_url`
- [ ] Manifest has `display` property (standalone, fullscreen, or minimal-ui)

### ✅ Service Worker
- [ ] Service worker registered
- [ ] Service worker responds to fetch events
- [ ] Service worker served with correct MIME type

### ✅ Icons
- [ ] At least one icon 192x192 or larger
- [ ] Icons accessible (200 OK response)
- [ ] Icons served with correct MIME type (image/png)

## 🧪 Testing PWA on Mobile

### iOS Safari
1. Open https://backtested.ioinfotech.com/dashboard
2. Tap the Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Verify app icon appears
5. Launch from home screen - should open in standalone mode (no browser UI)

### Android Chrome
1. Open https://backtested.ioinfotech.com/dashboard
2. Chrome should show "Add to Home Screen" banner automatically
3. Or tap menu (3 dots) → "Add to Home Screen"
4. Verify app icon appears
5. Launch from home screen - should open in standalone mode

## 🐛 Debugging PWA Issues

### Check in Chrome DevTools (Desktop)

1. **Open DevTools → Application Tab**

2. **Check Manifest:**
   - Application → Manifest
   - Should show all properties
   - Icons should display
   - No errors in yellow/red

3. **Check Service Worker:**
   - Application → Service Workers
   - Should show status: "activated and running"
   - Should show source: `sw.js`

4. **Check Console for errors:**
   - Look for manifest errors
   - Look for service worker errors

5. **Run Lighthouse Audit:**
   - DevTools → Lighthouse
   - Select "Progressive Web App"
   - Click "Generate report"
   - Should score 90+ for PWA

### Common Issues & Fixes

#### "Manifest not found" or 404
```bash
# Verify manifest exists
curl -I https://backtested.ioinfotech.com/manifest.webmanifest

# Should return: 200 OK
# Should return: Content-Type: application/manifest+json
```

#### "Service Worker not registering"
```bash
# Verify sw.js exists
curl -I https://backtested.ioinfotech.com/sw.js

# Should return: 200 OK
# Should return: Content-Type: application/javascript
# Should return: Cache-Control with no-cache or max-age=0
```

#### "Icons not loading"
```bash
# Verify each icon
curl -I https://backtested.ioinfotech.com/pwa-192x192.png
curl -I https://backtested.ioinfotech.com/pwa-512x512.png

# Should return: 200 OK
# Should return: Content-Type: image/png
```

#### "Install prompt not showing"
- Clear browser cache and service workers
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check if already installed (check home screen)
- Visit the site multiple times (Chrome has engagement heuristics)
- On iOS: Look in Share → Add to Home Screen (no automatic prompt)

## 📱 Browser Support

### iOS Safari
- ✅ Add to Home Screen supported
- ✅ Standalone mode supported
- ⚠️  No automatic install prompt (manual only via Share button)
- ⚠️  Service Worker has limitations

### Android Chrome
- ✅ Full PWA support
- ✅ Automatic install prompt
- ✅ Service Worker full support
- ✅ Background sync, push notifications

### Desktop Chrome/Edge
- ✅ Full PWA support
- ✅ Install button in address bar
- ✅ Opens in app window

## 🔄 Quick Deploy Script

Save this as `deploy-pwa.sh`:

```bash
#!/bin/bash
set -e

BUCKET="your-s3-bucket-name"
DIST_ID="your-cloudfront-distribution-id"

echo "🏗️  Building app..."
yarn build

echo "📦 Uploading PWA files..."

# Icons
aws s3 cp dist/pwa-192x192.png s3://$BUCKET/ --content-type "image/png"
aws s3 cp dist/pwa-512x512.png s3://$BUCKET/ --content-type "image/png"
aws s3 cp dist/pwa-maskable-192x192.png s3://$BUCKET/ --content-type "image/png"
aws s3 cp dist/pwa-maskable-512x512.png s3://$BUCKET/ --content-type "image/png"

# Manifest
aws s3 cp dist/manifest.webmanifest s3://$BUCKET/ \
  --content-type "application/manifest+json" \
  --cache-control "max-age=3600"

# Service Worker (NO CACHE!)
aws s3 cp dist/sw.js s3://$BUCKET/ \
  --content-type "application/javascript" \
  --cache-control "max-age=0, no-store, must-revalidate"

# Workbox files
find dist -name "workbox-*.js" -exec aws s3 cp {} s3://$BUCKET/ \
  --content-type "application/javascript" \
  --cache-control "max-age=31536000, immutable" \;

# HTML
aws s3 cp dist/index.html s3://$BUCKET/ \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache, no-store, must-revalidate"

# JS assets
aws s3 sync dist/assets s3://$BUCKET/assets \
  --exclude "*" --include "*.js" \
  --content-type "application/javascript" \
  --cache-control "max-age=31536000, immutable" \
  --delete

# CSS assets
aws s3 sync dist/assets s3://$BUCKET/assets \
  --exclude "*" --include "*.css" \
  --content-type "text/css" \
  --cache-control "max-age=31536000, immutable" \
  --delete

# Other assets
aws s3 sync dist/assets s3://$BUCKET/assets \
  --exclude "*.js" --exclude "*.css" \
  --delete

# Logo files
aws s3 sync dist/logo s3://$BUCKET/logo --delete 2>/dev/null || true

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 Check: https://backtested.ioinfotech.com"
echo "🔍 Test with Lighthouse PWA audit"
```

Make it executable:
```bash
chmod +x deploy-pwa.sh
```

## 📊 Success Criteria

After deployment, verify:

- [ ] Lighthouse PWA score > 90
- [ ] Manifest loads without errors
- [ ] Service worker activates
- [ ] All 4 PWA icons load (200 OK)
- [ ] iOS: "Add to Home Screen" option available
- [ ] Android: Install prompt appears (or install option in menu)
- [ ] App opens in standalone mode (no browser UI)
- [ ] App works offline (after first visit)

## 🆘 Still Not Working?

1. Check CloudFront response headers include CORS
2. Verify S3 bucket CORS configuration
3. Clear all browser cache and service workers
4. Test in incognito/private mode
5. Check browser console for specific errors
6. Use Chrome DevTools → Application → Manifest for detailed errors
