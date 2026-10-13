# 🚀 Fake Call VoIP Backend - Complete Project Setup

## ✅ What's Included

A **production-ready Node.js backend** with:
- ✅ Complete Express.js server
- ✅ MongoDB database models
- ✅ JWT authentication
- ✅ All API endpoints implemented
- ✅ SIP account management
- ✅ Call simulation & scheduling
- ✅ Location tracking & geofencing
- ✅ Device management
- ✅ Push notifications setup
- ✅ Docker & Docker Compose
- ✅ Error handling & logging
- ✅ Security hardening

---

## 🎯 Quick Start (Choose One Method)

### Method 1: Docker Compose (Recommended - Easiest)

```bash
# Start everything with one command
docker-compose up

# Server runs at http://localhost:5000
# MongoDB at localhost:27017
# Redis at localhost:6379
```

### Method 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB (Docker or Local)
docker run -d -p 27017:27017 mongo:latest
# OR: mongod (if installed locally)

# 3. Start Redis (Optional for caching)
docker run -d -p 6379:6379 redis:latest

# 4. Configure environment
cp .env.example .env
# Edit .env with your settings

# 5. Start server
npm run dev
```

### Method 3: Using Start Script

```bash
chmod +x start.sh
./start.sh
```

---

## 📁 Project Structure

```
fake-call-backend/
├── app.js                    # Express server & middleware
├── models.js                 # MongoDB schemas (7 models)
├── auth.js                   # JWT authentication
├── auth.js                   # Auth endpoints
├── users_routes.js           # User profile endpoints
├── sip_routes.js             # SIP account management
├── calls_routes.js           # Call simulation endpoints
├── contacts_routes.js        # Contact management
├── locations_routes.js       # Geofencing endpoints
├── device_routes.js          # Device registration
├── package.json              # Dependencies
├── .env.example              # Config template
├── .env                      # Actual config
├── Dockerfile                # Container definition
├── docker-compose.yml        # Multi-container setup
├── start.sh                  # Quick start script
├── .gitignore               # Git ignore rules
└── logs/                     # Application logs
```

---

## 🔧 Configuration

### 1. Basic Setup (.env)

```bash
# Copy template
cp .env.example .env

# Edit .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fake-call-app
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 2. For Production

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=generate-with-openssl-rand-base64-32
DOMAIN=yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

### 3. With Twilio SIP

```bash
SIP_PROVIDER=twilio
SIP_SERVER=sip.twilio.com
SIP_USERNAME=your_twilio_account_sid
SIP_PASSWORD=your_twilio_auth_token
```

---

## 📊 Database Setup

### MongoDB (Local)
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify connection
mongosh localhost:27017
```

### MongoDB Atlas (Cloud)
```bash
# 1. Create cluster at https://www.mongodb.com/cloud/atlas
# 2. Get connection string
# 3. Add to .env:
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
```

### Collections Created Automatically
- users
- sipaccounts
- calls
- scheduledcalls
- contacts
- locations
- devices

---

## 🧪 Test the Backend

### 1. Health Check
```bash
curl http://localhost:5000/health
# Response: {"status":"OK","timestamp":"2026-10-14T..."}
```

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "phone": "+1234567890"
  }'

# Response:
# {
#   "message": "User registered successfully",
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { "id": "...", "username": "testuser", ... }
# }
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### 4. Add SIP Account
```bash
TOKEN="your_token_from_login"

curl -X POST http://localhost:5000/api/sip/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sipUsername": "user@twilio.com",
    "sipPassword": "twilio_password",
    "sipServer": "sip.twilio.com",
    "sipPort": 5060,
    "sipDomain": "twilio.com",
    "displayName": "Test User"
  }'
```

### 5. Simulate Call
```bash
curl -X POST http://localhost:5000/api/calls/simulate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromNumber": "+919876543210",
    "toNumber": "+911234567890",
    "fromName": "John Doe",
    "duration": 30,
    "autoAnswer": false
  }'
```

### 6. Schedule Call
```bash
curl -X POST http://localhost:5000/api/calls/schedule \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromNumber": "+919876543210",
    "toNumber": "+911234567890",
    "frequency": "daily",
    "callDuration": 60,
    "autoAnswer": true
  }'
```

### 7. Get Call History
```bash
curl http://localhost:5000/api/calls/history \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐳 Docker Operations

### Start All Services
```bash
docker-compose up
```

### Start in Background
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs backend
docker-compose logs mongodb
docker-compose logs redis
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

### Clean Everything
```bash
docker-compose down -v
```

---

## 📈 API Endpoints (Complete List)

### Authentication
```
POST   /api/auth/register      Register user
POST   /api/auth/login         Login user
POST   /api/auth/refresh       Refresh JWT token
```

### User Profile
```
GET    /api/users/profile      Get profile
PUT    /api/users/profile      Update profile
GET    /api/users/preferences  Get preferences
PUT    /api/users/preferences  Update preferences
DELETE /api/users/account      Delete account
```

### SIP Accounts
```
POST   /api/sip/accounts       Add SIP account
GET    /api/sip/accounts       List accounts
GET    /api/sip/accounts/:id   Get account details
PUT    /api/sip/accounts/:id   Update account
DELETE /api/sip/accounts/:id   Remove account
POST   /api/sip/accounts/:id/register     Register
POST   /api/sip/accounts/:id/unregister   Unregister
GET    /api/sip/accounts/:id/status       Check status
```

### Call Simulation
```
POST   /api/calls/simulate     Start fake call
POST   /api/calls/schedule     Schedule calls
GET    /api/calls/history      Call history
GET    /api/calls/:callId      Call details
PUT    /api/calls/:callId/status  Update status
DELETE /api/calls/scheduled/:id    Cancel call
```

### Contacts
```
GET    /api/contacts           List contacts
POST   /api/contacts           Add contact
GET    /api/contacts/:id       Get contact
PUT    /api/contacts/:id       Update contact
DELETE /api/contacts/:id       Delete contact
POST   /api/contacts/import/bulk   Bulk import
```

### Location & Geofencing
```
POST   /api/locations/geofence      Add geofence
GET    /api/locations/geofence      List geofences
GET    /api/locations/geofence/:id  Get geofence
PUT    /api/locations/geofence/:id  Update geofence
DELETE /api/locations/geofence/:id  Remove geofence
POST   /api/locations/update        Location update (posurl)
```

### Device Management
```
POST   /api/device/register    Register device
GET    /api/device/list        List devices
GET    /api/device/:deviceId   Get device status
POST   /api/device/push-token  Update push token
POST   /api/device/:deviceId/heartbeat    Heartbeat
DELETE /api/device/:deviceId   Deactivate device
```

---

## 🔐 Security Features

✅ JWT authentication with expiration  
✅ Password hashing (bcrypt)  
✅ Input validation (Joi)  
✅ Rate limiting (100 req/15min)  
✅ CORS protection  
✅ Error handling  
✅ Request logging  
✅ HTTPS ready  
✅ MongoDB injection prevention  

---

## 📊 Monitoring & Logs

### View Logs
```bash
# Docker Compose
docker-compose logs -f backend

# Local
tail -f logs/app.log
```

### Log Levels
```
error   - Critical errors
warn    - Warnings
info    - General information
debug   - Debugging information
```

### Health Check
```bash
curl http://localhost:5000/health
```

---

## 🚀 Deployment

### AWS (EC2)
```bash
# 1. Launch Ubuntu EC2 instance
# 2. Install Node.js and MongoDB
# 3. Clone repository
# 4. Configure .env
# 5. Start with PM2
npm install -g pm2
pm2 start app.js --name "fake-call-backend"
```

### Google Cloud (Cloud Run)
```bash
gcloud run deploy fake-call-backend \
  --source . \
  --platform managed \
  --region us-central1
```

### DigitalOcean (App Platform)
```bash
# Push code to GitHub
# Connect to DigitalOcean App Platform
# Set environment variables
# Deploy
```

### Docker Hub
```bash
docker build -t yourusername/fake-call:latest .
docker push yourusername/fake-call:latest
```

---

## 🛠️ Troubleshooting

### Backend Won't Start
```bash
# Check port 5000 is available
lsof -i :5000
# Kill if needed
kill -9 PID

# Check Node.js version
node --version  # Should be 16+

# Check dependencies
npm install
```

### MongoDB Connection Error
```bash
# Verify MongoDB is running
docker ps | grep mongodb

# Or start it
docker run -d -p 27017:27017 mongo:latest

# Test connection
mongosh localhost:27017
```

### JWT Token Issues
```bash
# Tokens expire after 7 days
# Login again to get new token
# Always include: Authorization: Bearer TOKEN

# Generate new JWT_SECRET
openssl rand -base64 32
```

### Port Already in Use
```bash
# Use different port
PORT=3000 npm run dev

# Or kill process using port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Security](https://owasp.org/www-project-top-ten/)
- [SIPjs Docs](https://sipjs.com/)
- [Docker Docs](https://docs.docker.com/)

---

## ✨ Next Steps

1. ✅ Start backend
2. ✅ Create test user
3. ✅ Add SIP account
4. ✅ Test call simulation
5. ✅ Configure for production
6. ✅ Deploy to cloud
7. ✅ Connect Android app
8. ✅ Monitor & maintain

---

## 📞 Support

- Check logs: `docker-compose logs`
- Review code comments
- Check .env configuration
- Test endpoints with curl
- Review IMPLEMENTATION_GUIDE.md

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2026-10-14
