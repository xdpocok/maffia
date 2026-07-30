// Phaser varosterkep; csak bejelentkezes utan toltodik be.
class CityScene extends Phaser.Scene {
  constructor() {
    super("CityScene");
    this.showMapModels = false;
    this.mapGraphics = null;
    this.highlightGraphics = null;
    this.spotGraphics = null;
    this.uiTexts = {};
    this.districtZones = [];
    this.districtHotspots = [];
    this.hotspotLayout = [];
    this.meshZones = [];
    this.spotMarkers = [];
    this.spotLabels = [];
    this.mapLabels = [];
    this.mapSprites = [];
    this.actionButtons = [];
    this.logLines = [];
    this.clanChatLines = [];
    this.currentMessage = "";
    this.mapLayout = { originX: 0, originY: 0, tileW: 64, tileH: 32 };
    this.resizeRefreshTimer = null;
  }

  create() {
    sceneRef = this;
    this.mapGraphics = this.add.graphics();
    this.mapGraphics.setDepth(-100);
    this.highlightGraphics = this.add.graphics().setScrollFactor(0).setDepth(900);
    this.spotGraphics = this.add.graphics().setScrollFactor(0).setDepth(850);
    this.createUI();
    this.scale.on("resize", this.onResize, this);
    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => maybeSpawnQuest(),
    });
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const changed = syncTimedActions();
        void syncServerProgressionIfNeeded();
        if (changed) {
          saveGame();
          this.refreshHUD();
        }
        refreshWorldRivalRepairTimers();
        refreshRivalActionCountdown();
        if (activeChoiceSpot) showChoiceWheel(activeChoiceSpot);
      },
    });
    this.assetsReady = false;
    this.setMessage("A varos betoltese folyamatban...");
    this.loadInlineAssets()
      .catch(() => {
        this.setMessage("Nehany regi modell nem toltodott be, a terkep tovabbra is hasznalhato.");
      })
      .finally(() => {
        this.assetsReady = true;
        this.refreshScene();
        maybeSpawnQuest();
        if (state.registered) {
          this.setMessage("A mentett birodalom betoltve.");
        }
      });
  }

  resetLogs() {
    this.clanChatLines = [];
    crewPanelRenderKey = "";
    this.refreshHUD();
  }

  setMessage(text) {
    this.currentMessage = text;
    if (this.uiTexts.message) {
      this.uiTexts.message.setText(text);
    }
    if (avatarNoteEl) {
      avatarNoteEl.textContent = text;
    }
  }

  pushLog(text) {
    this.logLines.unshift(text);
    this.logLines = this.logLines.slice(0, 5);
    this.refreshHUD();
    saveGame();
  }

  pushClanChat(text) {
    this.clanChatLines.unshift(text);
    this.clanChatLines = this.clanChatLines.slice(0, 6);
    this.refreshHUD();
  }

  refreshHUD() {
    if (hudMoney) hudMoney.textContent = formatMoney(state.money);
    if (hudFame) hudFame.textContent = String(state.fame);
    const influence = state.districts.length
      ? Math.round(state.districts.reduce((sum, district) => sum + district.loyalty, 0) / state.districts.length)
      : 0;
    if (hudInfluence) hudInfluence.textContent = `${influence}%`;
    if (hudHeat) hudHeat.textContent = `${state.heat}%`;

    const profileName = (state.profileName || "Ismeretlen").trim();
    const avatarInitial = profileName.charAt(0).toUpperCase() || "M";
    const avatarLevel = getRankLevel(state.fame);
    const healthMax = 100;
    const energyMax = 100;
    const healthValue = Math.max(0, Math.min(healthMax, state.health));
    const energyValue = Math.max(0, Math.min(energyMax, state.energy));
    const selected = getSelectedDistrict();
    const nextRankFame = getNextRankFame(state.fame);
    const currentRank = getCurrentRankEntry(state.fame);
    const currentThreshold = currentRank.fame;
    const xpSpan = Math.max(1, nextRankFame - currentThreshold);
    const xpProgress = clamp(Math.round(((state.fame - currentThreshold) / xpSpan) * 100), 0, 100);

    if (avatarNameEl) avatarNameEl.textContent = profileName;
    if (avatarLevelEl) avatarLevelEl.textContent = String(avatarLevel);
    if (avatarPortraitEl) avatarPortraitEl.src = getPlayerAvatarImage();
    if (avatarBar1TextEl) avatarBar1TextEl.textContent = `${healthValue} / ${healthMax}`;
    if (avatarBar2TextEl) avatarBar2TextEl.textContent = `${energyValue} / ${energyMax}`;
    if (avatarBar1FillEl) avatarBar1FillEl.style.width = `${(healthValue / healthMax) * 100}%`;
    if (avatarBar2FillEl) avatarBar2FillEl.style.width = `${(energyValue / energyMax) * 100}%`;
    if (avatarBar3TextEl) {
      avatarBar3TextEl.textContent = nextRankFame > state.fame
        ? `${state.fame - currentThreshold} / ${xpSpan} XP`
        : "Maximum XP";
    }
    if (avatarBar3FillEl) avatarBar3FillEl.style.width = `${nextRankFame > state.fame ? xpProgress : 100}%`;
    if (avatarNoteEl) {
      avatarNoteEl.textContent = this.currentMessage || (
        selected
          ? `${selected.name} - ${selected.kind}`
          : "Regisztralj, es indul a varosi felemelkedes."
      );
    }
    if (hudQuickDock) {
      const harborUnlocked = canEnterHarbor();
      const requiredLevel = getHarborRequiredLevel();
      hudQuickDock.disabled = !harborUnlocked;
      hudQuickDock.classList.toggle("is-locked", !harborUnlocked);
      hudQuickDock.title = harborUnlocked ? "Kikoto negyed" : `Kikoto negyed: ${requiredLevel}. szinttol`;
      hudQuickDock.setAttribute("aria-label", hudQuickDock.title);
      if (hudQuickDockLabel && !document.body.classList.contains("is-harbor-map-open")) {
        hudQuickDockLabel.textContent = harborUnlocked ? "" : `${requiredLevel}. szint`;
      }
    }
    refreshCharacterPanel();
    renderCrewPanel();

    updateQuestHud();
    updateMentorPanel();
    renderProcessTasks();
    if (hudQuestTab1) hudQuestTab1.classList.toggle("is-active", Boolean(state.activeQuests?.[0]));
    if (hudQuestTab2) hudQuestTab2.classList.toggle("is-active", Boolean(state.activeQuests?.[1]));

    if (this.uiTexts.profile) {
      this.uiTexts.profile.setText(state.profileName || "Ismeretlen");
      this.uiTexts.rank.setText(rankForFame(state.fame));
      this.uiTexts.day.setText(`Nap ${state.day}`);
      this.uiTexts.money.setText(`Penz ${formatMoney(state.money)}`);
      this.uiTexts.fame.setText(`Hirnev ${state.fame}`);
      this.uiTexts.crew.setText(`Crew ${state.crew}`);
      this.uiTexts.heat.setText(`Korozes ${state.heat}%`);
      this.uiTexts.profile.setAlpha(0);
      this.uiTexts.rank.setAlpha(0);
      this.uiTexts.day.setAlpha(0);
      this.uiTexts.money.setAlpha(0);
      this.uiTexts.fame.setAlpha(0);
      this.uiTexts.crew.setAlpha(0);
      this.uiTexts.heat.setAlpha(0);
    }

    if (selected && this.uiTexts.selectedName) {
      this.uiTexts.selectedName.setText(selected.name);
      this.uiTexts.selectedMeta.setText(
        `${selected.kind} - ${selected.controlled ? "Sajat" : "Semleges"} kerulet`,
      );
      this.uiTexts.selectedDetail.setText(selected.description);
      this.uiTexts.selectedStats.setText(
        `Biztonsag ${selected.security}   Huseg ${selected.loyalty}%   Bevetel ${selected.value * 20 + selected.loyalty} $`,
      );
    }

    if (this.uiTexts.log) {
      this.uiTexts.log.setText(
        this.clanChatLines.length ? this.clanChatLines.join("\n") : "Nincs klanbeszelgetes.",
      );
    }
  }

  createUI() {

    const titleText = { fontFamily: "Georgia, 'Times New Roman', serif", color: "#232427" };
    const hudText = { fontFamily: "Inter, system-ui, sans-serif", color: "#59616f" };
    const whiteText = { fontFamily: "Inter, system-ui, sans-serif", color: "#f5f3ee" };

    this.uiTexts.profile = this.add.text(18, 16, "", { ...titleText, fontSize: "22px", fontStyle: "bold" }).setScrollFactor(0);
    this.uiTexts.profile.setAlpha(0);
    this.uiTexts.rank = this.add.text(18, 44, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.rank.setAlpha(0);
    this.uiTexts.day = this.add.text(18, 66, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.day.setAlpha(0);
    this.uiTexts.money = this.add.text(18, 88, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.money.setAlpha(0);
    this.uiTexts.fame = this.add.text(18, 110, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.fame.setAlpha(0);
    this.uiTexts.crew = this.add.text(18, 132, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.crew.setAlpha(0);
    this.uiTexts.heat = this.add.text(18, 154, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.heat.setAlpha(0);

    this.selectedBox = this.add.rectangle(0, 0, 248, 180, 0xf5f1e7, 0.84).setStrokeStyle(1, 0x7f7a70, 0.16).setScrollFactor(0);
    this.uiTexts.selectedName = this.add.text(0, 0, "", { ...titleText, fontSize: "20px", fontStyle: "bold" }).setScrollFactor(0);
    this.uiTexts.selectedMeta = this.add.text(0, 0, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.selectedDetail = this.add.text(0, 0, "", { ...hudText, fontSize: "13px", wordWrap: { width: 208 } }).setScrollFactor(0);
    this.uiTexts.selectedStats = this.add.text(0, 0, "", { ...hudText, fontSize: "12px", wordWrap: { width: 208 } }).setScrollFactor(0);
    this.uiTexts.message = this.add.text(0, 0, "Regisztralj, es indul a varosi felemelkedes.", {
      ...hudText,
      fontSize: "13px",
      wordWrap: { width: 208 },
    }).setScrollFactor(0);

    this.actionPanel = this.add.rectangle(0, 0, 252, 306, 0xf5f1e7, 0.8).setStrokeStyle(1, 0x7f7a70, 0.16).setScrollFactor(0);
    const actions = [
      ["1 Utcai rablas", handleStreetRobbery],
      ["2 Bolt kifosztasa", handleShopRaid],
      ["3 Toborzas", handleRecruit],
      ["4 Kerulet atvetele", handleExpand],
      ["5 Varos fejlesztese", handleUpgradeCity],
      ["6 Lapulas", handleLayLow],
    ];
    this.actionButtons = actions.map(([label, fn]) => {
      const zone = this.add.zone(0, 0, 204, 36).setInteractive({ useHandCursor: true });
      const bg = this.add.rectangle(0, 0, 204, 36, 0xffffff, 0.42).setStrokeStyle(1, 0x8c8377, 0.14);
      const txt = this.add.text(0, 0, label, { ...whiteText, fontSize: "13px", fontStyle: "bold" }).setOrigin(0.5);
      const container = this.add.container(0, 0, [bg, txt]).setScrollFactor(0);
      zone.on("pointerdown", async () => {
        if (!state.registered) {
          this.setMessage("Elobb regisztralj.");
          return;
        }
        await fn();
        if (state.heat >= 100) triggerBust();
        this.refreshHUD();
        this.refreshMap();
      });
      return { zone, container };
    });

    this.endDayBg = this.add.rectangle(0, 0, 100, 34, 0xd86254, 1).setScrollFactor(0);
    this.endDayText = this.add.text(0, 0, "Nap", { ...whiteText, fontSize: "16px", fontStyle: "bold" }).setOrigin(0.5);
    this.endDayZone = this.add.zone(0, 0, 100, 34).setInteractive({ useHandCursor: true });
    this.endDayZone.on("pointerdown", async () => {
      if (!state.registered) return;
      await endDay();
    });
    this.endDayContainer = this.add.container(0, 0, [this.endDayBg, this.endDayText]).setScrollFactor(0);

    this.resetBg = this.add.rectangle(0, 0, 100, 34, 0xffffff, 0.44).setStrokeStyle(1, 0x8c8377, 0.14).setScrollFactor(0);
    this.resetText = this.add.text(0, 0, "Uj jatek", { ...whiteText, fontSize: "16px", fontStyle: "bold" }).setOrigin(0.5);
    this.resetZone = this.add.zone(0, 0, 100, 34).setInteractive({ useHandCursor: true });
    this.resetZone.on("pointerdown", () => resetGame());
    this.resetContainer = this.add.container(0, 0, [this.resetBg, this.resetText]).setScrollFactor(0);

    this.logBg = this.add.rectangle(0, 0, 300, 112, 0xf5f1e7, 0.82).setStrokeStyle(1, 0x7f7a70, 0.16).setScrollFactor(0);
    this.uiTexts.log = this.add.text(0, 0, "", { ...hudText, fontSize: "12px", wordWrap: { width: 256 } }).setScrollFactor(0);

    this.setUiDepth();
    this.refreshHUD();
    this.uiTexts.message?.destroy();
    this.uiTexts.message = null;
    this.selectedBox?.destroy();
    this.selectedBox = null;
    this.uiTexts.selectedName = null;
    this.uiTexts.selectedMeta = null;
    this.uiTexts.selectedDetail = null;
    this.uiTexts.selectedStats = null;
    this.actionPanel?.destroy();
    this.actionPanel = null;
    this.actionButtons.forEach((entry) => {
      entry.container?.destroy();
      entry.zone?.destroy();
    });
    this.actionButtons = [];
    this.endDayBg?.destroy();
    this.endDayText?.destroy();
    this.endDayContainer?.destroy();
    this.endDayZone?.destroy();
    this.resetBg?.destroy();
    this.resetText?.destroy();
    this.resetContainer?.destroy();
    this.resetZone?.destroy();
    this.logBg?.destroy();
    this.logBg = null;
    this.uiTexts.log = null;
    this.uiTexts.profile?.destroy();
    this.uiTexts.rank?.destroy();
    this.uiTexts.day?.destroy();
    this.uiTexts.money?.destroy();
    this.uiTexts.fame?.destroy();
    this.uiTexts.crew?.destroy();
    this.uiTexts.heat?.destroy();
    this.uiTexts.profile = null;
    this.uiTexts.rank = null;
    this.uiTexts.day = null;
    this.uiTexts.money = null;
    this.uiTexts.fame = null;
    this.uiTexts.crew = null;
    this.uiTexts.heat = null;
  }

  setUiDepth() {
    const objects = [
      this.selectedBox,
      this.actionPanel,
      this.endDayBg,
      this.endDayText,
      this.endDayContainer,
      this.resetBg,
      this.resetText,
      this.resetContainer,
      this.logBg,
      ...Object.values(this.uiTexts),
      ...this.actionButtons.flatMap((entry) => [entry.container, entry.zone]),
      this.endDayZone,
      this.resetZone,
    ];

    objects.filter(Boolean).forEach((object) => {
      if (typeof object.setDepth === "function") {
        object.setDepth(1000);
      }
    });
  }

  async loadInlineAssets() {
    const assets = window.MAFFIA_ASSETS || {};
    const entries = [
      ...BUILDING_KEYS.map((key) => [key, assets[key]]),
      ...ROAD_KEYS.map((key) => [key, assets[key]]),
      ["tree-a", assets.treeA],
      ["tree-b", assets.treeB],
      ...DECOR_KEYS.slice(3).map((key) => [key, assets[key]]),
      [LOT_HOUSE_TEXTURE_KEYS[1], "./assets/lot-house-level-1.webp"],
      [LOT_HOUSE_TEXTURE_KEYS[2], "./assets/lot-house-level-2.webp"],
      [LOT_HOUSE_TEXTURE_KEYS[3], "./assets/lot-house-level-3.webp"],
    ].filter(([, src]) => Boolean(src));

    const loadOne = (key, src) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          if (!this.textures.exists(key)) {
            this.textures.addImage(key, image);
          }
          resolve();
        };
        image.onerror = () => reject(new Error(`Nem sikerult betolteni a beagyazott assetet: ${key}`));
        image.src = src;
      });

    await Promise.all(entries.map(([key, src]) => loadOne(key, src)));
  }

  resetSceneObjects() {
    this.districtZones.forEach((zone) => zone.destroy());
    this.districtZones = [];
    this.districtHotspots.forEach((zone) => zone.destroy());
    this.districtHotspots = [];
    this.hotspotLayout = [];
    this.meshZones.forEach((zone) => zone.destroy());
    this.meshZones = [];
    this.spotMarkers.forEach((marker) => marker.destroy());
    this.spotMarkers = [];
    this.spotLabels.forEach((label) => label.destroy());
    this.spotLabels = [];
    this.mapLabels.forEach((label) => label.destroy());
    this.mapLabels = [];
    this.mapSprites.forEach((sprite) => sprite.destroy());
    this.mapSprites = [];
    this.spotGraphics?.clear();
    this.highlightGraphics.clear();
  }

  refreshScene() {
    this.refreshHUD();
    this.refreshMap();
    this.layoutUI();
  }

  addMapSprite(key, x, y, scale = 1, depthBoost = 0, angle = 0) {
    const sprite = this.add.image(x, y, key);
    sprite.setOrigin(0.5, 0.5);
    sprite.setScale(scale);
    sprite.setAngle(angle);
    sprite.setDepth(y + depthBoost);
    this.mapSprites.push(sprite);
    return sprite;
  }

  drawDistrictHighlight() {
    this.highlightGraphics.clear();
  }

  buildMap(width, height) {
    const originX = width * 0.43;
    const originY = height * 0.14;
    const tileW = 58;
    const tileH = 29;
    const cols = 15;
    const rows = 15;
    const roadCols = new Set([1, 4, 7, 10, 13]);
    const roadRows = new Set([1, 4, 7, 10, 13]);

    this.mapLayout = { originX, originY, tileW, tileH };

    const neighborhoodStyles = [
      ["building-type-a", "building-type-b", "building-type-c"],
      ["building-type-d", "building-type-e", "building-type-f"],
      ["building-type-g", "building-type-h", "building-type-i"],
      ["building-type-j", "building-type-k", "building-type-l"],
      ["building-type-m", "building-type-n", "building-type-o"],
      ["building-type-p", "building-type-q", "building-type-r"],
      ["building-type-s", "building-type-t", "building-type-u"],
    ];

    const placeHouse = (key, x, y, scale, depth, angle = 0) => {
      this.addMapSprite(key, x, y, scale, depth, angle);
    };

    for (let gy = 0; gy < rows; gy += 1) {
      for (let gx = 0; gx < cols; gx += 1) {
        const pos = gridToScreen(originX, originY, tileW, tileH, gx, gy);
        const isRoad = roadCols.has(gx) || roadRows.has(gy);
        const intersection = roadCols.has(gx) && roadRows.has(gy);

        if (isRoad) {
          const roadKey = intersection
            ? "road-asphalt-center"
            : hash2(gx, gy, 31) > 0.7
              ? "road-asphalt-pavement"
              : "road-asphalt-straight";
          this.addMapSprite(roadKey, pos.x, pos.y, 1.22, -30);
          if (!intersection && hash2(gx, gy, 47) > 0.62) {
            this.addMapSprite("road-asphalt-side", pos.x + 9, pos.y + 1, 1.08, -28);
          }
          continue;
        }

        const lotSeed = hash2(gx, gy, 19);
        if (lotSeed < 0.03) {
          this.addMapSprite("grass-corner", pos.x, pos.y + 2, 1.02, 0);
          this.addMapSprite("grass-corner-inner", pos.x + 2, pos.y + 1, 0.94, 1);
          this.addMapSprite(hash2(gx, gy, 23) > 0.5 ? "tree-a" : "tree-b", pos.x - 11, pos.y + 5, 0.62, 24);
          this.addMapSprite(hash2(gx, gy, 27) > 0.5 ? "tree-a" : "tree-b", pos.x + 13, pos.y + 6, 0.62, 24);
          continue;
        }

        const blockX = Math.floor(gx / 3);
        const blockY = Math.floor(gy / 3);
        const style = neighborhoodStyles[
          Math.floor(hash2(blockX, blockY, 41) * neighborhoodStyles.length)
        ];
        const buildingKey = style[Math.floor(hash2(gx, gy, 43) * style.length)];
        const accentKey = style[Math.floor(hash2(gx, gy, 71) * style.length)];
        const scale = 0.96 + hash2(gx, gy, 53) * 0.22;
        const shiftX = (hash2(gx, gy, 59) - 0.5) * 12;
        const shiftY = (hash2(gx, gy, 61) - 0.5) * 8;
        placeHouse(buildingKey, pos.x + shiftX, pos.y + shiftY, scale, 14);

        if (hash2(gx, gy, 67) > 0.42) {
          placeHouse(accentKey, pos.x - 14 - shiftX * 0.3, pos.y + 10 + shiftY * 0.25, scale * 0.82, 16);
        }
        if (hash2(gx, gy, 73) > 0.64) {
          this.addMapSprite(hash2(gx, gy, 79) > 0.5 ? "detail-light-single" : "detail-light-double", pos.x - 13, pos.y + 8, 0.62, 20);
        }
        if (hash2(gx, gy, 81) > 0.82) {
          this.addMapSprite(hash2(gx, gy, 83) > 0.5 ? "tree-a" : "tree-b", pos.x + 18, pos.y + 12, 0.54, 21);
        }
      }
    }

    districtDefs.forEach((district, index) => {
      const pos = gridToScreen(originX, originY, tileW, tileH, district.gridX, district.gridY);
      const baseKey = district.palette.main;
      const sideKey = district.palette.side;
      const smallKey = district.palette.small;

      this.addMapSprite(baseKey, pos.x, pos.y, 1.08 + index * 0.02, 40);
      this.addMapSprite(smallKey, pos.x - 28, pos.y + 18, 0.72, 34);
      this.addMapSprite(sideKey, pos.x + 28, pos.y + 16, 0.7, 34);

      if (district.id === "center") {
        this.addMapSprite("detail-awning-wide", pos.x - 8, pos.y + 22, 0.84, 34);
        this.addMapSprite("detail-bench", pos.x + 22, pos.y + 18, 0.68, 34);
        this.addMapSprite("detail-light-double", pos.x - 38, pos.y + 18, 0.68, 34);
      } else if (district.id === "market") {
        this.addMapSprite("detail-awning-wide", pos.x - 18, pos.y + 18, 0.9, 34);
        this.addMapSprite("detail-awning-small", pos.x + 20, pos.y + 16, 0.76, 34);
        this.addMapSprite("detail-light-single", pos.x - 40, pos.y + 22, 0.68, 34);
      } else if (district.id === "harbor") {
        this.addMapSprite("detail-barrier-type-b", pos.x - 32, pos.y + 18, 0.8, 34);
      } else if (district.id === "industrial") {
        this.addMapSprite("detail-barrier-type-a", pos.x - 18, pos.y + 22, 0.78, 32);
        this.addMapSprite("detail-dumpster-closed", pos.x + 22, pos.y + 20, 0.72, 32);
        this.addMapSprite("detail-light-single", pos.x - 40, pos.y + 18, 0.66, 32);
      } else if (district.id === "luxury") {
        this.addMapSprite("detail-light-single", pos.x - 18, pos.y + 18, 0.72, 32);
        this.addMapSprite("detail-light-single", pos.x + 20, pos.y + 18, 0.72, 32);
        this.addMapSprite("detail-bench", pos.x - 40, pos.y + 22, 0.64, 32);
      } else if (district.id === "suburb") {
        this.addMapSprite("fence-low", pos.x - 34, pos.y + 18, 0.84, 28);
        this.addMapSprite("fence-low", pos.x + 20, pos.y + 18, 0.84, 28);
        this.addMapSprite(hash2(index, 3, 5) > 0.5 ? "tree-a" : "tree-b", pos.x - 52, pos.y + 16, 0.58, 30);
      }

      const zone = this.add.zone(pos.x, pos.y + 10, 140, 110).setInteractive({ useHandCursor: true });
      zone.on("pointerup", () => {
        if (Date.now() <= mapDragState.ignoreClicksUntil) return;
        state.selectedDistrictIndex = index;
        this.refreshHUD();
        this.drawDistrictHighlight();
        if (state.registered) {
          raidDistrict(district, district.id === "market" ? "shop" : "street");
        }
        this.refreshHUD();
        this.drawDistrictHighlight();
        saveGame();
      });
      this.districtZones.push(zone);

      const label = this.add.text(pos.x - 56, pos.y - 62, district.name.toUpperCase(), {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "11px",
        color: "#6d7177",
        letterSpacing: "0.1em",
      });
      label.setAlpha(0.92);
      label.setDepth(pos.y + 60);
      this.mapLabels.push(label);
    });
  }

  refreshMap() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.resetSceneObjects();
    this.mapGraphics.clear();
    lotHouseLayer?.classList.add("hidden");
    renderSvgMapOverlay();
    if (!this.assetsReady) {
      return;
    }
    this.buildInteractiveMap(width, height);
    if (LOT_HOUSE_VISUALS_ENABLED) {
      this.renderOwnedLotHouses(width, height);
    }
    this.drawDistrictHighlight();
  }

  buildInteractiveMap(width, height) {
    const mapRect = getBackgroundMapRect(width, height);
    this.hotspotLayout = clickableBuildingDefs.map((spot) => {
      const bounds = getAreaBounds(spot);
      return {
        ...spot,
        x: mapRect.left + mapRect.width * bounds.x,
        y: mapRect.top + mapRect.height * bounds.y,
        w: mapRect.width * bounds.w,
        h: mapRect.height * bounds.h,
      };
    });
  }

  renderOwnedLotHouses(width, height) {
    if (!LOT_HOUSE_VISUALS_ENABLED) return;
    const mapRect = getBackgroundMapRect(width, height);
    clickableLotDefs.forEach((lot) => {
      const level = getLotLevel(lot);
      const textureKey = LOT_HOUSE_TEXTURE_KEYS[level];
      if (!textureKey || !this.textures.exists(textureKey)) return;

      const levelDef = lotHouseLevelDefs[level] || lotHouseLevelDefs[1];
      const metrics = getAreaScreenMetrics(lot, mapRect);
      const texture = this.textures.get(textureKey);
      const source = texture?.getSourceImage?.();
      const aspectRatio = source && source.width && source.height
        ? source.height / source.width
        : 1;
      const lotPixelWidth = metrics.width;
      const lotPixelHeight = metrics.height;
      const groundInset = 9;

      this.mapGraphics.fillStyle(0x766548, 0.18);
      this.mapGraphics.lineStyle(1, 0xb89a64, 0.18);
      this.mapGraphics.beginPath();
      metrics.points.forEach((point, index) => {
        if (index === 0) {
          this.mapGraphics.moveTo(point.x, point.y);
          return;
        }
        this.mapGraphics.lineTo(point.x, point.y);
      });
      this.mapGraphics.closePath();
      this.mapGraphics.fillPath();
      this.mapGraphics.strokePath();

      let drawWidth = lotPixelWidth * levelDef.widthFactor;
      let drawHeight = drawWidth * aspectRatio;
      const maxHeight = lotPixelHeight * levelDef.heightFactor;
      if (drawHeight > maxHeight) {
        drawHeight = maxHeight;
        drawWidth = drawHeight / aspectRatio;
      }

      const anchorX = metrics.centerX;
      const anchorY = metrics.bottom - groundInset - lotPixelHeight * levelDef.yOffset;
      const sprite = this.add.image(anchorX, anchorY, textureKey);
      sprite.setOrigin(0.5, 1);
      sprite.setDisplaySize(drawWidth, drawHeight);
      sprite.setAngle(0);
      sprite.setAlpha(0.99);
      sprite.setDepth(anchorY + 20);
      this.mapSprites.push(sprite);
    });
  }

  layoutUI() {
    if (this.uiTexts.message) {
      this.uiTexts.message.setPosition(18, 180);
    }
  }

  onResize(gameSize) {
    const width = gameSize.width || this.scale.width;
    const height = gameSize.height || this.scale.height;
    this.cameras.main.setViewport(0, 0, width, height);
    if (this.resizeRefreshTimer) {
      window.clearTimeout(this.resizeRefreshTimer);
    }
    this.resizeRefreshTimer = window.setTimeout(() => {
      this.resizeRefreshTimer = null;
      this.refreshMap();
      this.layoutUI();
    }, 100);
  }

  update() {
    // The city map is event-driven; no per-frame redraw is needed.
  }
}

const config = {
  type: Phaser.CANVAS,
  parent: "gameRoot",
  transparent: true,
  backgroundColor: "rgba(0,0,0,0)",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [CityScene],
};

new Phaser.Game(config);
