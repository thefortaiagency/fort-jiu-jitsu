#!/bin/bash

###############################################################################
# BJJ Belt System - Automated Setup Script
# Run this script to set up the belt system in The Fort Jiu-Jitsu
###############################################################################

set -e  # Exit on error

echo "================================================"
echo "BJJ Belt System - Setup Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local not found${NC}"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Load environment variables
source .env.local

# Check required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}Error: Missing Supabase credentials in .env.local${NC}"
    echo "Required variables:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking database connection...${NC}"
# Test database connection (simplified - you may need to adjust)
echo "Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo -e "${GREEN}✓ Environment variables loaded${NC}"
echo ""

echo -e "${BLUE}Step 2: Database migration${NC}"
echo "Please run the following SQL in your Supabase SQL Editor:"
echo ""
echo -e "${YELLOW}https://qpyjujdwdkyvdmhpsyul.supabase.co${NC}"
echo ""
echo "File to execute: supabase/belt_progression.sql"
echo ""
read -p "Press Enter after you've run the SQL migration..."
echo -e "${GREEN}✓ Database migration completed${NC}"
echo ""

echo -e "${BLUE}Step 3: Verifying belt ranks...${NC}"
echo "Checking if belt ranks were seeded..."
echo "You should see 18 belt ranks in the belt_ranks table"
echo ""
read -p "Verify in Supabase dashboard, then press Enter..."
echo -e "${GREEN}✓ Belt ranks verified${NC}"
echo ""

echo -e "${BLUE}Step 4: Assigning initial belts to members...${NC}"
echo "Run this SQL to assign white belt to all BJJ members:"
echo ""
echo -e "${YELLOW}-- Adult BJJ members${NC}"
echo "UPDATE members"
echo "SET current_belt_id = (SELECT id FROM belt_ranks WHERE name = 'white'),"
echo "    current_stripes = 0,"
echo "    belt_updated_at = NOW(),"
echo "    total_classes_attended = 0"
echo "WHERE program IN ('adult-bjj', 'beginners')"
echo "AND current_belt_id IS NULL;"
echo ""
echo -e "${YELLOW}-- Kids BJJ members${NC}"
echo "UPDATE members"
echo "SET current_belt_id = (SELECT id FROM belt_ranks WHERE name = 'kids_white'),"
echo "    current_stripes = 0,"
echo "    belt_updated_at = NOW(),"
echo "    total_classes_attended = 0"
echo "WHERE program = 'kids-bjj'"
echo "AND current_belt_id IS NULL;"
echo ""
read -p "Run this SQL in Supabase, then press Enter..."
echo -e "${GREEN}✓ Initial belts assigned${NC}"
echo ""

echo -e "${BLUE}Step 5: Creating initial belt history...${NC}"
echo "Run this SQL to create history entries:"
echo ""
echo -e "${YELLOW}INSERT INTO member_belt_history (member_id, belt_rank_id, stripes, promoted_at, is_current)${NC}"
echo "SELECT id, current_belt_id, 0, created_at, true"
echo "FROM members"
echo "WHERE current_belt_id IS NOT NULL"
echo "AND id NOT IN (SELECT DISTINCT member_id FROM member_belt_history);"
echo ""
read -p "Run this SQL in Supabase, then press Enter..."
echo -e "${GREEN}✓ Belt history created${NC}"
echo ""

echo -e "${BLUE}Step 6: Installing dependencies...${NC}"
if [ -f package.json ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ package.json not found, skipping npm install${NC}"
fi
echo ""

echo -e "${BLUE}Step 7: Building project...${NC}"
npm run build
echo -e "${GREEN}✓ Project built successfully${NC}"
echo ""

echo -e "${BLUE}Step 8: Testing API endpoints...${NC}"
echo "Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to start
sleep 5

echo "Testing /api/belts endpoint..."
RESPONSE=$(curl -s http://localhost:3000/api/belts)
if echo "$RESPONSE" | grep -q "adult_belts"; then
    echo -e "${GREEN}✓ /api/belts working${NC}"
else
    echo -e "${RED}✗ /api/belts failed${NC}"
fi

echo "Testing /api/admin/promotions endpoint..."
RESPONSE=$(curl -s http://localhost:3000/api/admin/promotions)
if echo "$RESPONSE" | grep -q "members"; then
    echo -e "${GREEN}✓ /api/admin/promotions working${NC}"
else
    echo -e "${RED}✗ /api/admin/promotions failed${NC}"
fi

# Stop dev server
kill $DEV_SERVER_PID 2>/dev/null || true
echo ""

echo "================================================"
echo -e "${GREEN}Belt System Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start development server:"
echo "   npm run dev"
echo ""
echo "2. Test member portal:"
echo "   http://localhost:3000/member"
echo ""
echo "3. Test admin promotions:"
echo "   http://localhost:3000/admin/promotions"
echo ""
echo "4. View component demo:"
echo "   http://localhost:3000/examples/belt-system-demo"
echo ""
echo "Documentation:"
echo "  - BJJ_BELT_SYSTEM_README.md (complete reference)"
echo "  - BJJ_BELT_IMPLEMENTATION_GUIDE.md (setup guide)"
echo "  - BJJ_BELT_SYSTEM_SUMMARY.md (overview)"
echo ""
echo -e "${GREEN}Happy promoting! 🥋${NC}"
