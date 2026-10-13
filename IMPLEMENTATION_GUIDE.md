# VoIP Fake Call App - Complete Backend Implementation Guide

## 📊 App Architecture Analysis (Decompiled)

### Key Findings from Source Code

**Library Stack:**
- AsyncHttpClient (com.loopj.android.http) - HTTP requests
- Google Gson - JSON serialization
- SIPjs - VoIP/SIP protocol
- Google Play Services - Analytics, IAP, Location
- EventBus - Event-driven architecture
- Firebase - Push notifications

**API Endpoints Discovered:**
1. **Main API Server**: `https://www.fakeidappandroid.com/`
2. **Position Tracking URL**: Dynamic URL stored in SharedPreferences (`posurl`)
3. **HTTP Method**: POST requests with RequestParams

### Key Activities & Components

```
DialerActivity (Main UI)
├── Makes HTTP POST requests to API
├── Manages user accounts
├── Handles call simulation
└── Sends telemetry data

Receiver (Background Service)
├── Receives broadcast intents for incoming calls
├── Sends location data to posurl endpoint
├── Manages call audio/video
└── Triggers alarm-based calls

RegisterService (SIP)
├── Manages SIP account registration
├── Handles SIP server communication
└── Manages codec selection

Scheduled Call Features:
├── LoopAlarm - Time-based recurring calls
├── LoopLocation - Location-based triggers
├── OneShotAlarm - Single scheduled call
└── OneShotLocation - Location-triggered single call
```

---

## 🛠️ Backend Implementation Architecture

### Core Backend Services

```
Backend Server
│
├── Auth Service
│   ├── User registration
│   ├── User login/logout
│   └── Token management
│
├── Account Service
│   ├── SIP account management
│   ├── Account credentials storage
│   └── Account status tracking
│
├── Call Simulation Service
│   ├── Initiate fake calls
│   ├── Schedule recurring calls
│   ├── Track call history
│   └── Manage call status
│
├── Location Service
│   ├── Receive location updates (posurl)
│   ├── Geofence management
│   └── Location-based triggering
│
├── Notification Service
│   ├── Push notifications via FCM
│   ├── In-app notifications
│   └── SMS/Call alerts
│
└── Analytics Service
    ├── User activity tracking
    ├── Call statistics
    └── Performance metrics
```

---

## 📱 API Endpoint Specifications

### Authentication Endpoints

#### POST /api/auth/register
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "secure_password",
  "phone": "+1234567890",
  "device_id": "android_device_id"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user_id": "user_id",
  "user": {
    "id": "user_id",
    "username": "user123",
    "email": "user@example.com"
  }
}
```

#### POST /api/auth/login
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "device_id": "android_device_id"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user_id": "user_id"
}
```

### Account Management Endpoints

#### POST /api/accounts/add
Store SIP account credentials
```json
{
  "sip_username": "user@sip.com",
  "sip_password": "sip_password",
  "sip_server": "sip.server.com",
  "sip_port": 5060,
  "sip_domain": "server.com",
  "display_name": "User Name"
}

Response:
{
  "success": true,
  "account_id": "account_id",
  "status": "registered"
}
```

#### GET /api/accounts/list
Retrieve all SIP accounts

#### PUT /api/accounts/{account_id}
Update SIP account

#### DELETE /api/accounts/{account_id}
Remove SIP account

### Call Simulation Endpoints

#### POST /api/calls/initiate
Simulate a fake call

```json
{
  "from_number": "+919876543210",
  "to_number": "+911234567890",
  "from_name": "John Doe",
  "to_name": "Target User",
  "call_type": "incoming",
  "duration": 30,
  "auto_answer": false,
  "delay_seconds": 5,
  "with_audio": true,
  "audio_url": "https://example.com/audio.mp3"
}

Response:
{
  "success": true,
  "call_id": "call_id",
  "status": "initiated",
  "sip_session": "sip_session_id"
}
```

#### POST /api/calls/schedule
Schedule recurring calls

```json
{
  "from_number": "+919876543210",
  "to_number": "+911234567890",
  "frequency": "daily",
  "start_time": "09:00",
  "end_date": "2024-12-31",
  "days_of_week": [1, 3, 5],
  "auto_answer": true
}

Response:
{
  "success": true,
  "schedule_id": "schedule_id",
  "next_call": "2024-10-15T09:00:00Z"
}
```

#### GET /api/calls/history
Retrieve call history

```json
Response:
{
  "calls": [
    {
      "call_id": "call_id",
      "from_number": "+919876543210",
      "to_number": "+911234567890",
      "timestamp": "2024-10-14T10:30:00Z",
      "duration": 45,
      "status": "completed",
      "recording_url": "https://example.com/recording.mp3"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

#### POST /api/calls/{call_id}/status
Update call status

```json
{
  "status": "completed",
  "duration": 45,
  "recording_path": "s3://recordings/call_id.mp3"
}
```

### Location Tracking Endpoints

#### POST /api/location/update (posurl endpoint)
App sends location updates to this endpoint

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10,
  "timestamp": "2024-10-14T10:30:00Z",
  "device_id": "device_id"
}

Response:
{
  "success": true,
  "geofences": [
    {
      "geofence_id": "geo_id",
      "trigger_action": "call",
      "trigger_data": {
        "from_number": "+919876543210",
        "to_number": "+911234567890"
      }
    }
  ]
}
```

#### POST /api/geofences/add
Create geofence trigger

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius_meters": 500,
  "trigger_type": "enter",
  "action": "call",
  "action_data": {
    "from_number": "+919876543210",
    "to_number": "+911234567890",
    "duration": 30
  }
}
```

### Device Management Endpoints

#### POST /api/device/register
Register device for push notifications

```json
{
  "device_id": "android_device_id",
  "device_name": "Samsung Galaxy S21",
  "os_version": "11",
  "app_version": "1.0.0",
  "fcm_token": "firebase_token",
  "push_enabled": true
}

Response:
{
  "success": true,
  "device_registered": true
}
```

---

## 💾 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  username: String (unique),
  password_hash: String,
  phone: String,
  device_id: String,
  status: "active" | "inactive" | "suspended",
  created_at: Date,
  updated_at: Date,
  preferences: {
    auto_answer: Boolean,
    recording_enabled: Boolean,
    notification_enabled: Boolean,
    language: String,
    timezone: String
  }
}
```

### SIP Account Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  sip_username: String,
  sip_password_encrypted: String,
  sip_server: String,
  sip_port: Number,
  sip_domain: String,
  display_name: String,
  status: "registered" | "unregistered" | "failed",
  registration_timestamp: Date,
  last_activity: Date,
  codec_preferences: [String]
}
```

### Call Record Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  call_type: "incoming" | "outgoing" | "missed",
  from_number: String,
  to_number: String,
  from_name: String,
  to_name: String,
  sip_session_id: String,
  status: "initiated" | "ringing" | "connected" | "ended" | "failed",
  start_time: Date,
  end_time: Date,
  duration_seconds: Number,
  recording_path: String,
  recording_url: String,
  auto_answered: Boolean,
  notes: String,
  metadata: Object
}
```

### Scheduled Call Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  from_number: String,
  to_number: String,
  from_name: String,
  frequency: "once" | "daily" | "weekly" | "monthly" | "custom",
  start_date: Date,
  end_date: Date,
  start_time: String (HH:MM),
  days_of_week: [Number],
  auto_answer: Boolean,
  is_active: Boolean,
  last_executed: Date,
  next_execution: Date,
  execution_count: Number,
  created_at: Date
}
```

### Location/Geofence Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  latitude: Number,
  longitude: Number,
  radius_meters: Number,
  trigger_type: "enter" | "exit",
  action: "call" | "notification" | "alarm",
  action_data: Object,
  is_active: Boolean,
  trigger_count: Number,
  last_triggered: Date,
  created_at: Date
}
```

### Device Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  device_id: String (unique),
  device_name: String,
  platform: "android" | "ios",
  os_version: String,
  app_version: String,
  fcm_token: String,
  push_enabled: Boolean,
  is_active: Boolean,
  last_seen: Date,
  created_at: Date
}
```

---

## 🔐 Security Implementation

### Data Encryption
```javascript
// Encrypt sensitive fields
- SIP password: AES-256 encryption
- Phone numbers: Field-level encryption
- Recording paths: Signed URLs with expiration

// Encryption config in app
Algorithm: AES/CBC/PKCS5PADDING
Key size: 256-bit
IV: 16 bytes random
```

### Authentication & Authorization
```javascript
// JWT Token
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "user_id": "user_id",
  "email": "user@example.com",
  "iat": timestamp,
  "exp": timestamp + 7days
}

// Rate Limiting
POST /api/calls/initiate: 10 calls/hour
POST /api/location/update: 100 updates/hour
GET /api/calls/history: 50 requests/hour
```

### Compliance & Privacy
```javascript
// Data Retention
- Call recordings: 30 days (configurable)
- Call history: 90 days
- Location data: 7 days
- Device logs: 30 days

// GDPR Compliance
- User data export endpoint
- User data deletion endpoint
- Consent tracking
- Privacy policy endpoint
```

---

## 📋 Implementation Checklist

### Phase 1: Core Backend (Week 1-2)
- [ ] Set up Node.js + Express server
- [ ] Configure MongoDB
- [ ] Implement user authentication (register/login)
- [ ] Create JWT token system
- [ ] Set up logging & monitoring
- [ ] Deploy to staging

### Phase 2: SIP Integration (Week 3-4)
- [ ] Integrate SIPjs library
- [ ] Implement SIP account management
- [ ] Create SIP registration/unregistration
- [ ] Handle SIP call events
- [ ] Test with real SIP server (Twilio/VoIP.ms)

### Phase 3: Call Simulation (Week 5-6)
- [ ] Implement call initiation logic
- [ ] Create call scheduling system
- [ ] Build call history tracking
- [ ] Implement call status updates
- [ ] Add call recording management

### Phase 4: Location & Notifications (Week 7-8)
- [ ] Implement location update endpoint
- [ ] Create geofence management
- [ ] Set up Firebase Cloud Messaging
- [ ] Implement device registration
- [ ] Add in-app notifications

### Phase 5: Testing & Deployment (Week 9+)
- [ ] Unit tests for all endpoints
- [ ] Integration tests with Android app
- [ ] Load testing
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring & alerting setup

---

## 🚀 Deployment Guide

### Docker Setup
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 5000

CMD ["node", "src/app.js"]
```

### Environment Variables
```bash
# Server
PORT=5000
NODE_ENV=production
DOMAIN=yourdomain.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# SIP
SIP_PROVIDER=twilio  # or voipms, asterisk, etc
SIP_SERVER=sip.twilio.com
SIP_PORT=5060

# Firebase
FIREBASE_PROJECT_ID=project-id
FIREBASE_PRIVATE_KEY=key
FIREBASE_CLIENT_EMAIL=email

# AWS S3 (for recordings)
AWS_ACCESS_KEY=key
AWS_SECRET_KEY=secret
AWS_S3_BUCKET=bucket-name
AWS_REGION=us-east-1
```

---

## 📊 Monitoring & Analytics

### Key Metrics to Track
```javascript
- Active users (daily, weekly, monthly)
- Call completion rate
- Average call duration
- SIP registration success rate
- Location update frequency
- Push notification delivery rate
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
```

### Recommended Tools
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Monitoring**: New Relic or DataDog
- **Analytics**: Google Analytics or Mixpanel
- **Error Tracking**: Sentry
- **APM**: New Relic APM or DataDog APM

---

## 🔧 Troubleshooting

### Common Issues

**SIP Registration Fails**
- Verify SIP credentials are correct
- Check firewall allows port 5060 (UDP)
- Enable detailed SIP logging
- Test with SIP client (Xlite, 3CX)

**Push Notifications Not Working**
- Verify FCM/APNS tokens are stored correctly
- Check Firebase project is configured
- Test push directly from Firebase Console
- Verify app has notification permissions

**Location Updates Not Received**
- Ensure device has location permission
- Check GPS/network is enabled
- Verify `posurl` is set in SharedPreferences
- Check network connectivity on device

**Call History Empty**
- Verify calls are actually being initiated
- Check database write permissions
- Review call status updates
- Check timestamp synchronization

---

## 📞 Support & Testing

### Testing the Backend

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Test SIP account
curl -X POST http://localhost:5000/api/accounts/add \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sip_username": "user@twilio.com",
    "sip_password": "password",
    "sip_server": "sip.twilio.com",
    "sip_port": 5060
  }'

# Initiate call
curl -X POST http://localhost:5000/api/calls/initiate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+919876543210",
    "to_number": "+911234567890",
    "duration": 30
  }'

# Update location (posurl)
curl -X POST http://localhost:5000/api/location/update \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "device_id": "device_id"
  }'
```

---

## 📚 Additional Resources

- [SIPjs Documentation](https://sipjs.com/guides/getting-started/)
- [Twilio SIP Trunking](https://www.twilio.com/sip-trunking)
- [VoIP.ms API](https://voip.ms/api/documentation)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OWASP Security Cheatsheet](https://cheatsheetseries.owasp.org/)

---

**Last Updated**: 2026-10-14
**Status**: Ready for Implementation
