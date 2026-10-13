#!/bin/bash

echo "🚀 GitHub Setup for Deployment"
echo "================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize git repo if not already done
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial fake call backend commit"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

echo ""
echo "📋 Next steps:"
echo "1. Create repository on GitHub:"
echo "   → Go to https://github.com/new"
echo "   → Name: fake-call-backend"
echo "   → Click Create"
echo ""
echo "2. Add remote (replace YOUR_USERNAME):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/fake-call-backend.git"
echo ""
echo "3. Push code:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Deploy:"
echo "   → Go to Railway.app"
echo "   → Connect GitHub account"
echo "   → Select your repository"
echo "   → Click Deploy"
echo ""
echo "✨ That's it! Your backend will be live in 2-3 minutes!"
