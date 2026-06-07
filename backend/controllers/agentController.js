const agentService = require('../services/agentService');

async function getAgents(req, res) {
  try {
    const agents = await agentService.getAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



module.exports = {
  getAgents
};
