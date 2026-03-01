# FindIt Application - Complete Startup Guide

## Overview

This guide covers starting the FindIt application locally for development and testing. The application consists of:

- **Frontend:** Angular 19.2 (port 4200)
- **Backend:** Spring Boot 3.1.4 (port 8080)
- **Database:** H2 in-memory (included with Spring Boot)

---

## Prerequisites

### System Requirements
- Node.js 18+ (check: `node --version`)
- npm 9+ (check: `npm --version`)
- Java 17+ (check: `java -version`)
- Maven 3.6+ (check: `mvn --version`)
- Git (check: `git --version`)

### Installation

#### Windows
1. **Node.js:** Download from https://nodejs.org/
2. **Java:** Download from https://www.oracle.com/java/technologies/downloads/
3. **Maven:** Download from https://maven.apache.org/ and add to PATH

#### macOS
```bash
# Using Homebrew
brew install node
brew install java
brew install maven
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install nodejs npm openjdk-17-jdk maven
```

---

## Phase 1: Prepare the Environment

### 1.1 Clone the Repository
```bash
cd c:\Users\ploka\OneDrive\Documents\GitHub\findit
# or your workspace location
```

### 1.2 Check Prerequisites
```bash
node --version    # Should be v18 or higher
npm --version     # Should be 9 or higher
java -version     # Should be 17 or higher
mvn --version     # Should be 3.6 or higher
```

### 1.3 Install Frontend Dependencies
```bash
npm install
```

This downloads all Angular and TypeScript dependencies (~500MB).

### 1.4 Verify Backend
```bash
cd backend
mvn clean compile
cd ..
```

This downloads Maven dependencies and builds the backend (~300MB).

---

## Phase 2: Start Backend Service (Spring Boot)

The backend must start first since the frontend depends on it.

### Option A: Start Backend in Terminal (Recommended for Development)

```bash
cd backend
mvn spring-boot:run
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
...
Tomcat started on port(s): 8080 (http)
Started Application in X.XXX seconds
```

The backend is running when you see `Started Application in` message.

**Port:** http://localhost:8080
**API Base:** http://localhost:8080/api

### Option B: Build and Run JAR

```bash
cd backend
mvn clean package -DskipTests
java -jar target/findit-0.0.1-SNAPSHOT.jar
```

### Option C: Start in Background (Windows PowerShell)

```powershell
# PowerShell as Administrator
CD backend
$process = Start-Process java -ArgumentList "-jar target/findit-0.0.1-SNAPSHOT.jar" -PassThru
# Later: Stop-Process -Id $process.Id
```

### Option D: Start in Background (macOS/Linux)

```bash
cd backend
nohup mvn spring-boot:run > backend.log 2>&1 &
echo $! > backend.pid
# To stop: kill $(cat backend.pid)
```

### Verify Backend is Running

```bash
# Test the health endpoint
curl http://localhost:8080/api/items

# Expected response:
# {"content":[]}
```

Or open in browser: http://localhost:8080/api/items

---

## Phase 3: Start Frontend Service (Angular)

Once backend is running, start the Angular development server in a new terminal.

```bash
npm start
```

Or explicitly:

```bash
ng serve --open
```

**Expected Output:**
```
Building for production...
✔ Compiled successfully
✔ Built successfully
...
Application bundle generated successfully...
Local: http://localhost:4200/
```

The frontend will automatically open in your browser.

**Port:** http://localhost:4200

---

## Phase 4: Verify Both Services

### 4.1 Check Backend
```bash
curl http://localhost:8080/api/items
# Should return: {"content":[]}
```

### 4.2 Check Frontend
Open http://localhost:4200 in your browser.

You should see:
- HeaderComponent with navigation
- HomePage loading
- Login/Signup options
- No CORS errors in browser console

### 4.3 View Browser Console

Press `F12` or `Ctrl+Shift+I` in your browser:

**Good Signs:**
- No red errors about CORS
- No "Cannot GET /api/items" errors
- API calls showing in Network tab

**Common Issues:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot reach backend" | Backend not running | Start backend with `mvn spring-boot:run` |
| CORS error in console | CORS not configured | Check `backend/src/main/java/com/example/config/WebConfig.java` |
| "Cannot GET /" | SPA routing issue | Frontend routing issue, not backend |
| 404 on `/api/items` | Backend not responding | Check backend console for errors |

---

## Phase 5: Test Core Features

### 5.1 Test Home Page
1. Open http://localhost:4200
2. Should load without errors
3. Check browser console (F12) for any errors

### 5.2 Test API Integration
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Interact with the app
4. All `/api/*` requests should show status 200

### 5.3 Test File Upload (Report Lost Page)
1. Navigate to "Report Lost"
2. Fill in the form
3. Select images
4. Click "Report"
5. Should succeed and redirect

**Debug:** Check Network tab for the POST request to `/api/items`

### 5.4 Test Claims (Claim Page)
1. Navigate to "Claim Item"
2. See items available for claiming
3. Click "Claim" button
4. Should show success message

**Debug:** Check Network tab for POST to `/api/claims`

### 5.5 Test Admin Dashboard
1. Navigate to "Admin" (if accessible)
2. Should load statistics from `/api/stats`
3. Should display real data from the backend

---

## Complete Startup Sequence

### Quick Start (All in One Terminal)

```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run
# Wait for "Started Application" message

# Terminal 2: Frontend (while backend is running)
npm start
# Angular will open browser automatically
```

### Startup Scripts

#### Windows (startup.bat)
```batch
@echo off
echo Starting FindIt Application...
echo.
echo Starting Backend (Terminal 1)...
start "FindIt Backend" cmd /k "cd backend && mvn spring-boot:run"
echo.
echo Waiting 10 seconds for backend to start...
timeout /t 10
echo.
echo Starting Frontend (Terminal 2)...
start "FindIt Frontend" cmd /k "npm start"
echo.
echo Both services starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:4200
pause
```

#### macOS/Linux (startup.sh)
```bash
#!/bin/bash

echo "Starting FindIt Application..."
echo ""
echo "Starting Backend..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!

echo "Waiting 10 seconds for backend..."
sleep 10

echo "Starting Frontend..."
cd ..
npm start &
FRONTEND_PID=$!

echo ""
echo "Both services started!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:4200"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
```

---

## Troubleshooting

### Backend Won't Start

**Error:** `Port 8080 already in use`

```bash
# Option A: Kill existing process on port 8080
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8080
kill -9 <PID>

# Option B: Use different port
export SERVER_PORT=8081
mvn spring-boot:run
# Update environment.ts to use port 8081
```

**Error:** `[ERROR] COMPILATION ERROR`

```bash
# Check Java version
javac -version

# Clean and rebuild
cd backend
mvn clean compile
```

**Error:** `Cannot connect to database`

```bash
# H2 should be included, but if missing:
cd backend
mvn dependency:tree | grep h2
```

### Frontend Won't Start

**Error:** `Port 4200 already in use`

```bash
# Option A: Kill existing process
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :4200
kill -9 <PID>

# Option B: Use different port
ng serve --port 4201
```

**Error:** `npm: command not found`

```bash
# Check Node installation
node --version

# Reinstall Node from https://nodejs.org/
```

**Error:** `Cannot find module @angular/core`

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Both Services Running but Not Communicating

**Error:** CORS error in browser console

1. Check backend is returning CORS headers
2. Verify `WebConfig.java` allows localhost:4200
3. Check network requests in browser DevTools

**Debug Script:**

```bash
# Check backend health
curl -v http://localhost:8080/api/items

# Should show:
# Access-Control-Allow-Origin: http://localhost:4200
# Access-Control-Allow-Credentials: true
```

### Database Connection Issues

**Error:** `Unable to create a new datasource connection`

The app uses H2 in-memory, but if rebuilding breaks it:

```bash
cd backend
mvn clean compile
# H2 is fetched automatically
```

---

## Performance Tuning

### Faster Build Times

```bash
# Skip tests during development
mvn spring-boot:run -DskipTests

# For Angular - keep running between changes
ng serve
# Automatic rebuild on file save
```

### Memory Issues

If app is slow or crashes:

```bash
# Backend: Increase heap
export JAVA_OPTS="-Xmx512m"
mvn spring-boot:run

# Frontend: Already optimized
# If slow, check Development Tools with DevTools
```

### Incremental Builds

```bash
# Don't use clean if not needed
mvn spring-boot:run
# Only rebuilds what changed

# Angular watches automatically
npm start
```

---

## Development Workflow

### 1. Start Services
```bash
# Terminal 1
cd backend
mvn spring-boot:run

# Terminal 2
npm start
```

### 2. Make Changes

**Backend Changes:**
- Edit Java files
- Maven rebuilds automatically (or refresh browser after save)

**Frontend Changes:**
- Edit TypeScript/HTML/SCSS
- Angular rebuilds automatically
- Browser hot reloads

### 3. Debug

**Backend:**
```bash
# Check logs in Terminal 1
# Look for [DEBUG] messages
```

**Frontend:**
```bash
# Press F12 in browser
# Check Console tab for errors
# Check Network tab for API calls
```

### 4. Test

```bash
# Backend tests
mvn test

# Frontend tests
ng test

# E2E tests (if configured)
ng e2e
```

---

## Stopping Services

### Graceful Shutdown

**Backend:**
```bash
# In the backend terminal: Ctrl+C
# Or kill the process
kill <PID>
```

**Frontend:**
```bash
# In the frontend terminal: Ctrl+C
```

**Both:**
```bash
# Using PIDs
kill $BACKEND_PID $FRONTEND_PID
```

---

## Environment Configuration

### For Local Development

**backend/src/main/resources/application.properties:**
```properties
spring.application.name=findit
server.port=8080
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
```

**src/environments/environment.ts:**
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api'
};
```

### To Switch Backend Port

```bash
# Start backend on custom port
SERVER_PORT=8081 mvn spring-boot:run

# Update environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/api'
};

# Restart frontend
npm start
```

---

## Continuous Development

### File Watching

Both services watch for file changes:

**Backend:**
- Modified `.java` files trigger recompilation
- Changes appear in next request

**Frontend:**
- Modified `.ts`, `.html`, `.scss` files trigger bundle rebuild
- Browser auto-refreshes

### Hot Module Replacement (HMR)

Angular supports HMR:

```bash
ng serve --hmr
# Changes reload without full refresh
```

---

## Next Steps After Starting

1. ✅ Both services running
2. ✅ Frontend accessible at http://localhost:4200
3. ✅ Backend accessible at http://localhost:8080/api
4. Test features (see Phase 5)
5. Read NETLIFY_DEPLOYMENT.md for production setup
6. Commit changes to Git

---

## Support

If you encounter issues:

1. Check the error messages in both terminal windows
2. Review browser Developer Tools (F12 → Console)
3. Check [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)
4. Review [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
5. Check backend logs for Spring Boot errors

---

## Summary

| Service | Port | URL | Start Command |
|---------|------|-----|----------------|
| Backend | 8080 | http://localhost:8080/api | `cd backend && mvn spring-boot:run` |
| Frontend | 4200 | http://localhost:4200 | `npm start` |
| H2 Console | 8080 | http://localhost:8080/h2-console | Auto-included |

Both services must be running for the application to work properly.
