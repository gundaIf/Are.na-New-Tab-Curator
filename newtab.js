const DEFAULTS = ["arena-influences", "accidental-renaissance", "objet-d-art", "god-mode"];

const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewer-img");
const viewerText = document.getElementById("viewer-text");
const openArena = document.getElementById("open-arena");
const clock = document.getElementById("clock");

let items = [];
let index = 0;

function tick() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
tick();
setInterval(tick, 1000);

function isValidSlug(slug) {
  return /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(slug);
}

function classify(block) {
  const cls = (block.class || "").toLowerCase();
  if (cls === "channel") return null;
  if (cls === "text") return "text";
  if (cls === "link") return "link";
  if (block.image?.display?.url || block.image?.large?.url) return "image";
  if ((block.content || "").trim()) return "text";
  if (block.source?.url) return "link";
  return null;
}

function mapBlock(block, slug) {
  const kind = classify(block);
  if (!kind) return null;
  const thumb = block.image?.display?.url || block.image?.large?.url || null;
  if (kind === "image" && !thumb) return null;
  return {
    id: block.id,
    kind,
    title: (block.title || block.generated_title || "").trim(),
    content: (block.content || "").trim() || null,
    thumb,
    large: block.image?.large?.url || block.image?.original?.url || thumb,
    arenaUrl: `https://www.are.na/block/${block.id}`,
    channel: slug,
    connectedAt: block.connected_at || null,
  };
}

async function fetchChannel(slug, token) {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(
    `https://api.are.na/v2/channels/${encodeURIComponent(slug)}/contents?per=36`,
    { headers }
  );
  if (!res.ok) throw new Error(`${slug}: ${res.status}`);
  const data = await res.json();
  return (data.contents || []).map((b) => mapBlock(b, slug)).filter(Boolean);
}

async function loadFeed() {
  statusEl.textContent = "Loading…";
  grid.replaceChildren();
  const { token, channels } = await chrome.storage.sync.get(["token", "channels"]);
  const slugs = (Array.isArray(channels) && channels.length ? channels : DEFAULTS)
    .map((s) => String(s).trim())
    .filter(isValidSlug)
    .slice(0, 8);
  const seen = new Set();
  const next = [];
  const results = await Promise.allSettled(slugs.map((slug) => fetchChannel(slug, token)));
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      next.push(item);
    }
  }
  next.sort((a, b) => Date.parse(b.connectedAt || 0) - Date.parse(a.connectedAt || 0));
  items = next;
  if (!items.length) {
    statusEl.textContent = "No blocks. Open Sources and pick public channels.";
    return;
  }
  statusEl.textContent = "";
  for (const [i, item] of items.entries()) {
    const btn = document.createElement("button");
    btn.className = "card";
    btn.type = "button";
    if (item.thumb) {
      const img = document.createElement("img");
      img.src = item.thumb;
      img.alt = item.title || "Are.na block";
      img.loading = "lazy";
      btn.appendChild(img);
    } else {
      const copy = document.createElement("div");
      copy.className = "copy";
      copy.textContent = (item.content || item.title || "Untitled").slice(0, 280);
      btn.appendChild(copy);
    }
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<span></span><span></span>`;
    meta.children[0].textContent = item.title || item.channel;
    meta.children[1].textContent = item.kind;
    btn.appendChild(meta);
    btn.addEventListener("click", () => openViewer(i));
    grid.appendChild(btn);
  }
}

function openViewer(i) {
  index = i;
  const item = items[index];
  if (!item) return;
  viewer.hidden = false;
  if (item.large) {
    viewerImg.hidden = false;
    viewerImg.src = item.large;
    viewerImg.alt = item.title || "";
    viewerText.hidden = true;
  } else {
    viewerImg.hidden = true;
    viewerText.hidden = false;
    viewerText.textContent = item.content || item.title || "";
  }
  openArena.href = item.arenaUrl;
}

function closeViewer() {
  viewer.hidden = true;
  viewerImg.removeAttribute("src");
}

document.getElementById("refresh").addEventListener("click", () => loadFeed());
document.getElementById("settings").addEventListener("click", () => chrome.runtime.openOptionsPage());
document.getElementById("close").addEventListener("click", closeViewer);
document.getElementById("prev").addEventListener("click", () => openViewer((index - 1 + items.length) % items.length));
document.getElementById("next").addEventListener("click", () => openViewer((index + 1) % items.length));
document.addEventListener("keydown", (e) => {
  if (viewer.hidden) return;
  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowRight") openViewer((index + 1) % items.length);
  if (e.key === "ArrowLeft") openViewer((index - 1 + items.length) % items.length);
});

loadFeed().catch((err) => {
  statusEl.textContent = err.message || "Could not load Are.na.";
});
