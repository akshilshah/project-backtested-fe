# CloudFront & S3 Setup for PWA

## The Console Errors You're Seeing

The errors indicate MIME type mismatches and CORS issues with CloudFront/S3:
- `NS_ERROR_CORRUPTED_CONTENT` - CloudFront serving wrong content type
- `disallowed MIME type ("text/html")` - JS modules being served as HTML

## Required CloudFront Configuration

### 1. S3 Bucket CORS Configuration

Add this CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://backtested.ioinfotech.com", "http://localhost:8081"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**How to apply:**
1. Go to S3 Console → Your bucket
2. Permissions tab → Cross-origin resource sharing (CORS)
3. Paste the JSON above

### 2. CloudFront Response Headers Policy

Create or update your CloudFront distribution with these headers:

**Option A: Using AWS Console**

1. Go to CloudFront → Your distribution
2. Behaviors tab → Edit the default behavior
3. Add Response headers policy:

```
CORS Headers:
- Access-Control-Allow-Origin: * (or your specific domain)
- Access-Control-Allow-Methods: GET, HEAD, OPTIONS
- Access-Control-Allow-Headers: *

Security Headers:
- X-Content-Type-Options: nosniff
```

**Option B: Custom Headers (CloudFront Functions)**

Create a CloudFront Function to add proper headers:

```javascript
function handler(event) {
  var response = event.response;
  var headers = response.headers;

  // CORS headers
  headers['access-control-allow-origin'] = { value: '*' };
  headers['access-control-allow-methods'] = { value: 'GET, HEAD, OPTIONS' };

  // Ensure correct MIME types
  var uri = event.request.uri;

  if (uri.endsWith('.js') || uri.includes('/assets/') && uri.includes('.js')) {
    headers['content-type'] = { value: 'application/javascript; charset=utf-8' };
  } else if (uri.endsWith('.css')) {
    headers['content-type'] = { value: 'text/css; charset=utf-8' };
  } else if (uri.endsWith('.json')) {
    headers['content-type'] = { value: 'application/json; charset=utf-8' };
  } else if (uri.endsWith('.webmanifest') || uri.endsWith('manifest.json')) {
    headers['content-type'] = { value: 'application/manifest+json; charset=utf-8' };
  }

  return response;
}
```

### 3. File Upload with Correct MIME Types

When uploading files to S3, ensure correct Content-Type metadata:

**Correct MIME types for PWA files:**

```
.js files → application/javascript
.css files → text/css
.json files → application/json
.webmanifest → application/manifest+json
.png files → image/png
.svg files → image/svg+xml
.woff2 files → font/woff2
.woff files → font/woff
.ttf files → font/ttf
```

**Using AWS CLI to upload with correct types:**

```bash
# Upload JS files
aws s3 sync dist/assets s3://your-bucket/assets \
  --exclude "*" --include "*.js" \
  --content-type "application/javascript" \
  --cache-control "public, max-age=31536000, immutable"

# Upload CSS files
aws s3 sync dist/assets s3://your-bucket/assets \
  --exclude "*" --include "*.css" \
  --content-type "text/css" \
  --cache-control "public, max-age=31536000, immutable"

# Upload manifest
aws s3 cp dist/manifest.webmanifest s3://your-bucket/ \
  --content-type "application/manifest+json" \
  --cache-control "public, max-age=3600"

# Upload service worker
aws s3 cp dist/sw.js s3://your-bucket/ \
  --content-type "application/javascript" \
  --cache-control "public, max-age=0, must-revalidate"
```

### 4. CloudFront Cache Behaviors

Configure different cache behaviors for different file types:

**For `/sw.js` (Service Worker):**
- Cache-Control: `max-age=0, must-revalidate`
- Min TTL: 0
- Max TTL: 0
- Default TTL: 0

**For `/manifest.webmanifest`:**
- Cache-Control: `max-age=3600` (1 hour)
- Min TTL: 3600
- Max TTL: 86400

**For `/assets/*` (JS/CSS bundles):**
- Cache-Control: `max-age=31536000, immutable` (1 year)
- Min TTL: 31536000
- Max TTL: 31536000

### 5. Error Pages Configuration

In CloudFront → Error Pages, add:

- 403 Error → Return 200, Response page path: `/index.html`
- 404 Error → Return 200, Response page path: `/index.html`

This enables client-side routing to work.

## Deployment Script

Create a deployment script `deploy.sh`:

```bash
#!/bin/bash

# Build the app
echo "Building app..."
yarn build

# Upload with correct MIME types
echo "Uploading to S3..."

# Upload HTML (no cache)
aws s3 cp dist/index.html s3://your-bucket/ \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache"

# Upload Service Worker (no cache)
aws s3 cp dist/sw.js s3://your-bucket/ \
  --content-type "application/javascript" \
  --cache-control "no-cache" 2>/dev/null || echo "No sw.js yet"

# Upload Manifest
aws s3 cp dist/manifest.webmanifest s3://your-bucket/ \
  --content-type "application/manifest+json" \
  --cache-control "max-age=3600" 2>/dev/null || echo "No manifest yet"

# Upload JS files
aws s3 sync dist/assets s3://your-bucket/assets \
  --exclude "*" --include "*.js" \
  --content-type "application/javascript" \
  --cache-control "max-age=31536000, immutable"

# Upload CSS files
aws s3 sync dist/assets s3://your-bucket/assets \
  --exclude "*" --include "*.css" \
  --content-type "text/css" \
  --cache-control "max-age=31536000, immutable"

# Upload images and fonts
aws s3 sync dist/assets s3://your-bucket/assets \
  --exclude "*.js" --exclude "*.css"

# Upload PWA icons
aws s3 sync dist/ s3://your-bucket/ \
  --exclude "*" --include "pwa-*.png" \
  --content-type "image/png"

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

## Quick Fix for Current Errors

To immediately fix the errors:

1. **Clear CloudFront cache:**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

2. **Update S3 metadata for existing files:**
   ```bash
   # Fix JS files
   aws s3 cp s3://your-bucket/assets/ s3://your-bucket/assets/ \
     --exclude "*" --include "*.js" \
     --content-type "application/javascript" \
     --metadata-directive REPLACE \
     --recursive
   ```

3. **Hard refresh browser:** Ctrl+Shift+R or Cmd+Shift+R

## Verification

After setup, verify:

1. Check Response Headers in DevTools Network tab:
   - JS files should have `Content-Type: application/javascript`
   - Manifest should have `Content-Type: application/manifest+json`
   - CORS headers present

2. Check Service Worker:
   - DevTools → Application → Service Workers
   - Should see "activated and running"

3. Check Manifest:
   - DevTools → Application → Manifest
   - Should show app name, icons, etc.

4. Lighthouse PWA Audit:
   - DevTools → Lighthouse → PWA
   - Should score 90+
