const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    notifications: { type: Boolean, default: true },
    autoAnswer: { type: Boolean, default: false }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// SIP Account Model
const sipAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sipUsername: { type: String, required: true },
  sipPassword: { type: String, required: true },
  sipServer: { type: String, required: true },
  sipPort: { type: Number, default: 5060 },
  sipDomain: { type: String, required: true },
  displayName: String,
  status: { type: String, enum: ['active', 'inactive', 'failed'], default: 'inactive' },
  lastRegistered: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Call Model
const callSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  callType: { type: String, enum: ['incoming', 'outgoing', 'missed'], required: true },
  fromNumber: { type: String, required: true },
  toNumber: { type: String, required: true },
  fromName: String,
  toName: String,
  duration: { type: Number, default: 0 },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, enum: ['initiated', 'ringing', 'connected', 'ended', 'failed'], default: 'initiated' },
  recordingUrl: String,
  recordingPath: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

// Contact Model
const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  avatar: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Location (Geofence) Model
const locationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  radius: { type: Number, required: true },
  triggerAction: { type: String, enum: ['call', 'notification', 'alarm'], required: true },
  triggerData: mongoose.Schema.Types.Mixed,
  isActive: { type: Boolean, default: true },
  name: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Scheduled Call Model
const scheduledCallSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toNumber: { type: String, required: true },
  fromNumber: { type: String, required: true },
  fromName: String,
  toName: String,
  schedule: String,
  frequency: { type: String, enum: ['once', 'daily', 'weekly', 'monthly'], default: 'once' },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  isActive: { type: Boolean, default: true },
  lastExecuted: Date,
  nextExecution: Date,
  autoAnswer: { type: Boolean, default: false },
  callDuration: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Device Model
const deviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: String, required: true, unique: true },
  deviceName: String,
  platform: { type: String, enum: ['android', 'ios'], required: true },
  osVersion: String,
  appVersion: String,
  pushToken: String,
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  SIPAccount: mongoose.model('SIPAccount', sipAccountSchema),
  Call: mongoose.model('Call', callSchema),
  Contact: mongoose.model('Contact', contactSchema),
  Location: mongoose.model('Location', locationSchema),
  ScheduledCall: mongoose.model('ScheduledCall', scheduledCallSchema),
  Device: mongoose.model('Device', deviceSchema)
};
