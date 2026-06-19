const SAVE_API_BASE = "/api/saves";

const summaryEl = document.getElementById("adminSummary");
const tableBodyEl = document.getElementById("adminTableBody");
const searchInputEl = document.getElementById("adminSearchInput");
const refreshBtnEl = document.getElementById("adminRefreshBtn");
const saveBtnEl = document.getElementById("adminSaveBtn");
const deleteBtnEl = document.getElementById("adminDeleteBtn");
const detailTitleEl = document.getElementById("adminDetailTitle");
const detailMetaEl = document.getElementById("adminDetailMeta");
const editorEl = document.getElementById("adminStateEditor");
const feedbackEl = document.getElementById("adminFeedback");

const adminState = {
  saves: [],
  filtered: [],
  activeProfile: "",
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

function setFeedback(message = "", kind = "") {
  if (!feedbackEl) return;
  feedbackEl.textContent = message;
  feedbackEl.classList.remove("is-error", "is-success");
  if (kind) feedbackEl.classList.add(kind);
}

function renderSummary() {
  if (!summaryEl) return;
  const claimedLots = adminState.saves.filter((entry) => entry.worldBaseLotId).length;
  const totalFame = adminState.saves.reduce((sum, entry) => sum + (Number(entry.fame) || 0), 0);
  const totalMoney = adminState.saves.reduce((sum, entry) => sum + (Number(entry.money) || 0), 0);
  const avgLevel = adminState.saves.length
    ? (adminState.saves.reduce((sum, entry) => sum + (Number(entry.cityLevel) || 1), 0) / adminState.saves.length).toFixed(1)
    : "0.0";
  summaryEl.innerHTML = `
    <article><strong>${adminState.saves.length}</strong><span>regisztralt jatekos</span></article>
    <article><strong>${claimedLots}</strong><span>lefoglalt kulso bazis</span></article>
    <article><strong>${totalFame}</strong><span>ossz hirnev</span></article>
    <article><strong>${avgLevel}</strong><span>atlagos varosszint</span></article>
  `;
}

function renderTable() {
  if (!tableBodyEl) return;
  if (!adminState.filtered.length) {
    tableBodyEl.innerHTML = `<tr><td colspan="7">Nincs talalat.</td></tr>`;
    return;
  }
  tableBodyEl.innerHTML = adminState.filtered.map((entry) => `
    <tr data-profile="${entry.profileName}" class="${entry.profileName === adminState.activeProfile ? "is-active" : ""}">
      <td><strong>${entry.profileName}</strong></td>
      <td>${entry.cityLevel || 1}</td>
      <td>${entry.fame || 0}</td>
      <td>${entry.money || 0} $</td>
      <td>${entry.heat || 0}%</td>
      <td>${entry.worldBaseLotId || "-"}</td>
      <td>${formatDateTime(entry.updatedAt)}</td>
    </tr>
  `).join("");
  [...tableBodyEl.querySelectorAll("tr[data-profile]")].forEach((row) => {
    row.addEventListener("click", () => {
      selectProfile(row.dataset.profile || "");
    });
  });
}

function applyFilter() {
  const query = (searchInputEl?.value || "").trim().toLowerCase();
  adminState.filtered = adminState.saves.filter((entry) => {
    if (!query) return true;
    return [
      entry.profileName,
      entry.worldBaseLotId,
      entry.worldBaseLotId ? `${entry.worldBaseLotId}` : "",
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });
  renderTable();
}

async function fetchAllSaves() {
  const response = await fetch(SAVE_API_BASE, { headers: { Accept: "application/json" } });
  const payload = response.ok ? await response.json() : { saves: [] };
  adminState.saves = Array.isArray(payload.saves) ? payload.saves : [];
  renderSummary();
  applyFilter();
  if (adminState.activeProfile) {
    const stillExists = adminState.saves.find((entry) => entry.profileName === adminState.activeProfile);
    if (stillExists) {
      await selectProfile(adminState.activeProfile, false);
      return;
    }
  }
  clearDetail();
}

function clearDetail() {
  adminState.activeProfile = "";
  if (detailTitleEl) detailTitleEl.textContent = "Valassz ki egy jatekost";
  if (detailMetaEl) detailMetaEl.textContent = "A jobb oldali szerkeszto a kivalasztott profil teljes allapotat mutatja JSON-ben.";
  if (editorEl) editorEl.value = "";
  if (saveBtnEl) saveBtnEl.disabled = true;
  if (deleteBtnEl) deleteBtnEl.disabled = true;
  renderTable();
}

async function selectProfile(profileName, refreshTable = true) {
  if (!profileName) return;
  const response = await fetch(`${SAVE_API_BASE}/${encodeURIComponent(profileName)}`, { headers: { Accept: "application/json" } });
  const payload = response.ok ? await response.json() : { found: false };
  if (!payload?.found) {
    setFeedback("A profil mar nem talalhato.", "is-error");
    await fetchAllSaves();
    return;
  }
  adminState.activeProfile = profileName;
  if (detailTitleEl) detailTitleEl.textContent = profileName;
  if (detailMetaEl) {
    detailMetaEl.textContent = `Letrehozva: ${formatDateTime(payload.createdAt)} | Frissitve: ${formatDateTime(payload.updatedAt)}`;
  }
  if (editorEl) {
    editorEl.value = JSON.stringify(payload.state || {}, null, 2);
  }
  if (saveBtnEl) saveBtnEl.disabled = false;
  if (deleteBtnEl) deleteBtnEl.disabled = false;
  if (refreshTable) renderTable();
  setFeedback("");
}

async function saveProfile() {
  if (!adminState.activeProfile || !editorEl) return;
  try {
    const state = JSON.parse(editorEl.value);
    const response = await fetch(`${SAVE_API_BASE}/${encodeURIComponent(adminState.activeProfile)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      body: JSON.stringify({ state }),
    });
    if (!response.ok) throw new Error("Nem sikerult a mentes.");
    setFeedback("A profil sikeresen frissult.", "is-success");
    await fetchAllSaves();
    await selectProfile(adminState.activeProfile, false);
  } catch (error) {
    setFeedback(error?.message || "Hibas JSON vagy sikertelen mentes.", "is-error");
  }
}

async function deleteProfile() {
  if (!adminState.activeProfile) return;
  const confirmed = window.confirm(`Toroljuk vegleg a(z) ${adminState.activeProfile} profilt?`);
  if (!confirmed) return;
  const response = await fetch(`${SAVE_API_BASE}/${encodeURIComponent(adminState.activeProfile)}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) {
    setFeedback("A torles nem sikerult.", "is-error");
    return;
  }
  const deletedProfile = adminState.activeProfile;
  clearDetail();
  setFeedback(`A profil torolve lett: ${deletedProfile}.`, "is-success");
  await fetchAllSaves();
}

refreshBtnEl?.addEventListener("click", () => {
  void fetchAllSaves();
});

searchInputEl?.addEventListener("input", applyFilter);
saveBtnEl?.addEventListener("click", () => {
  void saveProfile();
});
deleteBtnEl?.addEventListener("click", () => {
  void deleteProfile();
});

void fetchAllSaves();
