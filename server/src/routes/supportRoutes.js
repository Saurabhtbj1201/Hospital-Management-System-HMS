const express = require('express');
const router = express.Router();
const {
    createTicket,
    getAllTickets,
    getTicket,
    updateTicket,
    deleteTicket,
    getTicketStats
} = require('../controllers/supportController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route - anyone can create a ticket
router.post('/', createTicket);

// Protected routes - require authentication
router.get('/stats', protect, admin, getTicketStats);
router.get('/', protect, admin, getAllTickets);
router.get('/:id', protect, admin, getTicket);
router.put('/:id', protect, admin, updateTicket);
router.delete('/:id', protect, admin, deleteTicket);

module.exports = router;
