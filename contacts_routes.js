const express = require('express');
const { Contact } = require('./models');
const authMiddleware = require('./auth').authMiddleware;
const joi = require('joi');

const router = express.Router();

const contactSchema = joi.object({
  name: joi.string().required(),
  phone: joi.string().required(),
  email: joi.string().email().optional(),
  tags: joi.array().items(joi.string()).optional()
});

// Get all contacts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments({ userId: req.user.userId });

    res.json({ contacts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add contact
router.post('/', authMiddleware, async (req, res) => {
  const { error, value } = contactSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const contact = new Contact({
      userId: req.user.userId,
      ...value
    });
    await contact.save();
    res.status(201).json({ message: 'Contact added', contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contact
router.get('/:contactId', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.contactId,
      userId: req.user.userId
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update contact
router.put('/:contactId', authMiddleware, async (req, res) => {
  const { error, value } = contactSchema.validate(req.body, { presence: 'optional' });
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, userId: req.user.userId },
      { ...value, updatedAt: new Date() },
      { new: true }
    );
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact updated', contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete contact
router.delete('/:contactId', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.contactId,
      userId: req.user.userId
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import contacts
router.post('/import/bulk', authMiddleware, async (req, res) => {
  try {
    const { contacts } = req.body;
    if (!Array.isArray(contacts)) {
      return res.status(400).json({ error: 'contacts must be an array' });
    }

    const contactsToInsert = contacts.map(c => ({
      userId: req.user.userId,
      name: c.name,
      phone: c.phone,
      email: c.email,
      tags: c.tags || []
    }));

    const result = await Contact.insertMany(contactsToInsert);
    res.status(201).json({ message: `${result.length} contacts imported`, imported: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
