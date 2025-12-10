const express = require('express');
const { runQuery } = require('../neo4j');
const { nodeToObject, relationToObject } = require('./helpers');

const router = express.Router();

router.get('/:id/matches', async (req, res, next) => {
  const { id } = req.params;
  const minScore = parseFloat(req.query.minScore ?? '0');
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 200);
  const query = `
    MATCH (j:Job {job_id:$jid})-[r:MATCHES]->(m:Major)
    WHERE r.score >= $minScore
    RETURN j,r,m
    ORDER BY r.score DESC
    LIMIT $k
  `;

  try {
    const records = await runQuery(query, { jid: id, minScore, k: limit });
    const response = records.map((record) => ({
      job: nodeToObject(record.get('j')),
      match: relationToObject(record.get('r')),
      major: nodeToObject(record.get('m')),
    }));
    res.json({ results: response });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/detail', async (req, res, next) => {
  const { id } = req.params;
  const query = `
    MATCH (j:Job {job_id:$jid})
    RETURN j
  `;

  try {
    const records = await runQuery(query, { jid: id });
    if (records.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ job: nodeToObject(records[0].get('j')) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
