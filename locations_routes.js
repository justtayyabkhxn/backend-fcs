const express = require('express');
const { Location } = require('./models');
const authMiddleware = require('./auth').authMiddleware;
const joi = require('joi');

const router = express.Router();

const geofenceSchema = joi.object({
  latitude: joi.number().required(),
  longitude: joi.number().required(),
  radius: joi.number().min(10).required(),
  triggerAction: joi.string().valid('call', 'notification', 'alarm').required(),
  triggerData: joi.object().required(),
  name: joi.string().optional()
});

const locationUpdateSchema = joi.object({
  latitude: joi.number().required(),
  longitude: joi.number().required(),
  accuracy: joi.number().optional(),
  device_id: joi.string().optional()
});

// Add geofence
router.post('/geofence', authMiddleware, async (req, res) => {
  const { error, value } = geofenceSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const location = new Location({
      userId: req.user.userId,
      latitude: value.latitude,
      longitude: value.longitude,
      radius: value.radius,
      triggerAction: value.triggerAction,
      triggerData: value.triggerData,
      name: value.name,
      isActive: true
    });

    await location.save();
    res.status(201).json({ message: 'Geofence created', geofence: location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all geofences
router.get('/geofence', authMiddleware, async (req, res) => {
  try {
    const geofences = await Location.find({ userId: req.user.userId });
    res.json({ geofences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get geofence details
router.get('/geofence/:id', authMiddleware, async (req, res) => {
  try {
    const geofence = await Location.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!geofence) return res.status(404).json({ error: 'Geofence not found' });
    res.json({ geofence });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update geofence
router.put('/geofence/:id', authMiddleware, async (req, res) => {
  const { error, value } = geofenceSchema.validate(req.body, { presence: 'optional' });
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const geofence = await Location.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { ...value, updatedAt: new Date() },
      { new: true }
    );
    if (!geofence) return res.status(404).json({ error: 'Geofence not found' });
    res.json({ message: 'Geofence updated', geofence });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete geofence
router.delete('/geofence/:id', authMiddleware, async (req, res) => {
  try {
    const geofence = await Location.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!geofence) return res.status(404).json({ error: 'Geofence not found' });
    res.json({ message: 'Geofence deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report location (posurl endpoint)
router.post('/update', async (req, res) => {
  const { error, value } = locationUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    // Find all geofences for this location update
    const geofences = await Location.find({
      isActive: true,
      latitude: { $gte: value.latitude - 0.01, $lte: value.latitude + 0.01 },
      longitude: { $gte: value.longitude - 0.01, $lte: value.longitude + 0.01 }
    });

    // Check which geofences are triggered
    const triggeredGeofences = geofences.filter(geo => {
      const R = 6371; // Earth's radius in km
      const lat1 = (value.latitude * Math.PI) / 180;
      const lat2 = (geo.latitude * Math.PI) / 180;
      const deltaLat = ((geo.latitude - value.latitude) * Math.PI) / 180;
      const deltaLon = ((geo.longitude - value.longitude) * Math.PI) / 180;

      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c * 1000; // Convert to meters

      return distance <= geo.radius;
    });

    // TODO: Process triggered geofences
    // - If action is 'call', initiate call
    // - If action is 'notification', send push
    // - If action is 'alarm', trigger alarm

    res.json({
      success: true,
      triggered: triggeredGeofences.length,
      geofences: triggeredGeofences.map(g => ({
        id: g._id,
        action: g.triggerAction,
        data: g.triggerData
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
