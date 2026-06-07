const express = require('express');
const agentController = require('../controllers/agentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, agentController.getAgents);

module.exports = router;
