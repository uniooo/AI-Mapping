const express = require('express');
const { runQuery } = require('../neo4j');
const { nodeToObject, relationToObject } = require('./helpers');

const router = express.Router();

router.get('/:id/matches', async (req, res, next) => {
  const { id } = req.params;
  const minScore = parseFloat(req.query.minScore ?? '0');
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 200);
  const query = `
    MATCH (m:Major {major_id:$mid})<-[r:MATCHES]-(j:Job)
    OPTIONAL MATCH (c:Company)-[:OFFERS]->(j)
    WHERE r.score >= $minScore
    RETURN m,r,j,c
    ORDER BY r.score DESC
    LIMIT $k
  `;

  try {
    const records = await runQuery(query, { mid: id, minScore, k: limit });
    const response = records.map((record) => ({
      major: nodeToObject(record.get('m')),
      match: relationToObject(record.get('r')),
      job: nodeToObject(record.get('j')),
      company: nodeToObject(record.get('c')),
    }));
    res.json({ results: response });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/detail', async (req, res, next) => {
  const { id } = req.params;
  const query = `
    MATCH (m:Major {major_id:$mid})
    RETURN m
  `;

  try {
    const records = await runQuery(query, { mid: id });
    if (records.length === 0) return res.status(404).json({ error: 'Major not found' });
    res.json({ major: nodeToObject(records[0].get('m')) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
