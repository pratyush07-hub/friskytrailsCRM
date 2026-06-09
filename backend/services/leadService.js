const Lead = require('../models/Lead');
const User = require('../models/User');
const { formatDoc } = require('../utils/helpers');
const mongoose = require('mongoose');

async function getLeads() {
  const leads = await Lead.findAll();
  return leads.map(formatDoc);
}

async function createLead(name, phone, age, origin, destination, leadSource, mailId) {
  if (!phone) {
    throw new Error("Phone number is required");
  }

  const cleanPhone = phone.replace(/\s+/g, '');
  if (!/^\d{10}$/.test(cleanPhone)) {
    throw new Error("Phone number must be exactly 10 digits with no spaces");
  }

  const lead = {
    name: name || '',
    phone: cleanPhone,
    age: age ? Number(age) : undefined,
    origin: origin || '',
    destination: destination || '',
    leadSource: leadSource || '',
    mailId: mailId || '',
    agentId: null,
    notes: []
  };

  const result = await Lead.insertLead(lead);
  const newLead = await Lead.findById(result.insertedId);
  return formatDoc(newLead);
}

async function updateLead(id, name, phone, age, origin, destination, leadSource, mailId) {
  if (!phone) {
    throw new Error("Phone number is required");
  }

  const cleanPhone = phone.replace(/\s+/g, '');
  if (!/^\d{10}$/.test(cleanPhone)) {
    throw new Error("Phone number must be exactly 10 digits with no spaces");
  }

  const result = await Lead.updateLead(id, {
    name: name || '',
    phone: cleanPhone,
    age: age ? Number(age) : undefined,
    origin: origin || '',
    destination: destination || '',
    leadSource: leadSource || '',
    mailId: mailId || ''
  });

  if (!result) {
    throw new Error("Lead not found");
  }

  return formatDoc(result);
}

async function assignLead(id, agentId) {
  const updateVal = agentId ? agentId : null;
  const result = await Lead.updateLead(id, { agentId: updateVal });

  if (!result) {
    throw new Error("Lead not found");
  }

  return formatDoc(result);
}

async function addNote(id, text, userId) {
  if (!text || !text.trim()) {
    throw new Error("Note text is required");
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new Error("Lead not found");
  }

  let author = 'System/Admin';
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      author = user.name;
    }
  }

  const newNote = {
    id: new mongoose.Types.ObjectId().toString(),
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
    author,
    authorId: userId || null
  };

  const result = await Lead.pushNote(id, newNote);
  return formatDoc(result);
}

async function deleteNote(id, noteId) {
  const result = await Lead.deleteNote(id, noteId);
  if (!result) {
    throw new Error("Lead not found");
  }
  return formatDoc(result);
}

module.exports = {
  getLeads,
  createLead,
  updateLead,
  assignLead,
  addNote,
  deleteNote
};
