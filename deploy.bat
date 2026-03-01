@echo off
REM FindIt Application Deployment Script for Windows
REM This script helps prepare and deploy the application to Netlify

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo FindIt Application Deployment Script
echo ==========================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js not found. Please install Node.js v18+ from https://nodejs.org
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js installed: %NODE_VERSION%

REM Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] npm not found.
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm installed: %NPM_VERSION%

REM Check for Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Git not found. You may need it for GitHub integration.
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [OK] Git found: !GIT_VERSION!
)

REM Build the application
echo.
echo Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [X] Build failed. Check errors above.
    exit /b 1
)
echo [OK] Build completed successfully

REM Check if dist folder was created
if not exist "dist\lostfound-frontend" (
    echo [X] Build output folder not found at dist\lostfound-frontend
    exit /b 1
)
echo [OK] Output folder found

echo.
echo ================================================
echo Next Steps for Netlify Deployment:
echo ================================================
echo.
echo 1. Ensure your code is committed and pushed to GitHub:
echo    git add .
echo    git commit -m "Prepare for Netlify deployment"
echo    git push origin main
echo.
echo 2. Go to https://app.netlify.com
echo 3. Click 'Add new site' ^> 'Import an existing project'
echo 4. Select GitHub and authorize
echo 5. Choose your repository (findit)
echo 6. Keep these build settings:
echo    Build command: npm run build
echo    Publish directory: dist/lostfound-frontend
echo.
echo 7. Click 'Deploy site'
echo.
echo 8. After deployment, add Environment Variables:
echo    Go to Site Settings ^> Build and deploy ^> Environment
echo.
echo    Add:
echo    API_BASE_URL = https://your-backend-api.com/api
echo.
echo 9. Test the deployed application
echo.
echo For more information, see NETLIFY_DEPLOYMENT.md
echo.
echo [OK] Ready for deployment!
echo.
pause
