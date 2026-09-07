import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET all alerts with filter
router.get('/', (req, res) => {
  try {
    let list = db.getAlerts();
    const { severity, status, cameraId } = req.query;

    if (severity && severity !== 'ALL') {
      list = list.filter(a => a.severity.toUpperCase() === severity.toUpperCase());
    }
    if (status && status !== 'ALL') {
      list = list.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }
    if (cameraId) {
      list = list.filter(a => a.cameraId === cameraId);
    }

    res.json({
      success: true,
      count: list.length,
      alerts: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new alert
router.post('/', (req, res) => {
  try {
    const alert = db.createAlert(req.body);
    res.status(201).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT acknowledge alert
router.put('/:id/acknowledge', (req, res) => {
  try {
    const operator = req.body.operator || 'Duty Operator';
    const alert = db.acknowledgeAlert(req.params.id, operator);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT resolve alert
router.put('/:id/resolve', (req, res) => {
  try {
    const operator = req.body.operator || 'Duty Operator';
    const alert = db.resolveAlert(req.params.id, operator);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
