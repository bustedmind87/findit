# FindIt Application - Netlify Deployment Guide

## Overview
This guide covers deploying the FindIt Angular application to Netlify with full backend integration, including image uploading and all features.

---

## Prerequisites

1. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
2. **GitHub Account** - Repository should be on GitHub (or connected to Netlify)
3. **Backend Server** - Must be deployed and accessible (see Backend Deployment section)
4. **Node.js** - v18+ installed locally

---

## Part 1: Prepare the Frontend for Deployment

### Step 1: Update API Base URL

The API base URL is configured in `src/environments/environment.prod.ts`.

**Option A: Backend on Same Domain (Recommended)**
If your backend will be served from the same domain (e.g., example.com/api):
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: '/api'  // Relative URL works with reverse proxy
};
```

**Option B: Backend on Different Domain**
If your backend is on a separate domain (e.g., api.example.com):
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.example.com/api'  // Full URL
};
```

**Option C: Using Environment Variables**
For flexible deployment:
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: process.env['API_BASE_URL'] || 'https://api.example.com/api'
};
```

### Step 2: Build Locally to Test

```bash
npm run build
# or
ng build --configuration production
```

This creates the `dist/lostfound-frontend` folder. Verify the build succeeds.

---

## Part 2: Deploy to Netlify

### Option A: Connect GitHub Repository (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select GitHub and authorize
   - Choose your findit repository
   - Netlify will auto-detect the build settings:
     - Build command: `npm run build`
     - Publish directory: `dist/lostfound-frontend`
   - Click "Deploy site"

3. **Configure Environment Variables**
   - Go to Site Settings → Build & deploy → Environment
   - Add variables:
     ```
     API_BASE_URL = https://your-backend-api.com/api
     NODE_ENV = production
     ```

### Option B: Manual Deployment

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist/lostfound-frontend
   ```

---

## Part 3: Backend Deployment Options

### Option A: API on Separate Domain (Recommended for Large Scale)

**Deploy Java Backend to:**
- Heroku
- AWS (EC2, ECS, Lambda)
- Google Cloud
- Azure App Service
- Digital Ocean
- Replit
- Railway

**Steps:**
1. Ensure `application.properties` has production settings
2. Update CORS origins in `WebConfig.java` with your Netlify domain
3. Deploy backend to your chosen platform
4. Get the backend URL (e.g., `https://findit-api.herokuapp.com`)
5. Set `API_BASE_URL` environment variable in Netlify to point to it

### Option B: Same Domain via Netlify Proxy (Simpler Setup)

If you want both on same domain (Netlify frontend + external backend):

1. **Update netlify.toml**
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend-api.com/api/:splat"
     status = 200
     force = true
   ```

2. **Keep apiBaseUrl as relative:**
   ```typescript
   apiBaseUrl: '/api'
   ```

3. Netlify will proxy all `/api` requests to your backend

---

## Part 4: Image Upload Setup

### Local Development
- Files are stored in `uploads/` directory
- Works automatically with current setup

### Production (Netlify Frontend)

**Problem:** Netlify doesn't have persistent file storage
**Solution:** Upload images to cloud storage

#### Option A: AWS S3 (Recommended)

1. **Update Backend** - Create S3 upload service:
   ```java
   // Create new service: S3FileStorageService.java
   @Service
   public class S3FileStorageService {
       private AmazonS3 amazonS3;
       // Upload files to S3 bucket
   }
   ```

2. **Update Dependencies** - Add to `pom.xml`:
   ```xml
   <dependency>
       <groupId>software.amazon.awssdk</groupId>
       <artifactId>s3</artifactId>
       <version>2.20.0</version>
   </dependency>
   ```

3. **Backend Configuration** - Set environment variables:
   ```properties
   AWS_S3_BUCKET=your-bucket-name
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   ```

#### Option B: Cloudinary (Easier, Free Tier Available)

1. **Sign up** at [cloudinary.com](http://cloudinary.com)
2. **Get credentials** - Cloud Name, API Key, API Secret
3. **Update file service** to use Cloudinary API
4. **Set backend environment variables** with credentials

#### Option C: Firebase Storage

1. **Create Firebase project**
2. **Enable Cloud Storage**
3. **Update backend** to authenticate and upload to Firebase
4. **Set credentials** as environment variables

---

## Part 5: Environment Variables Setup

### In Netlify UI:

Go to **Site Settings → Build & deploy → Environment**

**Required Variables:**
```
API_BASE_URL = https://your-backend-api.com/api
NODE_ENV = production
```

**Optional Variables (for S3):**
```
AWS_S3_BUCKET = your-bucket-name
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = your-key
AWS_SECRET_ACCESS_KEY = your-secret
```

### In Backend (Deployed Server):

Create `.env` file or use platform's environment variable UI:
```properties
# application-prod.properties
spring.datasource.url=jdbc:mysql://your-db-host:3306/finddb
spring.datasource.username=dbuser
spring.datasource.password=dbpass

aws.s3.bucket=your-bucket
aws.access.key=your-key
aws.secret.key=your-secret

app.upload.dir=/tmp/uploads
```

---

## Part 6: Testing Checklist

Before going live, test:

- [ ] Frontend loads at `https://your-netlify-domain.netlify.app`
- [ ] Home page displays correctly
- [ ] Can navigate all pages
- [ ] Login/Signup works (if using backend auth)
- [ ] Can report found/lost items with file uploads
- [ ] Images upload successfully and are retrievable
- [ ] Admin dashboard loads statistics
- [ ] Claims system works
- [ ] Q&A page loads
- [ ] Mobile responsive design works
- [ ] No CORS errors in browser console
- [ ] API requests show correct URLs in Network tab

---

## Part 7: Troubleshooting

### Issue: "Cannot GET /" after deployment

**Solution:** The `netlify.toml` file with SPA routing might not be detected. Add to `_redirects` file:

Create `public/_redirects` file:
```
/*    /index.html   200
```

### Issue: API requests return 404 or CORS errors

**Check:**
1. Browser DevTools → Network tab - see actual API URL being called
2. Verify backend is running and accessible
3. Check CORS configuration in backend `WebConfig.java`
4. Ensure API_BASE_URL environment variable is set correctly

### Issue: Image uploads fail

**Check:**
1. Network tab - verify request reaches backend
2. Backend logs for upload errors
3. Check file storage location has write permissions
4. Verify multipart/form-data is properly handled

### Issue: Database connection errors

**Common causes:**
- Database not accessible from deployment server
- Credentials wrong
- Network firewall blocking connection

**Solution:** Use cloud database (AWS RDS, Firebase, MongoDB Atlas) instead of local H2

---

## Part 8: Production Recommendations

1. **Use PostgreSQL or MySQL** instead of H2 in-memory database
2. **Enable HTTPS** (Netlify does this automatically)
3. **Use cloud storage** (S3, Cloudinary, Firebase) for images
4. **Set up monitoring** and error logging
5. **Configure backups** for database
6. **Use CDN** for static assets (Netlify does this)
7. **Enable rate limiting** on backend API
8. **Hide sensitive information** - use environment variables
9. **Set up CI/CD** pipeline for automatic deployments
10. **Monitor API performance** and optimize slow endpoints

---

## Part 9: Deployment Command Summary

**Deploy via Git:**
```bash
# Push to GitHub (Netlify auto-deploys)
git add .
git commit -m "Update for production"
git push origin main
```

**Deploy via CLI:**
```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist/lostfound-frontend
```

---

## Part 10: Links & Resources

- **Netlify Documentation:** https://docs.netlify.com/
- **Angular Deployment:** https://angular.io/guide/deployment
- **Netlify Environment Variables:** https://docs.netlify.com/configure-builds/environment-variables/
- **CORS Guide:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Spring Boot CORS:** https://spring.io/blog/2015/06/08/cors-support-in-spring-framework

---

## Quick Start Checklist

- [ ] Update `environment.prod.ts` with backend URL
- [ ] Test build locally: `npm run build`
- [ ] Push to GitHub
- [ ] Connect GitHub repo to Netlify
- [ ] Set API_BASE_URL environment variable
- [ ] Configure Netlify SPA routing (already in `netlify.toml`)
- [ ] Deploy backend
- [ ] Test all features
- [ ] Monitor Netlify analytics and backend logs
- [ ] Plan image storage solution (S3 or similar)

---

## Need Help?

If you encounter issues:
1. Check Netlify Deploy logs (Site → Deploys → Deploy logs)
2. Check browser console for errors (F12 → Console)
3. Check browser Network tab for failed API calls
4. Check backend logs for server errors
5. Verify environment variables are set correctly
6. Test API endpoints directly with curl or Postman

Good luck with your deployment! 🚀
