const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// @route   POST api/inquiries
// @desc    Submit a new contact message
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        const inquiry = new Inquiry({ name, email, subject, message });
        await inquiry.save();

        res.status(201).json({
            message: 'Your message has been received. We will get back to you soon!',
            inquiry: {
                _id: inquiry._id,
                name: inquiry.name,
                createdAt: inquiry.createdAt
            }
        });
    } catch (error) {
        console.error('Inquiry submission error:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

// Admin-only Routes
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET api/inquiries
// @desc    Get all contact messages
// @access  Private (Admin Only)
router.get('/', async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.json({ inquiries });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

// @route   PUT api/inquiries/:id
// @desc    Update inquiry status
// @access  Private (Admin Only)
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['read', 'replied'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status update' });
        }

        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!inquiry) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({
            message: `Message marked as ${status}`,
            inquiry
        });
    } catch (error) {
        console.error('Inquiry update error:', error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});

// @route   DELETE api/inquiries/:id
// @desc    Delete an inquiry
// @access  Private (Admin Only)
router.delete('/:id', async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

        if (!inquiry) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Inquiry deletion error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

module.exports = router;
