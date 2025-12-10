const neo4j = require('neo4j-driver');

function toNative(value) {
  if (neo4j.isInt(value)) return value.toNumber();
  if (Array.isArray(value)) return value.map(toNative);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toNative(v)]));
  }
  return value;
}

function nodeToObject(node) {
  if (!node) return null;
  return {
    id: node.identity.toString(),
    labels: node.labels,
    ...toNative(node.properties),
  };
}

function relationToObject(rel) {
  if (!rel) return null;
  return {
    id: rel.identity.toString(),
    type: rel.type,
    start: rel.start.toString(),
    end: rel.end.toString(),
    ...toNative(rel.properties),
  };
}

module.exports = {
  toNative,
  nodeToObject,
  relationToObject,
};
