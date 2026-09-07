import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET all incidents
router.get('/', (req, res) => {
  try {
    let list = db.getIncidents();
    const { status, severity, cameraId } = req.query;

    if (status && status !== 'ALL') {
      list = list.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }
    if (severity && severity !== 'ALL') {
      list = list.filter(i => i.severity.toUpperCase() === severity.toUpperCase());
    }
    if (cameraId) {
      list = list.filter(i => i.cameraId === cameraId);
    }

    res.json({
      success: true,
      count: list.length,
      incidents: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET incident by ID
router.get('/:id', (req, res) => {
  const incident = db.getIncidents().find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }
  res.json({ success: true, incident });
});

// POST create incident
router.post('/', (req, res) => {
  try {
    const incident = db.createIncident(req.body);
    res.status(201).json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update incident
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateIncident(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    res.json({ success: true, incident: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add note to incident timeline
router.post('/:id/notes', (req, res) => {
  try {
    const { note, author } = req.body;
    if (!note) {
      return res.status(400).json({ success: false, message: 'Note text is required.' });
    }
    const updated = db.addIncidentNote(req.params.id, note, author || 'Operator');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    res.json({ success: true, incident: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
