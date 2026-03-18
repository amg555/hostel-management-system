// src/routes/rooms.js
const router = require('express').Router();
const roomController = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, roomController.getAllRooms.bind(roomController));
router.get('/available', authenticate, roomController.getAvailableRooms.bind(roomController));
router.get('/occupancy-stats', authenticate, roomController.getRoomOccupancyStats.bind(roomController));
router.get('/:id', authenticate, roomController.getRoomById.bind(roomController));
router.post('/', authenticate, authorize(['admin']), roomController.createRoom.bind(roomController));
router.put('/:id', authenticate, authorize(['admin']), roomController.updateRoom.bind(roomController));
router.delete('/:id', authenticate, authorize(['admin']), roomController.deleteRoom.bind(roomController));

module.exports = router;