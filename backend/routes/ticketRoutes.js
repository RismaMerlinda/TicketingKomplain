const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);
router.post('/sync', ticketController.syncTickets); // Bulk import
router.get('/seed', ticketController.seedTickets); // Seed Sample Data
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
