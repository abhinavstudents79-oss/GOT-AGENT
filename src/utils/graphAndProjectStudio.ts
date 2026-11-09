export interface SavedAiProjectFile {
  name: string;
  language: string;
  content: string;
}

export interface SavedAiProject {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  files: SavedAiProjectFile[];
  previewHtml: string;
}

const PROJECTS_STORAGE_KEY = 'got_agent_projects_workspace_v1';

export function loadSavedAiProjects(): SavedAiProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveAiProjectsList(projects: SavedAiProject[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      PROJECTS_STORAGE_KEY,
      JSON.stringify(projects.slice(0, 30))
    );
  } catch {}
}

/**
 * Detects if the user is asking GOT Agent to create a Graph, Chart, Plot, Data Visualization, or 2D Graphic.
 */
export function isGraphOrGraphicRequest(prompt: string, agentMode?: string): boolean {
  if (agentMode === 'Graph & Graphic Studio') return true;
  const clean = String(prompt || '').toLowerCase();
  if (!clean) return false;
  // Do not intercept if it's explicitly a video request
  if (/\b(video|9:16|movie|reel|short\s+video)\b/i.test(clean)) return false;

  return /\b(create\s+a?\s*graph|make\s+a?\s*graph|draw\s+a?\s*graph|plot\s+a?\s*graph|bar\s+graph|line\s+graph|pie\s+chart|bar\s+chart|line\s+chart|area\s+chart|scatter\s+plot|data\s+chart|create\s+a?\s*chart|2d\s+graphic|create\s+a?\s*graphic|vector\s+graphic|infographic|canvas\s+graphic|diagram\s+of|graph\s+of|graph\s+for|chart\s+for)\b/i.test(
    clean
  );
}

/**
 * Extracts data points and labels from a user's prompt (or generates intelligent domain data)
 * and builds an interactive HTML5 Canvas + SVG Graph & 2D Graphic Studio deliverable.
 */
export function buildInteractiveGraphAndGraphicResponse(
  prompt: string,
  agentMode = 'GOT LOCAL'
): {
  reply: string;
  highlights: string[];
  followUpPrompts: string[];
} {
  const clean = String(prompt || '').trim();
  const topicRaw = clean
    .replace(
      /^(please\s+)?(can\s+you\s+)?(create|make|draw|plot|generate|build|show)\s+(an?\s+)?(interactive\s+|2d\s+|live\s+)?(bar\s+graph|line\s+graph|pie\s+chart|bar\s+chart|line\s+chart|graph|chart|2d\s+graphic|graphic|infographic|diagram)\s*(of|for|about|on|showing)?\s*/i,
      ''
    )
    .trim();

  const title =
    (topicRaw || 'Real-Time Analytics & 2D Graphic Visualization')
      .slice(0, 56)
      .replace(/[<>"']/g, '')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Check if user provided explicit numbers in prompt like "A: 45, B: 80" or "2021 30, 2022 55"
  const pairRegex = /([A-Za-z0-9_.\s]{2,18})[:=\-\s]+(\d+(?:\.\d+)?)/g;
  const extractedLabels: string[] = [];
  const extractedValues: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = pairRegex.exec(clean)) !== null && extractedLabels.length < 8) {
    const lbl = match[1].trim();
    const val = parseFloat(match[2]);
    if (
      lbl &&
      !isNaN(val) &&
      !/^(create|make|draw|part|step|2d|html)$/i.test(lbl)
    ) {
      extractedLabels.push(lbl.slice(0, 14));
      extractedValues.push(val);
    }
  }

  const lower = clean.toLowerCase();
  let labels = extractedLabels;
  let values = extractedValues;
  let unit = 'Units';

  if (labels.length < 3) {
    if (/\b(revenue|sales|profit|finance|market|growth|gdp|stock)\b/i.test(lower)) {
      labels = ['Q1', 'Q2', 'Q3', 'Q4', 'Q1 Proj', 'Q2 Proj'];
      values = [42, 58, 74, 91, 108, 128];
      unit = '$M USD';
    } else if (/\b(ai|model|benchmark|speed|accuracy|token|tech)\b/i.test(lower)) {
      labels = ['Baseline', 'v1.5 Core', 'v2.0 Pro', 'v2.5 Turbo', 'GOT Local', 'GOT Ultra'];
      values = [64, 72, 81, 88, 95, 98];
      unit = 'Score %';
    } else if (/\b(population|country|world|city|users)\b/i.test(lower)) {
      labels = ['Region A', 'Region B', 'Region C', 'Region D', 'Region E', 'Region F'];
      values = [310, 480, 620, 540, 790, 920];
      unit = 'Million';
    } else {
      labels = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6'];
      values = [28, 46, 63, 79, 88, 97];
      unit = 'Index';
    }
  }

  const defaultMode = /\b(pie|donut|share|distribution)\b/i.test(lower)
    ? 'pie'
    : /\b(line|curve|trend|time)\b/i.test(lower)
    ? 'line'
    : /\b(graphic|diagram|vector|2d)\b/i.test(lower)
    ? 'graphic'
    : 'bar';

  const interactiveGraphHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Interactive Graph & 2D Graphic Studio</title>
<style>
  :root {
    --bg: #0c0a09;
    --card: #1c1917;
    --border: rgba(255,255,255,0.12);
    --text: #fafaf9;
    --muted: #a8a29e;
    --accent: #f59e0b;
    --accent2: #38bdf8;
    --accent3: #10b981;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, sans-serif;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 100vh;
  }
  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: var(--card);
    border: 1px solid var(--border);
    padding: 12px 16px;
    border-radius: 16px;
  }
  .title-block h1 { font-size: 16px; font-weight: 800; color: #fff; }
  .title-block p { font-size: 11px; color: var(--muted); font-family: monospace; margin-top: 2px; }
  .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  button {
    background: rgba(255,255,255,0.07);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.18s;
  }
  button.active, button:hover {
    background: var(--accent);
    color: #0c0a09;
    border-color: var(--accent);
  }
  .canvas-wrap {
    flex: 1;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 360px;
  }
  canvas {
    width: 100%;
    max-width: 780px;
    height: 360px;
    border-radius: 12px;
    background: #141210;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
  .stat-box {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 12px;
  }
  .stat-box .lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; font-family: monospace; }
  .stat-box .val { font-size: 16px; font-weight: 800; color: var(--accent); margin-top: 2px; }
</style>
</head>
<body>
  <div class="header">
    <div class="title-block">
      <h1>${title}</h1>
      <p>GOT Agent 2D Graph &amp; Graphic Engine · Unit: ${unit}</p>
    </div>
    <div class="tabs">
      <button id="btn-bar" onclick="setMode('bar')">Bar Graph</button>
      <button id="btn-line" onclick="setMode('line')">Line &amp; Area Curve</button>
      <button id="btn-pie" onclick="setMode('pie')">Donut / Pie Chart</button>
      <button id="btn-graphic" onclick="setMode('graphic')">2D Vector Graphic</button>
      <button onclick="downloadPng()">Download PNG</button>
    </div>
  </div>
  <div class="canvas-wrap">
    <canvas id="graphCanvas" width="900" height="450"></canvas>
  </div>
  <div class="stats" id="statsGrid"></div>
<script>
const labels = ${JSON.stringify(labels)};
const values = ${JSON.stringify(values)};
const unit = ${JSON.stringify(unit)};
const title = ${JSON.stringify(title)};
const colors = ['#f59e0b', '#38bdf8', '#10b981', '#a855f7', '#f43f5e', '#eab308', '#06b6d4', '#ec4899'];
let mode = ${JSON.stringify(defaultMode)};
let anim = 0;

const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const maxVal = Math.max(...values, 1);
const sumVal = values.reduce((a, b) => a + b, 0);
const avgVal = (sumVal / values.length).toFixed(1);

document.getElementById('statsGrid').innerHTML = [
  { l: 'Peak Value', v: maxVal + ' ' + unit },
  { l: 'Average', v: avgVal + ' ' + unit },
  { l: 'Total Sum', v: sumVal.toFixed(1) + ' ' + unit },
  { l: 'Data Points', v: values.length + ' Series' }
].map(s => '<div class="stat-box"><div class="lbl">' + s.l + '</div><div class="val">' + s.v + '</div></div>').join('');

function setMode(m) {
  mode = m;
  anim = 0;
  ['bar', 'line', 'pie', 'graphic'].forEach(id => {
    const el = document.getElementById('btn-' + id);
    if (el) el.className = id === m ? 'active' : '';
  });
}
setMode(mode);

function drawGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = 60 + i * 62;
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(850, y);
    ctx.stroke();
    ctx.fillStyle = '#a8a29e';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal * (1 - i / 5)), 68, y + 4);
  }
}

function render(ts) {
  anim = Math.min(1, anim + 0.035);
  const ease = 1 - Math.pow(1 - anim, 3);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mode === 'bar') {
    drawGrid();
    const slotW = 740 / labels.length;
    const barW = Math.min(68, slotW * 0.62);
    labels.forEach((lbl, i) => {
      const h = (values[i] / maxVal) * 305 * ease;
      const x = 95 + i * slotW + (slotW - barW) / 2;
      const y = 370 - h;
      const grad = ctx.createLinearGradient(0, y, 0, 370);
      grad.addColorStop(0, colors[i % colors.length]);
      grad.addColorStop(1, 'rgba(245,158,11,0.18)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, Math.max(4, h), 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(values[i], x + barW / 2, y - 10);
      ctx.fillStyle = '#d6d3d1';
      ctx.font = '12px sans-serif';
      ctx.fillText(lbl, x + barW / 2, 398);
    });
  } else if (mode === 'line') {
    drawGrid();
    const stepX = 720 / Math.max(1, labels.length - 1);
    const pts = labels.map((lbl, i) => ({
      x: 105 + i * stepX,
      y: 370 - (values[i] / maxVal) * 300 * ease,
      val: values[i],
      lbl
    }));
    ctx.beginPath();
    ctx.moveTo(pts[0].x, 370);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, 370);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, 60, 0, 370);
    areaGrad.addColorStop(0, 'rgba(56,189,248,0.42)');
    areaGrad.addColorStop(1, 'rgba(56,189,248,0.0)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#0c0a09';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.val, p.x, p.y - 14);
      ctx.fillStyle = '#d6d3d1';
      ctx.font = '12px sans-serif';
      ctx.fillText(p.lbl, p.x, 398);
    });
  } else if (mode === 'pie') {
    let startAngle = -Math.PI / 2;
    const cx = 310, cy = 225, r = 140;
    labels.forEach((lbl, i) => {
      const slice = (values[i] / Math.max(sumVal, 1)) * Math.PI * 2 * ease;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#141210';
      ctx.lineWidth = 3;
      ctx.stroke();
      startAngle += slice;

      // Legend
      const lx = 530, ly = 85 + i * 44;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.roundRect(lx, ly, 18, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#fafaf9';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      const pct = ((values[i] / Math.max(sumVal, 1)) * 100).toFixed(1);
      ctx.fillText(lbl + ' — ' + values[i] + ' (' + pct + '%)', lx + 28, ly + 14);
    });
    ctx.beginPath();
    ctx.arc(cx, cy, 66, 0, Math.PI * 2);
    ctx.fillStyle = '#141210';
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOTAL', cx, cy - 4);
    ctx.fillStyle = '#fff';
    ctx.fillText(sumVal.toFixed(0), cx, cy + 18);
  } else {
    // 2D Interactive Vector Graphic Diagram
    const t = ts * 0.002;
    const cx = 450, cy = 225;
    for (let ring = 1; ring <= 3; ring++) {
      ctx.beginPath();
      ctx.arc(cx, cy, ring * 55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245,158,11,' + (0.35 - ring * 0.08) + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    labels.forEach((lbl, i) => {
      const ang = (i / labels.length) * Math.PI * 2 + t * 0.35;
      const dist = 145;
      const nx = cx + Math.cos(ang) * dist;
      const ny = cy + Math.sin(ang) * dist;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(nx, ny, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1917';
      ctx.fill();
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, nx, ny - 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(String(values[i]), nx, ny + 13);
    });
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.fillStyle = '#0c0a09';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('2D CORE', cx, cy + 4);
  }

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

function downloadPng() {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'got-agent-graph.png';
  a.click();
}
</script>
</body>
</html>`;

  const reply = `### Part 1 — Data Analysis & 2D Graphic Specification
I have analyzed your request for **"${title}"** and built an interactive **Multi-Mode 2D Graph & Vector Graphic Studio**:
• **Series Analyzed**: ${labels.map((l, idx) => `\`${l}: ${values[idx]} ${unit}\``).join(' · ')}
• **Interactive View Modes**: Switch live between **Bar Graph**, **Line & Area Curve**, **Donut / Pie Chart**, and **Animated 2D Vector Graphic** inside the preview below!

---

### Part 2 — Interactive 2D Graph & Graphic Live Canvas
Use the top buttons inside the live widget below to switch chart types or export as a PNG graphic:

\`\`\`html
${interactiveGraphHtml}
\`\`\`

---

### Part 3 — Customizing Data & Graphics
Tell me if you want to add new data series, compare multiple datasets, plot mathematical equations, or turn this graph into a 9:16 animated HTML5 video!`;

  return {
    reply,
    highlights: [
      '2D Graph & Graphic Studio',
      'Interactive Bar / Line / Pie / 2D Vector',
      `Model: ${agentMode}`,
    ],
    followUpPrompts: [
      `Turn this "${title}" graph into a 9:16 2D HTML5 animated video`,
      `Add 4 more data points and a comparison trendline to this graph`,
      `Export a Python matplotlib & Chart.js version of this graph`,
    ],
  };
}

/**
 * Detects if the user is asking GOT Agent to create/add a Large Project or multi-file software project.
 */
export function isLargeProjectRequest(prompt: string, agentMode?: string): boolean {
  if (agentMode === 'Project Studio') return true;
  const clean = String(prompt || '').toLowerCase();
  if (!clean) return false;
  return /\b(add\s+project|create\s+a?\s*project|new\s+project|large\s+project|build\s+a?\s*full\s+project|multi[\s-]?file\s+project|save\s+in\s+project|add\s+to\s+project|project\s+studio)\b/i.test(
    clean
  );
}

/**
 * Builds a complete multi-file Large Project package and saves it into the user's Projects Workspace.
 */
export function buildLargeProjectPackage(
  prompt: string,
  agentMode = 'GOT LOCAL'
): {
  project: SavedAiProject;
  reply: string;
  highlights: string[];
  followUpPrompts: string[];
} {
  const clean = String(prompt || '').trim();
  const stripped = clean
    .replace(
      /^(please\s+)?(can\s+you\s+)?(add\s+project|create\s+a?\s*large\s+project|create\s+a?\s*project|build\s+a?\s*large\s+project|new\s+project|add\s+in\s+ai\s+project)\s*[:\-]?\s*(for|about|on|called|named)?\s*/i,
      ''
    )
    .trim();

  const rawTitle = stripped || 'Full-Stack Interactive AI Analytics & Workflow Suite';
  const title =
    rawTitle.length > 54
      ? `${rawTitle.slice(0, 51)}...`
      : rawTitle.replace(/\b\w/g, (c) => c.toUpperCase());

  const nowStr = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — GOT Agent Project Studio</title>
  <style>
    :root {
      --bg: #0c0a09;
      --panel: #1c1917;
      --border: rgba(255,255,255,0.12);
      --text: #fafaf9;
      --accent: #f59e0b;
      --emerald: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, sans-serif;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    header {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .badge {
      background: rgba(16,185,129,0.15);
      color: var(--emerald);
      border: 1px solid rgba(16,185,129,0.35);
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-family: monospace;
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .card h3 { font-size: 14px; color: var(--accent); }
    .card p { font-size: 12px; color: #a8a29e; line-height: 1.5; }
    .controls { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
    button {
      background: var(--accent);
      color: #0c0a09;
      border: none;
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    input {
      flex: 1;
      background: #0c0a09;
      color: #fff;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 12px;
    }
    .task-list { list-style: none; display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
    .task-item {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1 style="font-size:18px;font-weight:800;">${title}</h1>
      <p style="font-size:12px;color:#a8a29e;margin-top:2px;">Large Multi-Module Project · Saved in GOT Agent Project Workspace</p>
    </div>
    <span class="badge">● ACTIVE PROJECT BUILD</span>
  </header>

  <div class="grid">
    <div class="card">
      <h3>1. Interactive Task &amp; Module Manager</h3>
      <p>Add live modules, milestones, or data items directly inside your running project.</p>
      <div class="controls">
        <input id="modInput" placeholder="Add new feature or item..." />
        <button onclick="addItem()">+ Add</button>
      </div>
      <ul class="task-list" id="itemList"></ul>
    </div>

    <div class="card">
      <h3>2. Live Telemetry &amp; Performance Canvas</h3>
      <p>Real-time 2D metric monitor rendered at 60 FPS.</p>
      <canvas id="projCanvas" width="380" height="170" style="width:100%;height:150px;background:#0c0a09;border-radius:12px;border:1px solid var(--border);"></canvas>
    </div>
  </div>

  <script>
    const items = ['Core Architecture Initialized', '2D Real-Time Telemetry Active', 'State Persistence Connected'];
    function renderItems() {
      document.getElementById('itemList').innerHTML = items.map((it, idx) =>
        '<li class="task-item"><span>' + it + '</span><span style="color:#10b981;font-family:monospace;font-size:11px;">[READY #' + (idx+1) + ']</span></li>'
      ).join('');
    }
    function addItem() {
      const inp = document.getElementById('modInput');
      if (inp.value.trim()) {
        items.unshift(inp.value.trim());
        inp.value = '';
        renderItems();
      }
    }
    renderItems();

    const c = document.getElementById('projCanvas');
    const ctx = c.getContext('2d');
    let t = 0;
    function loop() {
      t += 0.04;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.beginPath();
      for (let x = 0; x < c.width; x += 6) {
        const y = 85 + Math.sin(x * 0.03 + t) * 38 + Math.cos(x * 0.015 - t) * 16;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`;

  const appTsContent = `// ${title} — Core Application Controller (app.ts)
export interface ProjectModuleConfig {
  id: string;
  name: string;
  status: 'ready' | 'building' | 'verified';
  metrics: number[];
}

export class ProjectController {
  private modules: ProjectModuleConfig[] = [];

  constructor(public readonly projectName: string) {
    this.bootstrap();
  }

  private bootstrap(): void {
    this.modules = [
      { id: 'mod-core', name: 'Core Engine', status: 'verified', metrics: [98, 99, 100] },
      { id: 'mod-ui', name: 'Liquid Glass UI Layer', status: 'verified', metrics: [95, 97, 99] },
      { id: 'mod-api', name: 'Real-Time Data Pipeline', status: 'ready', metrics: [92, 96, 98] },
    ];
  }

  public addModule(name: string): ProjectModuleConfig {
    const created: ProjectModuleConfig = {
      id: 'mod-' + Date.now(),
      name,
      status: 'verified',
      metrics: [100],
    };
    this.modules.push(created);
    return created;
  }

  public getSummary(): string {
    return \`\${this.projectName}: \${this.modules.length} active modules verified.\`;
  }
}
`;

  const readmeContent = `# ${title}

## Project Overview
Generated & Managed by **GOT Agent Project Studio** (Part-Wise Large Project Architecture).

### Included Files
1. \`index.html\` — Full interactive UI + live 2D telemetry canvas
2. \`src/app.ts\` — Modular TypeScript controller & state engine
3. \`README.md\` — Architecture & deployment guide
`;

  const project: SavedAiProject = {
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    description: clean,
    category: 'Full-Stack Web & 2D Studio',
    createdAt: nowStr,
    updatedAt: nowStr,
    files: [
      { name: 'index.html', language: 'html', content: indexHtmlContent },
      { name: 'src/app.ts', language: 'typescript', content: appTsContent },
      { name: 'README.md', language: 'markdown', content: readmeContent },
    ],
    previewHtml: indexHtmlContent,
  };

  const reply = `### Part 1 — Large Project Added to Your AI Project Workspace
I have created and saved the multi-file project **"${title}"** inside your **GOT Agent Projects Workspace** (\`+ Add Project\`):
• **Project ID**: \`${project.id}\`
• **Files Generated**: \`index.html\` (Interactive UI + 2D Canvas), \`src/app.ts\` (TypeScript Controller), and \`README.md\`
• **Workspace Access**: Click the **"Projects (${title.slice(0, 18)}...)"** button in the top bar anytime to inspect files, add new features, or download the full project!

---

### Part 2 — Interactive Live Application Preview (\`index.html\`)
\`\`\`html
${indexHtmlContent}
\`\`\`

---

### Part 3 — Core TypeScript Architecture (\`src/app.ts\`)
\`\`\`typescript
${appTsContent}
\`\`\`

---

### Part 4 — Next Steps & Expansion
Click any prompt below or ask me to add more pages, database schemas, or 2D graphs into **"${title}"**!`;

  return {
    project,
    reply,
    highlights: [
      `Project Saved: ${title.slice(0, 24)}`,
      'Multi-File Large Project Studio',
      `Model: ${agentMode}`,
    ],
    followUpPrompts: [
      `Add an interactive 2D analytics graph module to project "${title.slice(0, 22)}"`,
      `Write the backend Express API routes for "${title.slice(0, 22)}"`,
      `Create a 2D HTML5 explainer video showcasing "${title.slice(0, 22)}"`,
    ],
  };
}
