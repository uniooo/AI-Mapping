const vizContainer = document.getElementById('viz');
const minScoreInput = document.getElementById('minScore');
const limitInput = document.getElementById('limit');
const reloadBtn = document.getElementById('reload');
const detailsBox = document.getElementById('details');

let viz;

function getConfig() {
  const minScore = parseFloat(minScoreInput.value) || 0;
  const limit = parseInt(limitInput.value, 10) || 200;
  return {
    containerId: 'viz',
    neo4j: {
      serverUrl: window.NEO4J_URI || 'bolt://localhost:7687',
      serverUser: window.NEO4J_USER || 'neo4j',
      serverPassword: window.NEO4J_PASSWORD || 'neo4j',
    },
    visConfig: {
      edges: {
        arrows: { to: { enabled: true } },
        smooth: false,
      },
      nodes: { shape: 'dot', size: 16, font: { color: '#e5e9f0' } },
      physics: { stabilization: true },
    },
    labels: {
      Job: { caption: 'title', size: 'score', community: 'level', color: '#f9a8d4' },
      Major: { caption: 'name', community: 'discipline', color: '#93c5fd' },
      Company: { caption: 'name', color: '#a5f3fc' },
      University: { caption: 'name', color: '#c7d2fe' },
    },
    relationships: {
      MATCHES: { caption: true, thickness: 'score', color: '#22d3ee' },
      OFFERS: { caption: false, color: '#a3e635' },
      HAS_MAJOR: { caption: false, color: '#fb7185' },
    },
    initialCypher: `MATCH (j:Job)-[r:MATCHES]->(m:Major) WHERE r.score >= ${minScore} RETURN j,r,m LIMIT ${limit}`,
  };
}

function showDetails(obj) {
  detailsBox.textContent = JSON.stringify(obj, null, 2);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function handleNodeClick({ node, raw }) {
  const labels = raw.labels || [];
  const props = raw.properties || {};
  if (labels.includes('Company') && props.company_id) {
    const data = await fetchJson(`/company/${props.company_id}/jobs?limit=50`);
    showDetails({ company: props, jobs: data.results });
  }
  if (labels.includes('University') && props.univ_id) {
    const data = await fetchJson(`/university/${props.univ_id}/majors?limit=50`);
    showDetails({ university: props, majors: data.results });
  }
  if (labels.includes('Job') && props.job_id) {
    const [matches, detail] = await Promise.all([
      fetchJson(`/job/${props.job_id}/matches?minScore=${minScoreInput.value}&limit=25`),
      fetchJson(`/job/${props.job_id}/detail`),
    ]);
    showDetails({ job: detail.job, matches: matches.results });
  }
  if (labels.includes('Major') && props.major_id) {
    const [matches, detail] = await Promise.all([
      fetchJson(`/major/${props.major_id}/matches?minScore=${minScoreInput.value}&limit=25`),
      fetchJson(`/major/${props.major_id}/detail`),
    ]);
    showDetails({ major: detail.major, matches: matches.results });
  }
}

function init() {
  const config = getConfig();
  viz = new NeoVis.default(config);
  viz.registerOnEvent('clickNode', handleNodeClick);
  viz.render();
}

reloadBtn.addEventListener('click', () => {
  if (viz) viz.reloadWithCypher(getConfig().initialCypher);
  else init();
});

init();
