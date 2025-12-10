const vizContainer = document.getElementById('viz');
const uriInput = document.getElementById('uri');
const userInput = document.getElementById('user');
const passwordInput = document.getElementById('password');
const minScoreInput = document.getElementById('minScore');
const limitInput = document.getElementById('limit');
const reloadBtn = document.getElementById('reload');
const detailsBox = document.getElementById('details');
const statusBox = document.getElementById('status');

let viz;

function persistConnection() {
  localStorage.setItem('neo4j_uri', uriInput.value);
  localStorage.setItem('neo4j_user', userInput.value);
}

function hydrateConnection() {
  const uri = localStorage.getItem('neo4j_uri');
  const user = localStorage.getItem('neo4j_user');
  if (uri) uriInput.value = uri;
  if (user) userInput.value = user;
}

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.className = isError ? 'status error' : 'status';
}

function getConfig() {
  const minScore = parseFloat(minScoreInput.value) || 0;
  const limit = parseInt(limitInput.value, 10) || 200;
  const serverUrl = uriInput.value || window.NEO4J_URI || 'bolt://localhost:7687';
  const serverUser = userInput.value || window.NEO4J_USER || 'neo4j';
  const serverPassword = passwordInput.value || window.NEO4J_PASSWORD || 'neo4j';
  persistConnection();
  return {
    containerId: 'viz',
    neo4j: { serverUrl, serverUser, serverPassword },
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

async function handleNodeClick({ raw }) {
  const labels = raw.labels || [];
  const props = raw.properties || {};
  try {
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
  } catch (err) {
    setStatus(`Detail fetch failed: ${err.message}`, true);
  }
}

function init() {
  setStatus('Loading graph...');
  const config = getConfig();
  viz = new NeoVis.default(config);
  viz.registerOnEvent('clickNode', handleNodeClick);
  viz.registerOnEvent('completed', () => setStatus('Graph loaded'));
  viz.registerOnEvent('error', (err) => {
    setStatus(`Graph error: ${err?.message || err}`, true);
    console.error('NeoVis error', err); // eslint-disable-line no-console
  });
  viz.render();
}

reloadBtn.addEventListener('click', () => {
  setStatus('Reloading graph...');
  if (viz) {
    viz.reinit(getConfig());
  } else init();
});

hydrateConnection();
init();
