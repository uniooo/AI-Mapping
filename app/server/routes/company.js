const express = require('express');
const { runQuery } = require('../neo4j');
const { nodeToObject } = require('./helpers');

const router = express.Router();

router.get('/:id/jobs', async (req, res, next) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const query = `
    MATCH (c:Company {company_id:$cid})-[:OFFERS]->(j:Job)
    RETURN c,j
    ORDER BY j.level, j.title
    LIMIT $k
  `;

  try {
    const records = await runQuery(query, { cid: id, k: neoSafe(limit) });
    const response = records.map((record) => ({
      company: nodeToObject(record.get('c')),
      job: nodeToObject(record.get('j')),
    }));
    res.json({ results: response });
  } catch (err) {
    next(err);
  }
});

function neoSafe(num) {
  return Number.isFinite(num) ? num : 20;
}

module.exports = router;
