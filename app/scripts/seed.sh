#!/usr/bin/env bash
set -euo pipefail

NEO4J_URI=${NEO4J_URI:-bolt://localhost:7687}
NEO4J_USER=${NEO4J_USER:-neo4j}
#NEO4J_PASSWORD=${NEO4J_PASSWORD:-neo4j 
NEO4J_PASSWORD=ticket-audio-brush-gibson-helena-9035
IMPORT_DIR=${IMPORT_DIR:-/var/lib/neo4j/import}
DATA_DIR=$(cd "$(dirname "$0")/../data" && pwd)

if [ ! -d "$IMPORT_DIR" ]; then
  echo "Expected Neo4j import directory at $IMPORT_DIR" >&2
  exit 1
fi

echo "Copying CSVs to $IMPORT_DIR"
cp "$DATA_DIR"/*.csv "$IMPORT_DIR"/

echo "URI: ${NEO4J_URI}"
echo "User: ${NEO4J_USER}"
echo "Pass: ${NEO4J_PASSWORD}"

cat "$(dirname "$0")/import.cypher" | \
  NEO4J_URI=$NEO4J_URI NEO4J_USERNAME=$NEO4J_USER NEO4J_PASSWORD=$NEO4J_PASSWORD cypher-shell --fail-at-end

echo "Done."
