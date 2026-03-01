#!/bin/bash
# FindIt Application Deployment Script
# This script helps prepare and deploy the application to Netlify

set -e  # Exit on error

echo "==========================================
FindIt Application Deployment Script
==========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Check prerequisites
echo ""
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js v18+"
    exit 1
fi
print_status "Node.js installed: $(node --version)"

if ! command -v npm &> /dev/null; then
    print_error "npm not found."
    exit 1
fi
print_status "npm installed: $(npm --version)"

if ! command -v git &> /dev/null; then
    print_warning "Git not found. You may need it for GitHub integration."
else
    print_status "Git found: $(git --version | head -n 1)"
fi

# Build the application
echo ""
echo "Building application..."
npm run build
print_status "Build completed successfully"

# Check if dist folder was created
if [ ! -d "dist/lostfound-frontend" ]; then
    print_error "Build output folder not found at dist/lostfound-frontend"
    exit 1
fi
print_status "Output folder found"

# Calculate build size
BUILD_SIZE=$(du -sh dist/lostfound-frontend | cut -f1)
echo "Build size: $BUILD_SIZE"

# Display next steps
echo ""
echo "================================================"
echo "Next Steps for Netlify Deployment:"
echo "================================================"
echo ""
echo "1. Ensure your code is committed and pushed to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Netlify deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to https://app.netlify.com"
echo "3. Click 'Add new site' → 'Import an existing project'"
echo "4. Select GitHub and authorize"
echo "5. Choose your repository (findit)"
echo "6. Keep these build settings:"
echo "   Build command: npm run build"
echo "   Publish directory: dist/lostfound-frontend"
echo ""
echo "7. Click 'Deploy site'"
echo ""
echo "8. After deployment, add Environment Variables:"
echo "   Go to Site Settings → Build & deploy → Environment"
echo ""
echo "   Add:"
echo "   API_BASE_URL = https://your-backend-api.com/api"
echo ""
echo "9. Test the deployed application"
echo ""
echo "For more information, see NETLIFY_DEPLOYMENT.md"
echo ""
print_status "Ready for deployment!"
