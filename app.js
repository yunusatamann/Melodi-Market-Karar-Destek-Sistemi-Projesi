const path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const dashboardRoutes = require('./src/routes/dashboardRoutes');
const stockRoutes = require('./src/routes/stockRoutes');
const salesRoutes = require('./src/routes/salesRoutes');
const reportsRoutes = require('./src/routes/reportsRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const scenarioRoutes = require('./src/routes/scenarioRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/scenarios', scenarioRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
