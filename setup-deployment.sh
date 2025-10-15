#!/bin/bash

# =====================================================
# Employee Performance App - Deployment Setup Script
# =====================================================

echo "🚀 Employee Performance App - Deployment Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# =====================================================
# STEP 1: Check Prerequisites
# =====================================================
echo "📋 Step 1: Checking Prerequisites..."
echo "-----------------------------------"

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi
print_success "Git is installed"

# Check if node is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
print_success "Node.js is installed ($(node --version))"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm is installed ($(npm --version))"

echo ""

# =====================================================
# STEP 2: Initialize Git Repository
# =====================================================
echo "📦 Step 2: Initializing Git Repository..."
echo "----------------------------------------"

if [ -d .git ]; then
    print_warning "Git repository already initialized"
else
    git init
    print_success "Git repository initialized"
fi

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    print_warning "Git remote 'origin' already exists: $(git remote get-url origin)"
else
    echo ""
    print_info "Please enter your GitHub repository URL (e.g., https://github.com/username/repo.git):"
    read -r REPO_URL
    
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        print_success "Git remote added: $REPO_URL"
    else
        print_warning "No remote URL provided. You can add it later with: git remote add origin <url>"
    fi
fi

echo ""

# =====================================================
# STEP 3: Install Dependencies
# =====================================================
echo "📥 Step 3: Installing Dependencies..."
echo "-----------------------------------"

print_info "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

print_info "Installing backend dependencies..."
cd server
npm install
cd ..
print_success "Backend dependencies installed"

echo ""

# =====================================================
# STEP 4: Create Environment Files
# =====================================================
echo "🔐 Step 4: Setting Up Environment Variables..."
echo "--------------------------------------------"

# Frontend .env
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Created .env file from .env.example"
    print_warning "Please edit .env and add your Supabase credentials"
else
    print_warning ".env already exists, skipping..."
fi

# Backend .env
if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    print_success "Created server/.env file from server/.env.example"
    print_warning "Please edit server/.env and add your database and email credentials"
else
    print_warning "server/.env already exists, skipping..."
fi

echo ""

# =====================================================
# STEP 5: Build Frontend
# =====================================================
echo "🔨 Step 5: Building Frontend..."
echo "-----------------------------"

print_info "Running production build..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

echo ""

# =====================================================
# STEP 6: Git Commit
# =====================================================
echo "💾 Step 6: Committing Changes..."
echo "------------------------------"

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "Initial commit - Employee Performance Monitoring App"
    print_success "Changes committed"
    
    # Ask if user wants to push
    echo ""
    print_info "Do you want to push to GitHub now? (y/n)"
    read -r PUSH_NOW
    
    if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
        git branch -M main
        git push -u origin main
        if [ $? -eq 0 ]; then
            print_success "Code pushed to GitHub"
        else
            print_error "Failed to push to GitHub. You may need to authenticate or check your remote URL."
        fi
    else
        print_info "You can push later with: git push -u origin main"
    fi
else
    print_warning "No changes to commit"
fi

echo ""

# =====================================================
# COMPLETION
# =====================================================
echo "=============================================="
echo "🎉 Setup Complete!"
echo "=============================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Setup Supabase:"
echo "   - Go to https://supabase.com"
echo "   - Create a new project"
echo "   - Run the SQL script from database/schema.sql"
echo "   - Copy your connection details to server/.env"
echo ""
echo "2. Update Environment Variables:"
echo "   - Edit .env with your Supabase credentials"
echo "   - Edit server/.env with database and email credentials"
echo ""
echo "3. Deploy Backend:"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repository"
echo "   - Set root directory to 'server'"
echo "   - Add environment variables from server/.env"
echo ""
echo "4. Deploy Frontend:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Add environment variables from .env"
echo "   - Deploy!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
print_success "Happy deploying! 🚀"
