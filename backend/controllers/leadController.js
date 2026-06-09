const leadService = require('../services/leadService');

async function getLeads(req, res) {
  try {
    const leads = await leadService.getLeads();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createLead(req, res) {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }
    const { name, phone, age, origin, destination, leadSource, mailId } = req.body;
    const result = await leadService.createLead(name, phone, age, origin, destination, leadSource, mailId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateLead(req, res) {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }
    const { id } = req.params;
    const { name, phone, age, origin, destination, leadSource, mailId } = req.body;
    const result = await leadService.updateLead(id, name, phone, age, origin, destination, leadSource, mailId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function assignLead(req, res) {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }
    const { id } = req.params;
    const { agentId } = req.body;
    const result = await leadService.assignLead(id, agentId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function addNote(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const result = await leadService.addNote(id, text, req.user.userId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteNote(req, res) {
  try {
    const { id, noteId } = req.params;
    const result = await leadService.deleteNote(id, noteId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getLeads,
  createLead,
  updateLead,
  assignLead,
  addNote,
  deleteNote
};
