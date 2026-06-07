const User = require('../models/User');
const { formatDoc } = require('../utils/helpers');

async function getAgents() {
  const agents = await User.findAgents();
  return agents.map(formatDoc);
}


module.exports = {
  getAgents
};
