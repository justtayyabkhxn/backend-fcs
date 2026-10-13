#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Fake Call Backend - Quick Start ===${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"

# Check if MongoDB is running
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo -e "${BLUE}→ MongoDB not found locally. Starting MongoDB in Docker...${NC}"
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    sleep 3
else
    echo -e "${GREEN}✓ MongoDB client found${NC}"
fi

# Check if Docker is available for containers
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker found${NC}"
    echo -e "\n${BLUE}Option 1: Run with Docker Compose (Recommended)${NC}"
    echo "Command: docker-compose up"
    echo ""
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "\n${BLUE}Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "\n${BLUE}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env created${NC}"
    echo -e "${BLUE}→ Edit .env with your configuration${NC}"
fi

# Create logs directory
mkdir -p logs

# Start the server
echo -e "\n${BLUE}Starting Fake Call Backend...${NC}"
npm run dev

