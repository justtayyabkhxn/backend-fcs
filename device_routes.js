const express = require('express');
const { Device } = require('./models');
const authMiddleware = require('./auth').authMiddleware;
const joi = require('joi');

const router = express.Router();

const deviceSchema = joi.object({
  deviceId: joi.string().required(),
  deviceName: joi.string().optional(),
  platform: joi.string().valid('android', 'ios').required(),
  osVersion: joi.string().optional(),
  appVersion: joi.string().optional(),
  pushToken: joi.string().optional()
});

// Register device
router.post('/register', authMiddleware, async (req, res) => {
  const { error, value } = deviceSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    let device = await Device.findOne({ deviceId: value.deviceId });

    if (device) {
      // Update existing device
      device = await Device.findByIdAndUpdate(
        device._id,
        { ...value, userId: req.user.userId, lastSeen: new Date() },
        { new: true }
      );
    } else {
      // Create new device
      device = new Device({
        userId: req.user.userId,
        ...value,
        isActive: true
      });
      await device.save();
    }

    res.status(201).json({ message: 'Device registered', device });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get devices
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.userId });
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get device status
router.get('/:deviceId', authMiddleware, async (req, res) => {
  try {
    const device = await Device.findOne({
      deviceId: req.params.deviceId,
      userId: req.user.userId
    });
    if (!device) return res.status(404).json({ error: 'Device not found' });

    res.json({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      platform: device.platform,
      isActive: device.isActive,
      lastSeen: device.lastSeen,
      osVersion: device.osVersion,
      appVersion: device.appVersion
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update push token
router.post('/push-token', authMiddleware, async (req, res) => {
  try {
    const { deviceId, pushToken } = req.body;
    if (!deviceId || !pushToken) {
      return res.status(400).json({ error: 'deviceId and pushToken required' });
    }

    const device = await Device.findOneAndUpdate(
      { deviceId, userId: req.user.userId },
      { pushToken, lastSeen: new Date() },
      { new: true }
    );

    if (!device) return res.status(404).json({ error: 'Device not found' });

    res.json({ message: 'Push token updated', device });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update device heartbeat (lastSeen)
router.post('/:deviceId/heartbeat', authMiddleware, async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { deviceId: req.params.deviceId, userId: req.user.userId },
      { lastSeen: new Date() },
      { new: true }
    );

    if (!device) return res.status(404).json({ error: 'Device not found' });

    res.json({ message: 'Heartbeat received', lastSeen: device.lastSeen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate device
router.delete('/:deviceId', authMiddleware, async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { deviceId: req.params.deviceId, userId: req.user.userId },
      { isActive: false },
      { new: true }
    );

    if (!device) return res.status(404).json({ error: 'Device not found' });

    res.json({ message: 'Device deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
