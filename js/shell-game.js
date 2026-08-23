(() => {
  const modal = document.getElementById("shellGameModal");
  const hotspot = document.getElementById("shellGameHotspot");
  const backdrop = document.getElementById("shellGameBackdrop");
  const closeButton = document.getElementById("shellGameClose");
  const startButton = document.getElementById("shellGameStart");
  const table = document.getElementById("shellGameTable");
  const message = document.getElementById("shellGameMessage");
  const winsLabel = document.getElementById("shellGameWins");
  const lossesLabel = document.getElementById("shellGameLosses");
  const pickRow = document.getElementById("shellGamePickRow");
  const betButtons = [...document.querySelectorAll("[data-shell-bet-slot]")];
  const cups = [...document.querySelectorAll("[data-shell-slot]")];
  if (!modal || !hotspot || !table || cups.length !== 3) return;

  let ballCup = cups[1];
  let phase = "ready";
  let wins = 0;
  let losses = 0;
  let bet = 0;
  let selectedBetSlot = -1;
  let activeBet = 0;
  let roundToken = 0;
  let previousBallSlot = -1;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const blackMoney = () => Math.max(0, Math.round(Number(typeof state !== "undefined" ? state.underworldMoney : 0) || 0));
  const refreshBet = () => {
    betButtons.forEach((button, index) => {
      const selected = index === selectedBetSlot;
      button.classList.toggle("is-selected", selected);
      button.dataset.betLabel = selected ? `${bet} fekete pénz` : "";
      button.disabled = phase !== "pick" || blackMoney() < 5 || (selectedBetSlot >= 0 && !selected);
    });
    if (startButton) {
      startButton.disabled = !["ready", "result"].includes(phase);
      startButton.textContent = phase === "result" ? "Új kör" : "Játék indítása";
    }
  };
  const persistMoney = () => {
    if (typeof sceneRef !== "undefined") sceneRef?.refreshHUD?.();
    if (typeof saveGame === "function") void saveGame(true);
    refreshBet();
  };
  const setMessage = (text, tone = "") => {
    message.textContent = text;
    message.classList.toggle("is-win", tone === "win");
    message.classList.toggle("is-loss", tone === "loss");
  };
  const resetCups = () => cups.forEach((cup) => {
    cup.classList.remove("is-lifted", "has-ball", "can-pick");
    cup.disabled = true;
    if (cup === ballCup) cup.classList.add("has-ball");
  });

  const syncCupSlots = () => [...table.querySelectorAll("[data-shell-slot]")].forEach((cup, index) => {
    cup.dataset.shellSlot = String(index);
    cup.setAttribute("aria-label", ["Bal oldali pohár", "Középső pohár", "Jobb oldali pohár"][index]);
  });

  async function swapCups(leftIndex, rightIndex, token, duration = 390) {
    const order = [...table.querySelectorAll("[data-shell-slot]")];
    const leftCup = order[leftIndex];
    const rightCup = order[rightIndex];
    const leftBox = leftCup.getBoundingClientRect();
    const rightBox = rightCup.getBoundingClientRect();
    const distance = rightBox.left - leftBox.left;
    const arc = 15 + Math.random() * 18;
    const options = { duration, easing: "cubic-bezier(.38,.02,.62,.98)", fill: "forwards" };
    const leftMove = leftCup.animate([{ transform: "translate(0,0)" }, { transform: `translate(${distance * .54}px,${-arc}px) scale(1.04)` }, { transform: `translate(${distance}px,0)` }], options);
    const rightMove = rightCup.animate([{ transform: "translate(0,0)" }, { transform: `translate(${-distance * .54}px,${arc}px) scale(.98)` }, { transform: `translate(${-distance}px,0)` }], options);
    await Promise.all([leftMove.finished, rightMove.finished]);
    if (token !== roundToken) return false;
    leftMove.cancel();
    rightMove.cancel();
    [order[leftIndex], order[rightIndex]] = [order[rightIndex], order[leftIndex]];
    order.forEach((cup) => table.appendChild(cup));
    syncCupSlots();
    await wait(18 + Math.random() * 24);
    return token === roundToken;
  }

  async function cycleCups(direction, token, duration = 430) {
    const order = [...table.querySelectorAll("[data-shell-slot]")];
    const boxes = order.map((cup) => cup.getBoundingClientRect());
    const targetFor = (index) => (index + direction + order.length) % order.length;
    const moves = order.map((cup, index) => {
      const target = boxes[targetFor(index)];
      const distance = target.left - boxes[index].left;
      const lift = index === 1 ? -32 : (direction > 0 ? 22 : -22);
      return cup.animate([
        { transform: "translate(0,0) scale(1)" },
        { transform: `translate(${distance * .52}px,${lift}px) scale(${index === 1 ? 1.06 : .97})` },
        { transform: `translate(${distance}px,0) scale(1)` },
      ], { duration, easing: "cubic-bezier(.4,.01,.6,.99)", fill: "forwards" });
    });
    await Promise.all(moves.map((move) => move.finished));
    if (token !== roundToken) return false;
    moves.forEach((move) => move.cancel());
    const nextOrder = Array(order.length);
    order.forEach((cup, index) => { nextOrder[targetFor(index)] = cup; });
    nextOrder.forEach((cup) => table.appendChild(cup));
    syncCupSlots();
    await wait(14 + Math.random() * 20);
    return token === roundToken;
  }

  function createShuffleSequence(stepCount = 19) {
    const pairs = [[0, 1], [1, 2], [0, 2]];
    const sequence = [];
    let previousPair = -1;
    while (sequence.length < stepCount) {
      if (sequence.length > 2 && Math.random() < .27) {
        sequence.push({ type: "cycle", direction: Math.random() < .5 ? -1 : 1 });
        previousPair = -1;
        continue;
      }
      let pairIndex = Math.floor(Math.random() * pairs.length);
      if (pairIndex === previousPair) pairIndex = (pairIndex + 1 + Math.floor(Math.random() * 2)) % pairs.length;
      sequence.push({ type: "swap", pair: pairs[pairIndex] });
      previousPair = pairIndex;
    }
    return sequence;
  }

  function openGame() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    setMessage("Figyeld meg, melyik pohár alá kerül a piros golyó!");
    resetCups();
    pickRow?.classList.remove("is-visible");
    refreshBet();
  }
  function closeGame() {
    roundToken += 1;
    phase = "ready";
    table.classList.remove("is-shuffling", "is-fast");
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }
  async function startRound() {
    if (phase !== "ready" && phase !== "result") return;
    bet = 0;
    activeBet = 0;
    selectedBetSlot = -1;
    pickRow?.classList.remove("is-visible");
    const token = ++roundToken;
    phase = "reveal";
    startButton.disabled = true;
    ballCup = cups[Math.floor(Math.random() * 3)];
    resetCups();
    ballCup.classList.add("is-lifted");
    setMessage("Itt a piros! Jól jegyezd meg...");
    await wait(950);
    if (token !== roundToken) return;
    ballCup.classList.remove("is-lifted");
    phase = "shuffle";
    setMessage("Figyelj! A poharak keverednek...");
    table.classList.add("is-shuffling");
    const swaps = createShuffleSequence(19 + Math.floor(Math.random() * 5));
    for (let index = 0; index < swaps.length; index += 1) {
      const action = swaps[index];
      const duration = Math.max(205, 455 - index * 11 + Math.floor(Math.random() * 70));
      table.classList.toggle("is-fast", index >= 5);
      const completed = action.type === "cycle"
        ? await cycleCups(action.direction, token, duration + 35)
        : await swapCups(action.pair[0], action.pair[1], token, duration);
      if (!completed) return;
      if (index === 4 || index === 11) await wait(110 + Math.random() * 90);
    }
    if (token !== roundToken) return;
    let finalOrder = [...table.querySelectorAll("[data-shell-slot]")];
    let finalBallSlot = finalOrder.indexOf(ballCup);
    if (finalBallSlot === previousBallSlot) {
      const alternatives = [0, 1, 2].filter((slot) => slot !== finalBallSlot);
      const targetSlot = alternatives[Math.floor(Math.random() * alternatives.length)];
      const completed = await swapCups(finalBallSlot, targetSlot, token, 245 + Math.floor(Math.random() * 70));
      if (!completed) return;
      finalOrder = [...table.querySelectorAll("[data-shell-slot]")];
      finalBallSlot = finalOrder.indexOf(ballCup);
    }
    previousBallSlot = finalBallSlot;
    table.classList.remove("is-shuffling", "is-fast");
    phase = "pick";
    cups.forEach((cup) => { cup.disabled = true; cup.classList.remove("can-pick"); });
    pickRow?.classList.add("is-visible");
    refreshBet();
    setMessage(`Tegyél tétet a pohár előtti + jellel. Egyenleged: ${blackMoney()} fekete pénz.`);
  }
  function chooseCup(event) {
    if (phase !== "pick" || activeBet <= 0) return;
    const selectedCup = event.currentTarget;
    if (Number(selectedCup.dataset.shellSlot) !== selectedBetSlot) return;
    phase = "result";
    pickRow?.classList.remove("is-visible");
    cups.forEach((cup) => { cup.disabled = true; cup.classList.remove("can-pick"); });
    selectedCup.classList.add("is-lifted");
    if (selectedCup !== ballCup) ballCup.classList.add("is-lifted");
    if (selectedCup === ballCup) {
      wins += 1;
      winsLabel.textContent = String(wins);
      state.underworldMoney = blackMoney() + activeBet * 2;
      setMessage(`Megvan! ${activeBet * 2} fekete pénz került vissza hozzád.`, "win");
    } else {
      losses += 1;
      lossesLabel.textContent = String(losses);
      setMessage(`Nincs ott! Elvesztettél ${activeBet} fekete pénzt.`, "loss");
    }
    activeBet = 0;
    persistMoney();
  }
  hotspot.addEventListener("click", openGame);
  backdrop?.addEventListener("click", closeGame);
  closeButton?.addEventListener("click", closeGame);
  startButton?.addEventListener("click", startRound);
  betButtons.forEach((button) => button.addEventListener("click", () => {
    if (phase !== "pick" || blackMoney() < 5) return;
    const slot = Number(button.dataset.shellBetSlot);
    if (selectedBetSlot >= 0 && selectedBetSlot !== slot) return;
    selectedBetSlot = slot;
    bet += 5;
    activeBet = bet;
    state.underworldMoney = blackMoney() - 5;
    cups.forEach((cup) => {
      const selected = Number(cup.dataset.shellSlot) === selectedBetSlot;
      cup.disabled = !selected;
      cup.classList.toggle("can-pick", selected);
    });
    persistMoney();
    setMessage(`${bet} fekete pénzt tettél erre a pohárra. Emelhetsz még a + jellel, vagy kattints a pohárra!`);
  }));
  cups.forEach((cup) => cup.addEventListener("click", chooseCup));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) closeGame();
  });
})();
