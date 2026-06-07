const agentService = require('../services/agentService');

async function getAgents(req, res) {
  try {
    const agents = await agentService.getAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateAgent(req, res) {
  try {
    const { id } = req.params;
    const result = await agentService.updateAgent(id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getAgents,
  updateAgent
};
