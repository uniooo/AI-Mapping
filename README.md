# AI-Mapping

Academia–Industry Mapping Graph prototype for exploring job–major alignment on top of Neo4j. The project ships with an Express API, Neovis.js front end, and sample CSV data.

## Features
- REST endpoints for companies, universities, jobs, and majors (matches + detail views).
- Neovis.js visualization with on-demand expansion and a JSON details side panel.
- Sample CSVs and Cypher import script to create constraints, nodes, and MATCHES relationships.

## Getting started
1. Install dependencies (requires access to npm registry):
   ```bash
   npm install
   ```
2. Set environment variables as needed (defaults shown):
   ```bash
   export NEO4J_URI=bolt://localhost:7687
   export NEO4J_USER=neo4j
   export NEO4J_PASSWORD=neo4j
   export PORT=8080
   ```
3. Seed Neo4j with sample data (assumes Neo4j can read from `/var/lib/neo4j/import`):
   ```bash
   bash app/scripts/seed.sh
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open the graph UI at [http://localhost:8080](http://localhost:8080). Set the Neo4j URI/user/password in the top controls if they differ from defaults, adjust min score and edge limit, then click nodes to fetch matches and details. Connection settings are remembered in your browser.

## API overview
- `GET /company/:id/jobs?limit=` – jobs offered by a company.
- `GET /university/:id/majors?limit=` – majors hosted by a university.
- `GET /job/:id/matches?minScore=&limit=` – top-matching majors for a job.
- `GET /major/:id/matches?minScore=&limit=` – top-matching jobs (with companies) for a major.
- `GET /job/:id/detail` and `GET /major/:id/detail` – detail payloads for side panel display.

Responses include Neo4j node/relationship properties with native number/array coercion for JSON friendliness.

## Data files
Sample CSVs live in `app/data` and align with the import script:
- `jobs.csv`
- `majors.csv`
- `matches.csv`

## Notes
- Front-end Neovis uses direct Neo4j connectivity; provide custom `window.NEO4J_URI`, `window.NEO4J_USER`, and `window.NEO4J_PASSWORD` globals if your connection differs.
- Keep graph renders under roughly 1,500 nodes / 2,500 edges by tuning `minScore` and `limit`.
