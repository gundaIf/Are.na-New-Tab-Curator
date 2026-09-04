const DEFAULTS = ["arena-influences", "accidental-renaissance", "objet-d-art", "god-mode"];

async function restore() {
  const { token, channels } = await chrome.storage.sync.get(["token", "channels"]);
  document.getElementById("token").value = token || "";
  document.getElementById("channels").value = (channels && channels.length ? channels : DEFAULTS).join("\n");
}

document.getElementById("save").addEventListener("click", async () => {
  const token = document.getElementById("token").value.trim();
  const channels = document
    .getElementById("channels")
    .value.split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(s))
    .slice(0, 8);
  await chrome.storage.sync.set({ token, channels: channels.length ? channels : DEFAULTS });
  document.getElementById("msg").textContent = "Saved. Open a new tab to refresh.";
});

restore();
