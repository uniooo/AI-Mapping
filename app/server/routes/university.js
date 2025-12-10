const express = require('express');
const { runQuery } = require('../neo4j');
const { nodeToObject } = require('./helpers');

const router = express.Router();

router.get('/:id/majors', async (req, res, next) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const query = `
    MATCH (u:University {univ_id:$uid})-[:HAS_MAJOR]->(m:Major)
    RETURN u,m
    ORDER BY m.discipline, m.name
    LIMIT $k
  `;

  try {
    const records = await runQuery(query, { uid: id, k: limit });
    const response = records.map((record) => ({
      university: nodeToObject(record.get('u')),
      major: nodeToObject(record.get('m')),
    }));
    res.json({ results: response });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
