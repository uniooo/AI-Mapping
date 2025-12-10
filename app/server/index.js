require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { closeDriver } = require('./neo4j');

const companyRoutes = require('./routes/company');
const universityRoutes = require('./routes/university');
const jobRoutes = require('./routes/job');
const majorRoutes = require('./routes/major');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/company', companyRoutes);
app.use('/university', universityRoutes);
app.use('/job', jobRoutes);
app.use('/major', majorRoutes);

app.use('/', express.static(path.join(__dirname, '../web')));

app.use((err, req, res, next) => {
  console.error(err); // eslint-disable-line no-console
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // eslint-disable-line no-console
});

process.on('SIGINT', async () => {
  await closeDriver();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  await closeDriver();
  server.close(() => process.exit(0));
});
