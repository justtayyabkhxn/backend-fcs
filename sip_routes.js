const express = require('express');
const { SIPAccount } = require('./models');
const authMiddleware = require('./auth').authMiddleware;
const joi = require('joi');

const router = express.Router();

const sipAccountSchema = joi.object({
  sipUsername: joi.string().required(),
  sipPassword: joi.string().required(),
  sipServer: joi.string().required(),
  sipPort: joi.number().default(5060),
  sipDomain: joi.string().required(),
  displayName: joi.string().optional()
});

// Create SIP account
router.post('/accounts', authMiddleware, async (req, res) => {
  const { error, value } = sipAccountSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const sipAccount = new SIPAccount({
      userId: req.user.userId,
      sipUsername: value.sipUsername,
      sipPassword: value.sipPassword,
      sipServer: value.sipServer,
      sipPort: value.sipPort,
      sipDomain: value.sipDomain,
      displayName: value.displayName || value.sipUsername,
      status: 'inactive'
    });

    await sipAccount.save();

    // TODO: Attempt registration with SIP server
    // TODO: Return registration status

    res.status(201).json({
      message: 'SIP account created',
      account: sipAccount.toObject()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all SIP accounts
router.get('/accounts', authMiddleware, async (req, res) => {
  try {
    const accounts = await SIPAccount.find({ userId: req.user.userId }).select('-sipPassword');
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get SIP account details
router.get('/accounts/:accountId', authMiddleware, async (req, res) => {
  try {
    const account = await SIPAccount.findOne(
      { _id: req.params.accountId, userId: req.user.userId }
    ).select('-sipPassword');

    if (!account) return res.status(404).json({ error: 'Account not found' });

    res.json({ account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update SIP account
router.put('/accounts/:accountId', authMiddleware, async (req, res) => {
  const { error, value } = sipAccountSchema.validate(req.body, { presence: 'optional' });
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const account = await SIPAccount.findOneAndUpdate(
      { _id: req.params.accountId, userId: req.user.userId },
      { ...value, updatedAt: new Date() },
      { new: true }
    ).select('-sipPassword');

    if (!account) return res.status(404).json({ error: 'Account not found' });

    // TODO: Re-register with new credentials

    res.json({ message: 'Account updated', account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete SIP account
router.delete('/accounts/:accountId', authMiddleware, async (req, res) => {
  try {
    const account = await SIPAccount.findOneAndDelete(
      { _id: req.params.accountId, userId: req.user.userId }
    );

    if (!account) return res.status(404).json({ error: 'Account not found' });

    // TODO: Deregister from SIP server

    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register SIP account
router.post('/accounts/:accountId/register', authMiddleware, async (req, res) => {
  try {
    const account = await SIPAccount.findOne(
      { _id: req.params.accountId, userId: req.user.userId }
    );

    if (!account) return res.status(404).json({ error: 'Account not found' });

    // TODO: Perform SIP REGISTER request
    // TODO: Handle registration response

    account.status = 'active';
    account.lastRegistered = new Date();
    await account.save();

    res.json({
      message: 'SIP registration successful',
      account: account.toObject()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unregister SIP account
router.post('/accounts/:accountId/unregister', authMiddleware, async (req, res) => {
  try {
    const account = await SIPAccount.findOne(
      { _id: req.params.accountId, userId: req.user.userId }
    );

    if (!account) return res.status(404).json({ error: 'Account not found' });

    // TODO: Perform SIP REGISTER request with expires=0

    account.status = 'inactive';
    await account.save();

    res.json({
      message: 'SIP unregistration successful',
      account: account.toObject()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get SIP account status
router.get('/accounts/:accountId/status', authMiddleware, async (req, res) => {
  try {
    const account = await SIPAccount.findOne(
      { _id: req.params.accountId, userId: req.user.userId }
    );

    if (!account) return res.status(404).json({ error: 'Account not found' });

    res.json({
      accountId: account._id,
      status: account.status,
      lastRegistered: account.lastRegistered,
      sipServer: account.sipServer,
      sipPort: account.sipPort
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
