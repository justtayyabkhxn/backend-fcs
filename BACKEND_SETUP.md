# VoIP Fake Call App - Node.js Backend Setup Guide

## Quick Start

### 1. Clone/Setup Repository
```bash
mkdir fake-call-backend
cd fake-call-backend
git init
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### 5. Start Redis (Optional, for job queuing)
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### 6. Start Backend Server
```bash
npm run dev
```

Server will be available at `http://localhost:5000`

---

## Project Structure

```
fake-call-backend/
├── src/
│   ├── app.js                 # Main Express app
│   ├── models.js              # MongoDB schemas
│   ├── auth.js                # Authentication middleware
│   ├── calls_routes.js        # Call simulation endpoints
│   ├── sip_routes.js          # SIP account management
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js           # (to be created)
│   │   ├── sip.js
│   │   ├── calls.js
│   │   ├── contacts.js        # (to be created)
│   │   ├── locations.js       # (to be created)
│   │   └── device.js          # (to be created)
│   ├── services/
│   │   ├── SIPService.js      # (to be created)
│   │   ├── CallService.js
│   │   ├── LocationService.js
│   │   └── NotificationService.js
│   └── middleware/
│       ├── auth.js
│       ├── validation.js
│       └── errorHandler.js
├── .env.example
├── package.json
└── README.md
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # User login
POST   /api/auth/refresh           # Refresh JWT token
```

### Users
```
GET    /api/users/profile          # Get user profile
PUT    /api/users/profile          # Update profile
GET    /api/users/preferences      # Get user preferences
PUT    /api/users/preferences      # Update preferences
```

### SIP Accounts
```
POST   /api/sip/accounts           # Create SIP account
GET    /api/sip/accounts           # List all accounts
GET    /api/sip/accounts/:id       # Get account details
PUT    /api/sip/accounts/:id       # Update account
DELETE /api/sip/accounts/:id       # Delete account
POST   /api/sip/accounts/:id/register      # Register account
POST   /api/sip/accounts/:id/unregister    # Unregister account
GET    /api/sip/accounts/:id/status        # Check registration status
```

### Calls
```
POST   /api/calls/simulate         # Simulate incoming/outgoing call
POST   /api/calls/schedule         # Schedule recurring calls
GET    /api/calls/history          # Get call history
GET    /api/calls/scheduled        # Get scheduled calls
GET    /api/calls/:callId          # Get call details
PUT    /api/calls/:callId/status   # Update call status
DELETE /api/calls/scheduled/:id    # Cancel scheduled call
DELETE /api/calls/:callId          # Delete call from history
```

### Contacts
```
GET    /api/contacts               # Get all contacts
POST   /api/contacts               # Add contact
GET    /api/contacts/:id           # Get contact details
PUT    /api/contacts/:id           # Update contact
DELETE /api/contacts/:id           # Delete contact
POST   /api/contacts/import        # Import contacts
```

### Locations (Geofencing)
```
POST   /api/locations/geofence     # Create geofence
GET    /api/locations/geofence/:id # Get geofence details
PUT    /api/locations/geofence/:id # Update geofence
DELETE /api/locations/geofence/:id # Delete geofence
POST   /api/locations/current      # Report device location
```

### Device
```
POST   /api/device/register        # Register device
GET    /api/device/status          # Get device status
PUT    /api/device/update          # Update device info
POST   /api/device/push-token      # Register push notification token
```

---

## Example API Usage

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePassword123",
    "phone": "+1234567890"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### 2. Create SIP Account
```bash
curl -X POST http://localhost:5000/api/sip/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sipUsername": "user123",
    "sipPassword": "sip_password",
    "sipServer": "sip.twilio.com",
    "sipPort": 5060,
    "sipDomain": "twilio.com",
    "displayName": "Test User"
  }'
```

### 3. Simulate Call
```bash
curl -X POST http://localhost:5000/api/calls/simulate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "toNumber": "+1234567890",
    "fromNumber": "+9876543210",
    "fromName": "John Doe",
    "toName": "Test User",
    "duration": 30,
    "autoAnswer": true,
    "delay": 5
  }'
```

### 4. Schedule Recurring Calls
```bash
curl -X POST http://localhost:5000/api/calls/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "toNumber": "+1234567890",
    "fromNumber": "+9876543210",
    "frequency": "daily",
    "callDuration": 60,
    "autoAnswer": false,
    "endDate": "2024-12-31"
  }'
```

---

## Database Models

### User
- `_id`: ObjectId
- `username`: String (unique)
- `email`: String (unique)
- `phone`: String (optional)
- `passwordHash`: String
- `preferences`: Object (language, timezone, notifications, autoAnswer)
- `createdAt`, `updatedAt`: Date

### SIPAccount
- `_id`: ObjectId
- `userId`: ObjectId (ref: User)
- `sipUsername`: String
- `sipPassword`: String
- `sipServer`: String
- `sipPort`: Number
- `sipDomain`: String
- `displayName`: String
- `status`: Enum [active, inactive, failed]
- `lastRegistered`: Date

### Call
- `_id`: ObjectId
- `userId`: ObjectId (ref: User)
- `callType`: Enum [incoming, outgoing, missed]
- `fromNumber`, `toNumber`: String
- `fromName`, `toName`: String
- `duration`: Number (seconds)
- `status`: Enum [initiated, ringing, connected, ended, failed]
- `recordingUrl`: String (optional)
- `createdAt`: Date

### ScheduledCall
- `_id`: ObjectId
- `userId`: ObjectId (ref: User)
- `toNumber`, `fromNumber`: String
- `frequency`: Enum [once, daily, weekly, monthly]
- `startDate`, `endDate`: Date
- `isActive`: Boolean
- `autoAnswer`: Boolean
- `lastExecuted`, `nextExecution`: Date

---

## Integration with Android App

### 1. Point App to Backend
In the Android app, configure the API endpoint:
```
API_BASE_URL = http://your-backend-ip:5000
```

### 2. Authentication Flow
1. App sends `POST /api/auth/login`
2. Backend returns JWT token
3. App stores token in SharedPreferences
4. App includes token in `Authorization: Bearer TOKEN` header for all requests

### 3. Push Notifications
1. App registers FCM token: `POST /api/device/push-token`
2. Backend stores token
3. Backend sends push notifications via Firebase Cloud Messaging

### 4. SIP Integration
1. App creates SIP account: `POST /api/sip/accounts`
2. Backend stores credentials
3. Backend initiates SIP registration
4. App receives SIP credentials and connects directly to SIP server for calls

### 5. Call Simulation Flow
1. App sends `POST /api/calls/simulate`
2. Backend creates call record in database
3. Backend sends push notification to device
4. Backend initiates SIP call
5. App receives push and displays incoming call screen
6. App reports call status back to backend

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Enable CORS properly for production domain
- [ ] Set up rate limiting
- [ ] Validate all inputs
- [ ] Encrypt sensitive database fields
- [ ] Use strong passwords for SIP accounts
- [ ] Implement request logging/auditing
- [ ] Add CSRF protection if needed
- [ ] Regular security updates for dependencies

---

## Performance Optimization

1. **Database Indexing**: Create indexes on frequently queried fields
2. **Caching**: Use Redis for session tokens and frequently accessed data
3. **Job Queue**: Use Bull for async operations (calls, notifications)
4. **Load Balancing**: Deploy multiple instances behind nginx
5. **CDN**: Serve static assets via CDN

---

## Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running
docker ps | grep mongodb
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 PID
```

### JWT Token Expired
```
Solution: Client should use refresh token endpoint to get new token
POST /api/auth/refresh
```

### SIP Registration Fails
```
Solution: 
1. Verify SIP credentials are correct
2. Check firewall settings (port 5060)
3. Verify SIP server is accessible
```

---

## Next Steps

1. **Implement remaining routes** (contacts, locations, device management)
2. **Add SIP service** using SIPjs library for actual VoIP calls
3. **Implement push notifications** using Firebase Cloud Messaging
4. **Add job scheduling** for recurring calls using Bull/Agenda
5. **Implement recording storage** (local/S3)
6. **Add comprehensive logging** and monitoring
7. **Create automated tests** for all endpoints
8. **Deploy to production** (AWS, Google Cloud, DigitalOcean, etc.)

---

## Support & Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [SIPjs Documentation](https://sipjs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

---

**Created**: 2026-10-14
**Status**: Development
