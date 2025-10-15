#!/bin/bash

# =====================================================
# Deployment Verification Script
# Test your deployment after it's live
# =====================================================

echo "🔍 Deployment Verification Tool"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get URLs from user
echo "Please enter your deployment URLs:"
echo ""
read -p "Frontend URL (e.g., https://your-app.vercel.app): " FRONTEND_URL
read -p "Backend URL (e.g., https://your-app.up.railway.app): " BACKEND_URL

echo ""
echo "Testing deployment..."
echo ""

# Test Frontend
echo "1️⃣  Testing Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}✗ Frontend returned HTTP $FRONTEND_STATUS${NC}"
fi

# Test Backend
echo "2️⃣  Testing Backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)
if [ "$BACKEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Backend is accessible (HTTP $BACKEND_STATUS)${NC}"
else
    echo -e "${RED}✗ Backend returned HTTP $BACKEND_STATUS${NC}"
fi

# Test Backend Health
echo "3️⃣  Testing Backend Health Endpoint..."
HEALTH_RESPONSE=$(curl -s $BACKEND_URL/api/health)
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# Test CORS
echo "4️⃣  Testing CORS Configuration..."
CORS_HEADER=$(curl -s -H "Origin: $FRONTEND_URL" -I $BACKEND_URL | grep -i "access-control-allow-origin")
if [[ ! -z "$CORS_HEADER" ]]; then
    echo -e "${GREEN}✓ CORS is configured${NC}"
    echo "   $CORS_HEADER"
else
    echo -e "${YELLOW}⚠ CORS might need configuration${NC}"
fi

# Test SSL
echo "5️⃣  Testing SSL Certificates..."
if [[ $FRONTEND_URL == https* ]]; then
    echo -e "${GREEN}✓ Frontend uses HTTPS${NC}"
else
    echo -e "${RED}✗ Frontend should use HTTPS${NC}"
fi

if [[ $BACKEND_URL == https* ]]; then
    echo -e "${GREEN}✓ Backend uses HTTPS${NC}"
else
    echo -e "${RED}✗ Backend should use HTTPS${NC}"
fi

echo ""
echo "================================"
echo "📊 Verification Summary"
echo "================================"

if [ "$FRONTEND_STATUS" == "200" ] && [ "$BACKEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ All basic checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open $FRONTEND_URL in your browser"
    echo "2. Try logging in with demo account"
    echo "3. Test creating a task"
    echo "4. Check email notifications"
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "- Check Vercel deployment logs"
    echo "- Check Railway deployment logs"
    echo "- Verify environment variables"
    echo "- Check CORS configuration"
fi

echo ""
echo "For detailed logs:"
echo "- Vercel: https://vercel.com/dashboard"
echo "- Railway: https://railway.app/dashboard"
echo "- Supabase: https://app.supabase.com"
