# Quick Reference: Netlify Deployment Scenarios

## Scenario 1: Backend on Same Domain (via Netlify Proxy)

### Best for: Single domain setup

**Configuration:**
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: '/api'
};
```

**netlify.toml:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-api.com/api/:splat"
  status = 200
  force = true
```

**Setup steps:**
1. Deploy backend somewhere (Heroku, AWS, etc.)
2. Update netlify.toml with your backend URL
3. Push to GitHub
4. Netlify auto-deploys

**Pros:** Simple, single domain, looks professional
**Cons:** Netlify proxy adds slight latency

---

## Scenario 2: Separate Backend Domain (Direct API Calls)

### Best for: Microservices, scaling backend independently

**Configuration:**
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.example.com/api'
};
```

**Backend CORS (WebConfig.java):**
```java
.allowedOrigins("https://your-domain.netlify.app")
```

**Setup steps:**
1. Deploy backend with public API
2. Ensure CORS allows Netlify domain
3. Update environment.prod.ts with backend URL
4. Push to GitHub
5. Netlify deploys frontend

**Pros:** Clear separation, scale independently
**Cons:** Need CORS configuration, two domains

---

## Scenario 3: Using Environment Variables

### Best for: Multiple environments (staging, production)

**Configuration:**
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: process.env['API_BASE_URL'] || 'https://api.example.com/api'
};
```

**Netlify Environment Variables:**
- `API_BASE_URL = https://api.example.com/api`

**Setup steps:**
1. Set environment variables in Netlify UI
2. Code uses the environment variable
3. Easy to change without rebuilding

**Pros:** Flexible, no rebuild needed
**Cons:** Requires environment variable setup

---

## Image Upload Solutions

### Option A: Local File System (Development Only)
- Files store in `uploads/` folder on backend server
- OK for local/testing
- NOT suitable for Netlify (stateless)

### Option B: AWS S3 (Recommended for Production)
```
Cost: ~$1-5/month for small usage
Pros: Scalable, reliable, CDN integration
Cons: Requires AWS account setup
```

**Setup:**
1. Create AWS S3 bucket
2. Get access key and secret
3. Set environment variables on backend
4. Update FileStorageService to use S3

### Option C: Cloudinary (Easiest)
```
Cost: Free tier available, generous limits
Pros: Easy setup, great UI
Cons: Vendor lock-in
```

**Setup:**
1. Sign up at cloudinary.com
2. Get cloud name and API key
3. Update backend to use Cloudinary API
4. Set environment variables

### Option D: Firebase Storage
```
Cost: Free tier, pay-as-you-go
Pros: Google-backed, real-time database
Cons: Google ecosystem required
```

**Setup:**
1. Create Firebase project
2. Enable Cloud Storage
3. Get credentials
4. Update backend authentication

---

## Backend Deployment Platforms

| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| **Heroku** | Free/Paid | Easy deployment, auto-deploy from GitHub | Limited free tier (sleeping) |
| **AWS EC2** | $5-50/mo | Full control, scalable | Requires DevOps knowledge |
| **Railway** | Free/Paid | Modern, simple, GitHub integration | Limited free tier |
| **Render** | Free/Paid | Easy deployment, free tier | Limited free tier |
| **DigitalOcean** | $5-50/mo | Simple, good performance | Requires server management |
| **Replit** | Free/Paid | Quick setup, collaborative | Limited resources on free tier |
| **Azure App Service** | $10-50/mo | Enterprise, auto-scaling | Steeper learning curve |
| **Google Cloud Run** | Pay-per-use | Serverless, scalable | Can have cold start latency |

---

## Rapid Deployment Checklist

### Frontend (Netlify)
- [ ] Build succeeds: `npm run build`
- [ ] netlify.toml exists
- [ ] environment.prod.ts updated
- [ ] Code pushed to GitHub
- [ ] Repository connected to Netlify
- [ ] Environment variables set
- [ ] Site deployed

### Backend
- [ ] Code compiles: `mvn clean compile`
- [ ] Tests pass: `mvn test`
- [ ] Build succeeds: `mvn clean package`
- [ ] Deployed to platform
- [ ] URL accessible: curl https://your-api.com/api/items
- [ ] CORS configured
- [ ] Database configured
- [ ] File storage configured
- [ ] Environment variables set

### Testing
- [ ] Frontend loads
- [ ] API calls succeed
- [ ] File uploads work
- [ ] No CORS errors
- [ ] Images display
- [ ] Admin features work

---

## Common Commands

**Build frontend:**
```bash
npm run build
```

**Test build locally:**
```bash
npm install -g http-server
http-server dist/lostfound-frontend -p 8000
# Visit http://localhost:8000
```

**Deploy with Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist/lostfound-frontend
```

**Build backend:**
```bash
mvn clean package -DskipTests
```

**Build backend Docker image:**
```bash
docker build -t findit-api .
```

**Check backend logs on Heroku:**
```bash
heroku logs --tail
```

---

## Environment Variables Reference

### Netlify
```
API_BASE_URL=https://api.example.com/api
NODE_ENV=production
```

### Backend (application-prod.properties or .env)
```
spring.datasource.url=jdbc:mysql://host:3306/findit
spring.datasource.username=user
spring.datasource.password=pass
server.port=8080
app.upload.dir=/tmp/uploads
AWS_S3_BUCKET=bucket-name
AWS_ACCESS_KEY_ID=key
AWS_SECRET_ACCESS_KEY=secret
```

---

## Troubleshooting Matrix

| Problem | Cause | Solution |
|---------|-------|----------|
| "Cannot GET /" | SPA routing not set up | Add netlify.toml or _redirects |
| API 404 errors | Wrong API URL | Check API_BASE_URL variable |
| CORS errors | CORS not configured | Check WebConfig.java CORS origins |
| File upload fails | Storage permission issue | Use S3 or Cloudinary instead of local |
| Database connection error | Wrong credentials | Check database URL and credentials |
| Page blank after deploy | Build error | Check Netlify deploy logs |
| Images not showing | Wrong image URL | Verify file storage endpoint |

---

## Performance Tips

1. **Enable Minification** - Angular does this automatically in production build
2. **Use CDN** - Netlify provides this automatically
3. **Optimize Images** - Compress before upload
4. **Use Cloud Storage** - Offload file serving to S3/Cloudinary
5. **Enable Caching** - Configure cache headers in netlify.toml
6. **Use Code Splitting** - Angular CLI does this automatically
7. **Monitor Performance** - Use Netlify Analytics and Google Lighthouse

---

## Security Checklist

- [ ] HTTPS enabled (Netlify does automatically)
- [ ] CORS properly configured (not allowing all origins)
- [ ] API authentication working
- [ ] Sensitive data in environment variables only
- [ ] Database credentials not in code
- [ ] API rate limiting enabled
- [ ] Input validation on backend
- [ ] SQL injection protection
- [ ] XSS protection headers set

---

## Support Resources

- **Netlify Docs:** https://docs.netlify.com/
- **Angular Deployment:** https://angular.io/guide/deployment
- **Spring Boot:** https://spring.io/projects/spring-boot
- **Heroku Docs:** https://devcenter.heroku.com/ (if using Heroku)
- **AWS Documentation:** https://docs.aws.amazon.com/ (if using AWS)

---

Next Steps:
1. Choose your backend hosting platform
2. Choose image storage solution
3. Deploy backend first
4. Deploy frontend to Netlify
5. Test thoroughly
6. Monitor performance and errors
7. Plan for scaling
