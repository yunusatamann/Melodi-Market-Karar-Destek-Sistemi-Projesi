const DashboardModel = require('../models/DashboardModel');

async function getSummary(req, res) {
  try {
    const data = await DashboardModel.getSummary();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'dashboard_summary_failed' });
  }
}

module.exports = {
  getSummary
};
