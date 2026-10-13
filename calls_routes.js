const express = require('express');
const { Call, ScheduledCall, SIPAccount } = require('./models');
const authMiddleware = require('./auth').authMiddleware;
const joi = require('joi');

const router = express.Router();

// Validation schemas
const simulateCallSchema = joi.object({
  toNumber: joi.string().required(),
  fromNumber: joi.string().required(),
  fromName: joi.string().optional(),
  toName: joi.string().optional(),
  duration: joi.number().min(1).optional(),
  autoAnswer: joi.boolean().default(false),
  delay: joi.number().min(0).default(0),
  recordingEnabled: joi.boolean().default(false)
});

const scheduleCallSchema = joi.object({
  toNumber: joi.string().required(),
  fromNumber: joi.string().required(),
  fromName: joi.string().optional(),
  toName: joi.string().optional(),
  frequency: joi.string().valid('once', 'daily', 'weekly', 'monthly').default('once'),
  startDate: joi.date().default(() => new Date()),
  endDate: joi.date().optional(),
  callDuration: joi.number().min(1).optional(),
  autoAnswer: joi.boolean().default(false),
  cronSchedule: joi.string().optional()
});

// Simulate incoming call
router.post('/simulate', authMiddleware, async (req, res) => {
  const { error, value } = simulateCallSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const call = new Call({
      userId: req.user.userId,
      callType: 'incoming',
      fromNumber: value.fromNumber,
      toNumber: value.toNumber,
      fromName: value.fromName,
      toName: value.toName,
      status: 'initiated'
    });

    await call.save();

    // TODO: Send push notification to device
    // TODO: Trigger SIP call through SIPAccount

    res.status(201).json({
      message: 'Call simulation initiated',
      call: call.toObject(),
      callId: call._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule recurring call
router.post('/schedule', authMiddleware, async (req, res) => {
  const { error, value } = scheduleCallSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const scheduledCall = new ScheduledCall({
      userId: req.user.userId,
      toNumber: value.toNumber,
      fromNumber: value.fromNumber,
      fromName: value.fromName,
      toName: value.toName,
      frequency: value.frequency,
      startDate: value.startDate,
      endDate: value.endDate,
      callDuration: value.callDuration,
      autoAnswer: value.autoAnswer,
      schedule: value.cronSchedule,
      isActive: true
    });

    await scheduledCall.save();

    // TODO: Register with scheduler (Bull/Agenda)

    res.status(201).json({
      message: 'Call scheduled successfully',
      scheduledCall: scheduledCall.toObject()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get call history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const calls = await Call.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Call.countDocuments({ userId: req.user.userId });

    res.json({
      calls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scheduled calls
router.get('/scheduled', authMiddleware, async (req, res) => {
  try {
    const scheduledCalls = await ScheduledCall.find({ userId: req.user.userId });
    res.json({ scheduledCalls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get call details
router.get('/:callId', authMiddleware, async (req, res) => {
  try {
    const call = await Call.findOne({ _id: req.params.callId, userId: req.user.userId });
    if (!call) return res.status(404).json({ error: 'Call not found' });

    res.json({ call });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update call status
router.put('/:callId/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['initiated', 'ringing', 'connected', 'ended', 'failed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const call = await Call.findOneAndUpdate(
      { _id: req.params.callId, userId: req.user.userId },
      {
        status,
        endTime: status === 'ended' ? new Date() : undefined
      },
      { new: true }
    );

    if (!call) return res.status(404).json({ error: 'Call not found' });

    res.json({ message: 'Call status updated', call });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel scheduled call
router.delete('/scheduled/:scheduledCallId', authMiddleware, async (req, res) => {
  try {
    const scheduledCall = await ScheduledCall.findOneAndUpdate(
      { _id: req.params.scheduledCallId, userId: req.user.userId },
      { isActive: false },
      { new: true }
    );

    if (!scheduledCall) return res.status(404).json({ error: 'Scheduled call not found' });

    res.json({ message: 'Scheduled call cancelled', scheduledCall });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete call from history
router.delete('/:callId', authMiddleware, async (req, res) => {
  try {
    const call = await Call.findOneAndDelete({ _id: req.params.callId, userId: req.user.userId });
    if (!call) return res.status(404).json({ error: 'Call not found' });

    res.json({ message: 'Call deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
