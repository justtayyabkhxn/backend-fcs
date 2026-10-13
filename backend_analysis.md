# VoIP Fake Call App - Backend Architecture & Node.js Implementation Guide

## App Analysis

### Package Information
- **Package Name**: `caller.phone.id.fakecall`
- **Type**: SIP-based VoIP Fake Call Simulator
- **Primary Function**: Simulate incoming and outgoing phone calls using SIP protocol

### Key Permissions & Features
- **Phone Control**: CALL_PHONE, CALL_PRIVILEGED
- **Audio**: RECORD_AUDIO, MODIFY_AUDIO_SETTINGS
- **Location**: ACCESS_FINE_LOCATION (GPS)
- **Contacts**: READ_CONTACTS
- **Network**: INTERNET, CHANGE_NETWORK_STATE, FOREGROUND_SERVICE
- **Storage**: READ/WRITE_EXTERNAL_STORAGE

### App Architecture (from manifest analysis)

#### Main Activities
1. **DialerActivity** - Main dialer interface
2. **SIP Activities**:
   - SIP - SIP account management
   - SIPUri - SIP URI handling
   - RegisterService - SIP registration
   - Settings - App configuration
3. **Call Simulation**:
   - InCallScreen - Active call display
   - AutoAnswer - Auto-answer configuration
   - Receiver - Call receiver logic
4. **Advanced Features**:
   - LoopAlarm - Recurring call simulation
   - LoopLocation - Location-based triggering
   - OneShotAlarm / OneShotAlarm2 - Single call events
   - OneShotLocation - Location-triggered calls
   - VideoCamera - Video call simulation
   - OwnWifi - WiFi network selection
   - PSTN - Public Switched Telephone Network support
   - PhoneStart - App startup logic

#### Key Broadcasts Received
- `android.intent.action.BOOT_COMPLETED` - Start on device boot
- `android.intent.action.NEW_OUTGOING_CALL` - Intercept outgoing calls
- `android.net.conn.CONNECTIVITY_CHANGE` - Monitor network changes
- `android.net.wifi.WIFI_STATE_CHANGED` - Monitor WiFi status

---

## Required Backend Components

### 1. **User Management Service**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/users/profile
PUT  /api/users/profile
```

### 2. **SIP Account Management**
```
GET  /api/sip/accounts
POST /api/sip/accounts
PUT  /api/sip/accounts/:id
DELETE /api/sip/accounts/:id
GET  /api/sip/accounts/:id/status
```

### 3. **Contact & Caller ID**
```
GET  /api/contacts
POST /api/contacts
GET  /api/contacts/:id
DELETE /api/contacts/:id
POST /api/contacts/import
```

### 4. **Call Simulation & Scheduling**
```
POST /api/calls/simulate          # Initiate fake call
POST /api/calls/schedule          # Schedule calls
GET  /api/calls/history
POST /api/calls/:id/cancel
GET  /api/calls/scheduled
PUT  /api/calls/:id/reschedule
```

### 5. **Location-Based Triggers**
```
POST /api/locations/geofence      # Set location-based triggers
GET  /api/locations/geofence/:id
DELETE /api/locations/geofence/:id
POST /api/locations/current       # Report current location
```

### 6. **Audio & Codec Management**
```
GET  /api/codecs
GET  /api/codecs/settings
POST /api/audio/settings
GET  /api/audio/recordings/:id
```

### 7. **Device & Network Status**
```
GET  /api/device/status
POST /api/device/register-push
GET  /api/network/status
POST /api/wifi/networks
```

---

## Node.js Backend Stack Recommendation

### Core Stack
```json
{
  "framework": "Express.js",
  "server": "Node.js 18+",
  "database": "PostgreSQL or MongoDB",
  "authentication": "JWT + OAuth2",
  "sip-library": "SIPjs or SIP.js",
  "real-time": "Socket.io",
  "task-queue": "Bull or Agenda for scheduling",
  "geocoding": "Google Maps API or Mapbox",
  "logging": "Winston or Pino",
  "security": "Helmet, bcrypt, rate-limiter"
}
```

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── sip.js
│   │   └── auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── sipController.js
│   │   ├── callController.js
│   │   ├── contactController.js
│   │   ├── locationController.js
│   │   └── deviceController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── SIPAccount.js
│   │   ├── Call.js
│   │   ├── Contact.js
│   │   ├── Location.js
│   │   └── Device.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── sip.js
│   │   ├── calls.js
│   │   ├── contacts.js
│   │   ├── locations.js
│   │   └── devices.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── logging.js
│   ├── services/
│   │   ├── SIPService.js
│   │   ├── CallService.js
│   │   ├── LocationService.js
│   │   ├── NotificationService.js
│   │   └── SchedulerService.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   └── constants.js
│   └── app.js
├── .env.example
├── package.json
└── README.md
```

---

## Core Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date,
  preferences: {
    language: String,
    timezone: String,
    notifications: Boolean
  }
}
```

### SIP Account Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sipUsername: String,
  sipPassword: String,
  sipServer: String,
  sipPort: Number,
  sipDomain: String,
  displayName: String,
  status: Enum ['active', 'inactive', 'failed'],
  lastRegistered: Date,
  createdAt: Date
}
```

### Call Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  callType: Enum ['incoming', 'outgoing', 'missed'],
  fromNumber: String,
  toNumber: String,
  fromName: String,
  toName: String,
  duration: Number,
  startTime: Date,
  endTime: Date,
  status: Enum ['initiated', 'ringing', 'connected', 'ended', 'failed'],
  recordingUrl: String,
  notes: String,
  createdAt: Date
}
```

### Location Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  latitude: Number,
  longitude: Number,
  radius: Number,
  triggerAction: String,
  triggerData: Object,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoint Examples

### Authentication
```bash
POST /api/auth/register
{
  "username": "user@example.com",
  "email": "user@example.com",
  "password": "secure_password",
  "phone": "+1234567890"
}

Response: { token, refreshToken, user }
```

### Create SIP Account
```bash
POST /api/sip/accounts
{
  "sipUsername": "user123",
  "sipPassword": "sip_password",
  "sipServer": "sip.provider.com",
  "sipDomain": "provider.com",
  "displayName": "User Name"
}
```

### Simulate Call
```bash
POST /api/calls/simulate
{
  "toNumber": "+1234567890",
  "fromNumber": "+9876543210",
  "fromName": "John Doe",
  "duration": 30,
  "autoAnswer": true,
  "delay": 5
}
```

### Schedule Recurring Calls
```bash
POST /api/calls/schedule
{
  "toNumber": "+1234567890",
  "schedule": "0 9 * * 1-5", // Cron format
  "frequency": "daily",
  "endDate": "2024-12-31",
  "fromNumber": "+9876543210"
}
```

---

## Security Considerations

1. **Authentication**: Use JWT with short expiration + refresh tokens
2. **Encryption**: HTTPS/TLS for all connections
3. **Database**: Encrypt sensitive fields (passwords, phone numbers)
4. **Rate Limiting**: Prevent abuse of call simulation endpoints
5. **Validation**: Strict input validation on all endpoints
6. **Logging**: Audit all call simulations and sensitive operations
7. **SIP Security**: SRTP encryption for media streams
8. **Privacy**: Comply with local regulations on call recording/simulation

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Express.js + database
- [ ] Implement user auth (register, login, JWT)
- [ ] Create user profile management
- [ ] Set up logging & error handling

### Phase 2: SIP Integration (Week 3-4)
- [ ] Integrate SIP library (SIPjs)
- [ ] Build SIP account management
- [ ] Implement SIP registration/deregistration
- [ ] Handle SIP-related events

### Phase 3: Call Simulation (Week 5-6)
- [ ] Implement call simulation logic
- [ ] Create call history tracking
- [ ] Build call scheduling system (using Bull/Agenda)
- [ ] Implement recording storage

### Phase 4: Advanced Features (Week 7-8)
- [ ] Location-based triggering
- [ ] Geofencing
- [ ] Contact management
- [ ] Device registration & push notifications

### Phase 5: Testing & Deployment (Week 9+)
- [ ] Unit & integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Docker containerization
- [ ] Cloud deployment (AWS/Google Cloud/DigitalOcean)

---

## Next Steps

1. **Decompile the APK** to see actual API calls the app makes
2. **Identify specific endpoints** the app expects
3. **Extract data structure patterns** from the app
4. **Map actual network requests** using interceptors
5. **Adapt backend accordingly**

Once the decompilation is complete, update this guide with specific endpoint requirements and data formats used by the app.
