const User = require('../models/User');
const { formatDoc } = require('../utils/helpers');

async function getAgents() {
  const agents = await User.findAgents();
  return agents.map(formatDoc);
}

async function updateAgent(id, data) {
  const result = await User.updateAgent(id, data);
  if (!result) {
    throw new Error("Agent not found");
  }
  return formatDoc(result);
}

module.exports = {
  getAgents,
  updateAgent
};
