const neo4j = require('neo4j-driver');
const {
  NEO4J_URI = 'bolt://localhost:7687',
  NEO4J_USER = 'neo4j',
  NEO4J_PASSWORD = 'neo4j',
} = process.env;

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

function getSession() {
  return driver.session({ defaultAccessMode: neo4j.session.READ });
}

async function runQuery(query, params = {}) {
  const session = getSession();
  try {
    const result = await session.run(query, params);
    return result.records;
  } finally {
    await session.close();
  }
}

async function closeDriver() {
  await driver.close();
}

module.exports = {
  driver,
  runQuery,
  closeDriver,
};
