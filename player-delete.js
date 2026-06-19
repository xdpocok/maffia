const SAVE_API_BASE = "/api/saves";
const LAST_PROFILE_KEY = "maffia.birodalom.lastProfile";
const LEGACY_STORAGE_KEYS = [
  "maffia.birodalom.save.phaser.v3",
  "maffia.birodalom.save.phaser.v2",
  "maffia.birodalom.save.phaser.v1",
];

const summaryEl = document.getElementById("playerDeleteSummary");
const tableBodyEl = document.getElementById("playerDeleteTableBody");
const searchInputEl = document.getElementById("playerDeleteSearchInput");
const refreshBtnEl = document.getElementById("playerDeleteRefreshBtn");
const feedbackEl = document.getElementById("playerDeleteFeedback");

const pageState = {
  saves: [],
  filtered: [],
};

function formatDateTime(timestamp) {
  if (!Number.isFinite(Number(timestamp))) return "-";
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(Number(timestamp)));
}

function setFeedback(message, kind = "") {
  if (!feedbackEl) return;
  feedbackEl.textContent = message;
  feedbackEl.classList.remove("is-success", "is-error");
  if (kind) feedbackEl.classList.add(kind);
}

function renderSummary() {
  if (!summaryEl) return;
  const claimedLots = pageState.saves.filter((entry) => entry.worldBaseLotId).length;
  const highLevel = pageState.saves.filter((entry) => Number(entry.cityLevel) >= 5).length;
  summaryEl.innerHTML = `
    <article><strong>${pageState.saves.length}</strong><span>aktiv player mentes</span></article>
    <article><strong>${claimedLots}</strong><span>lefoglalt kulso bazis</span></article>
    <article><strong>${highLevel}</strong><span>erossebb, 5+ szintu profil</span></article>
  `;
}

function cleanupLocalBrowserState(profileName) {
  try {
    const remembered = window.localStorage.getItem(LAST_PROFILE_KEY) || "";
    if (remembered === profileName) {
      window.localStorage.removeItem(LAST_PROFILE_KEY);
    }
    LEGACY_STORAGE_KEYS.forEach((key) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.profileName === profileName) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // ignore broken local cache entries
      }
    });
  } catch {
    // ignore localStorage issues
  }
}

function renderTable() {
  if (!tableBodyEl) return;
  if (!pageState.filtered.length) {
    tableBodyEl.innerHTML = `<tr><td colspan="6">Nincs talalat.</td></tr>`;
    return;
  }
  tableBodyEl.innerHTML = pageState.filtered.map((entry) => `
    <tr>
      <td><strong>${entry.profileName}</strong></td>
      <td>${entry.cityLevel || 1}</td>
      <td>${entry.fame || 0}</td>
      <td>${entry.worldBaseLotId || "-"}</td>
      <td>${formatDateTime(entry.updatedAt)}</td>
      <td><button type="button" data-delete-profile="${entry.profileName}">Torles</button></td>
    </tr>
  `).join("");

  [...tableBodyEl.querySelectorAll("[data-delete-profile]")].forEach((button) => {
    button.addEventListener("click", () => {
      void deleteProfile(button.dataset.deleteProfile || "");
    });
  });
}

function applyFilter() {
  const query = (searchInputEl?.value || "").trim().toLowerCase();
  pageState.filtered = pageState.saves.filter((entry) => {
    if (!query) return true;
    return [
      entry.profileName,
      entry.worldBaseLotId,
      entry.worldBaseLotId ? `${entry.worldBaseLotId}` : "",
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });
  renderTable();
}

async function fetchPlayers() {
  const response = await fetch(SAVE_API_BASE, { headers: { Accept: "application/json" } });
  const payload = response.ok ? await response.json() : { saves: [] };
  pageState.saves = Array.isArray(payload.saves) ? payload.saves : [];
  renderSummary();
  applyFilter();
}

async function deleteProfile(profileName) {
  if (!profileName) return;
  const confirmed = window.confirm(`Biztosan toroljuk a(z) ${profileName} playert a jatek minden adatbazisos listajabol?`);
  if (!confirmed) return;
  const response = await fetch(`${SAVE_API_BASE}/${encodeURIComponent(profileName)}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) {
    setFeedback(`A torles nem sikerult: ${profileName}.`, "is-error");
    return;
  }
  cleanupLocalBrowserState(profileName);
  setFeedback(`A player teljesen torolve lett: ${profileName}.`, "is-success");
  await fetchPlayers();
}

refreshBtnEl?.addEventListener("click", () => {
  void fetchPlayers();
});

searchInputEl?.addEventListener("input", applyFilter);

void fetchPlayers();
