// routes/entryRoutes.js
const express = require('express');
const router=express.Router()
const { addEntry, getEntries, updateEntry } = require('../controllers/dataController');
const authenticate = require('../middleware/authMiddle');

router.post('/', authenticate, addEntry);
router.get('/', authenticate, getEntries);
router.put('/:id', authenticate, updateEntry);

module.exports = router;
