// wizard.js — wizard "Ricerca guidata" a 4 step, aperto dai tile della hero
// tramite l'evento custom "wizard:open" (vedi js/app.js).

const AIRPORT_GROUPS = [
  {
    region: "Nord",
    items: [
      { name: "Milano - Malpensa", code: "MXP" },
      { name: "Milano - Linate", code: "LIN" },
      { name: "Venezia", code: "VCE" },
      { name: "Bologna", code: "BLQ" },
      { name: "Torino", code: "TRN" },
    ],
  },
  {
    region: "Centro",
    items: [
      { name: "Napoli - Capodichino", code: "NAP" },
      { name: "Roma - Leonardo da Vinci", code: "FCO" },
      { name: "Roma - Ciampino", code: "CIA" },
      { name: "Pisa", code: "PSA" },
    ],
  },
  {
    region: "Sud",
    items: [
      { name: "Catania - Fontanarossa", code: "CTA" },
      { name: "Palermo - Punta Raisi", code: "PMO" },
      { name: "Bari", code: "BRI" },
      { name: "Cagliari", code: "CAG" },
    ],
  },
];

const TRIP_TYPES = [
  { key: "flight", label: "Volo + Soggiorno", icon: "tabFlight" },
  { key: "stay", label: "Solo Soggiorno", icon: "tabBed" },
  { key: "ferry", label: "Traghetto e Soggiorno", icon: "tabShip" },
];

const PORTS = [
  "Civitavecchia (Roma)", "Genova", "Savona", "Venezia", "Napoli", "Bari", "Trieste",
];

const DESTINATIONS = [
  { name: "Egitto e Mar Rosso", img: "assets/images/mare-estero.png" },
  { name: "Baleari", img: "assets/images/dest-b1.png" },
  { name: "Canarie", img: "assets/images/dest-b2.png" },
  { name: "Grecia", img: "assets/images/dest-b3.png" },
  { name: "Caraibi", img: "assets/images/dest-b5.png" },
  { name: "Zanzibar", img: "assets/images/dest-b6.png" },
  { name: "Maldive", img: "assets/images/dest-b7.png" },
  { name: "Sardegna", img: "assets/images/dest-b8.png" },
  { name: "Bali", img: "assets/images/asia.png" },
  { name: "Costa Azzurra", img: "assets/images/estate-2025.png" },
];

const MONTH_NAMES = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const WEEKDAYS = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];

const ICONS = {
  search: "assets/icons/wizard/search.svg",
  back: "assets/icons/wizard/arrow-left.svg",
  flight: "assets/icons/wizard/flight.svg",
  calendar: "assets/icons/wizard/calendar.svg",
  guests: "assets/icons/wizard/guests.svg",
  check: "assets/icons/wizard/check-circle.svg",
  tabFlight: "assets/icons/wizard/tab-flight.svg",
  tabBed: "assets/icons/wizard/tab-bed.svg",
  tabShip: "assets/icons/wizard/tab-ship.svg",
  airportRow: "assets/icons/wizard/airport-row.svg",
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("wizard-modal");
  if (!modal) return;

  const closeBtn = modal.querySelector(".wizard-modal__close");
  const stepperEl = modal.querySelector(".wizard__stepper");
  const progressBar = modal.querySelector(".wizard__progress-bar");
  const summaryCategory = modal.querySelector(".wizard__summary-category");
  const summaryDestination = modal.querySelector(".wizard__summary-destination");
  const summaryList = modal.querySelector(".wizard__summary-list");
  const backBtn = modal.querySelector(".wizard__back");
  const panelEl = modal.querySelector(".wizard__panel");
  const contentEl = modal.querySelector(".wizard__content");

  let lastFocusedTrigger = null;
  let state = defaultState();

  function defaultState() {
    const now = new Date();
    return {
      cluster: "",
      isCruise: false,
      step: 1,
      destination: null,
      transport: null,
      dateLabel: "",
      dateValue: null,
      calendarCursor: new Date(now.getFullYear(), now.getMonth(), 1),
      adults: 1,
      children: 0,
      childAges: [],
    };
  }

  function formatDayLabel(date) {
    return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  }

  function guestsLabel() {
    const total = state.adults + state.children;
    let label = `${total} Ospit${total === 1 ? "e" : "i"}: ${state.adults} Adult${state.adults === 1 ? "o" : "i"}`;
    if (state.children > 0) label += `, ${state.children} Bambin${state.children === 1 ? "o" : "i"}`;
    return label;
  }

  // ---------- sidebar: stepper + riepilogo ----------
  function renderStepper() {
    const steps = [
      { n: 1, label: "Destinazione" },
      { n: 2, label: state.isCruise ? "Porto di Partenza" : "Aeroporto di Partenza" },
      { n: 3, label: "Data di partenza" },
      { n: 4, label: "Ospiti" },
    ];
    stepperEl.innerHTML = steps
      .map((s) => {
        const cls = ["wizard__step"];
        if (s.n === state.step) cls.push("is-active");
        else if (s.n < state.step) cls.push("is-done");
        return `<li class="${cls.join(" ")}" data-goto-step="${s.n}">
          <span class="wizard__step-index">${s.n}</span>
          <span class="wizard__step-label">${s.label}</span>
        </li>`;
      })
      .join("");
    progressBar.style.width = `${(state.step / 4) * 100}%`;
  }

  function renderSummary() {
    const categoryLabel = state.isCruise ? "Crociere" : `Vacanze - ${state.cluster.toUpperCase()}`;
    summaryCategory.textContent = categoryLabel;
    summaryDestination.textContent = state.destination ? state.destination.name : "";

    const items = [
      { icon: ICONS.flight, value: state.transport },
      { icon: ICONS.calendar, value: state.dateLabel },
      { icon: ICONS.guests, value: state.step >= 4 ? guestsLabel() : "" },
    ];
    summaryList.innerHTML = items
      .map((it) => {
        const filled = Boolean(it.value);
        return `<li class="wizard__summary-item ${filled ? "is-filled" : ""}">
          <img src="${it.icon}" alt="">
          <span>${filled ? escapeHtml(it.value) : "Nessuna selezione"}</span>
        </li>`;
      })
      .join("");
  }

  // ---------- step 1: destinazione ----------
  function renderStep1() {
    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Dove vuoi andare?</h3>
      <p class="wizard-step__subtitle">Trova la tua destinazione</p>
      <div class="wizard-search">
        <img src="${ICONS.search}" alt="">
        <input type="text" placeholder="Inizia a digitare..." id="wizard-dest-search" autocomplete="off">
      </div>
      <div class="wizard-grid" id="wizard-dest-grid"></div>
    `;
    const grid = panelEl.querySelector("#wizard-dest-grid");
    const searchInput = panelEl.querySelector("#wizard-dest-search");

    const paintGrid = (query) => {
      const q = (query || "").trim().toLowerCase();
      const list = q ? DESTINATIONS.filter((d) => d.name.toLowerCase().includes(q)) : DESTINATIONS;
      grid.innerHTML =
        list
          .map((d) => {
            const selected = state.destination && state.destination.name === d.name;
            return `<button type="button" class="wizard-card ${selected ? "is-selected" : ""}" data-dest="${escapeHtml(d.name)}">
              <img src="${d.img}" alt="" class="wizard-card__photo">
              <span class="wizard-card__label">${escapeHtml(d.name)}</span>
              ${selected ? `<img src="${ICONS.check}" alt="" class="wizard-card__check">` : ""}
            </button>`;
          })
          .join("") || `<p class="wizard-list__empty">Nessuna destinazione trovata.</p>`;
    };

    paintGrid("");
    searchInput.addEventListener("input", (e) => paintGrid(e.target.value));

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-dest]");
      if (!btn) return;
      state.destination = DESTINATIONS.find((d) => d.name === btn.dataset.dest) || null;
      renderSummary();
      goToStep(2);
    });
  }

  // ---------- step 2: aeroporto / porto di partenza ----------
  function renderStep2() {
    if (state.isCruise) renderStep2Ports();
    else renderStep2Airports();
  }

  function selectTransport(name) {
    state.transport = name;
    renderSummary();
    goToStep(3);
  }

  // variante standard (Mare Estero / Mare Italia / Tour): tab tipo viaggio
  // + lista aeroporti raggruppata per area geografica, come nel Figma.
  function renderStep2Airports() {
    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Da dove parti?</h3>
      <p class="wizard-step__subtitle">Seleziona il tuo aeroporto</p>
      <div class="wizard-transport">
        <div class="wizard-transport__tabs">
          ${TRIP_TYPES.map(
            (t, i) => `<button type="button" class="wizard-transport__tab ${i === 0 ? "is-active" : ""}" data-trip-type="${t.key}">
            <img src="${ICONS[t.icon]}" alt="">
            <span>${escapeHtml(t.label)}</span>
          </button>`
          ).join("")}
        </div>
        <div class="wizard-transport__groups">
          ${AIRPORT_GROUPS.map(
            (group) => `<div class="wizard-transport__group">
            <p class="wizard-transport__group-title">${escapeHtml(group.region)}</p>
            ${group.items
              .map(
                (apt) => `<button type="button" class="wizard-airport" data-transport="${escapeHtml(apt.name)}">
              <img src="${ICONS.airportRow}" alt="">
              <span class="wizard-airport__name">${escapeHtml(apt.name)} <strong class="wizard-airport__code">(${escapeHtml(apt.code)})</strong></span>
            </button>`
              )
              .join("")}
          </div>`
          ).join("")}
        </div>
      </div>
    `;

    panelEl.querySelectorAll("[data-trip-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        panelEl.querySelectorAll("[data-trip-type]").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });

    panelEl.querySelectorAll("[data-transport]").forEach((btn) => {
      btn.addEventListener("click", () => selectTransport(btn.dataset.transport));
    });
  }

  // variante Crociere: lista porti semplice (nessun riferimento Figma
  // dedicato, riusa lo stile riga delle "wizard-airport" per coerenza).
  function renderStep2Ports() {
    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Da dove parti?</h3>
      <p class="wizard-step__subtitle">Seleziona il tuo porto di partenza</p>
      <div class="wizard-transport__groups wizard-transport__groups--single">
        <div class="wizard-transport__group">
          ${PORTS.map(
            (port) => `<button type="button" class="wizard-airport" data-transport="${escapeHtml(port)}">
            <img src="${ICONS.airportRow}" alt="">
            <span class="wizard-airport__name">${escapeHtml(port)}</span>
          </button>`
          ).join("")}
        </div>
      </div>
    `;
    panelEl.querySelectorAll("[data-transport]").forEach((btn) => {
      btn.addEventListener("click", () => selectTransport(btn.dataset.transport));
    });
  }

  // ---------- step 3: data di partenza ----------
  function renderStep3() {
    if (state.isCruise) renderStep3Months();
    else renderStep3Calendar();
  }

  function buildMonthCells(year, month) {
    const firstDay = new Date(year, month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7; // 0 = lunedì
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function renderStep3Calendar() {
    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Quando parti?</h3>
      <p class="wizard-step__subtitle">Scegli il periodo del viaggio</p>
      <div class="wizard-calendar">
        <div class="wizard-calendar__nav">
          <button type="button" class="wizard-calendar__nav-btn" id="wizard-cal-prev" aria-label="Mese precedente">&lsaquo;</button>
          <button type="button" class="wizard-calendar__nav-btn" id="wizard-cal-next" aria-label="Mese successivo">&rsaquo;</button>
        </div>
        <div class="wizard-calendar__months" id="wizard-cal-months"></div>
      </div>
    `;

    const paintCalendar = () => {
      const monthsEl = panelEl.querySelector("#wizard-cal-months");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let html = "";
      for (let i = 0; i < 2; i++) {
        const viewDate = new Date(state.calendarCursor.getFullYear(), state.calendarCursor.getMonth() + i, 1);
        const cells = buildMonthCells(viewDate.getFullYear(), viewDate.getMonth());
        html += `<div class="wizard-calendar__month">
          <p class="wizard-calendar__month-name">${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}</p>
          <div class="wizard-calendar__weekdays">${WEEKDAYS.map((w) => `<span>${w}</span>`).join("")}</div>
          <div class="wizard-calendar__days">
            ${cells
              .map((date) => {
                if (!date) return "<span></span>";
                const isPast = date < today;
                const isToday = date.getTime() === today.getTime();
                const isSelected = state.dateValue instanceof Date && date.getTime() === state.dateValue.getTime();
                const cls = ["wizard-calendar__day"];
                if (isToday) cls.push("wizard-calendar__day--today");
                if (isSelected) cls.push("wizard-calendar__day--selected");
                return `<button type="button" class="${cls.join(" ")}" ${isPast ? "disabled" : ""} data-date="${date.getTime()}">${date.getDate()}</button>`;
              })
              .join("")}
          </div>
        </div>`;
      }
      monthsEl.innerHTML = html;
      monthsEl.querySelectorAll("[data-date]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.dateValue = new Date(Number(btn.dataset.date));
          state.dateLabel = formatDayLabel(state.dateValue);
          renderSummary();
          goToStep(4);
        });
      });
    };

    paintCalendar();
    panelEl.querySelector("#wizard-cal-prev").addEventListener("click", () => {
      state.calendarCursor = new Date(state.calendarCursor.getFullYear(), state.calendarCursor.getMonth() - 1, 1);
      paintCalendar();
    });
    panelEl.querySelector("#wizard-cal-next").addEventListener("click", () => {
      state.calendarCursor = new Date(state.calendarCursor.getFullYear(), state.calendarCursor.getMonth() + 1, 1);
      paintCalendar();
    });
  }

  function renderStep3Months() {
    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Quando parti?</h3>
      <p class="wizard-step__subtitle">Scegli il periodo del viaggio</p>
      <div class="wizard-months-grid" id="wizard-months-grid"></div>
    `;
    const wrap = panelEl.querySelector("#wizard-months-grid");
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const years = [currentYear, currentYear + 1];

    wrap.innerHTML = years
      .map((year) => {
        const row = MONTH_NAMES.map((name, idx) => {
          const disabled = year === currentYear && idx < currentMonth;
          const selected = state.dateValue && state.dateValue.year === year && state.dateValue.month === idx;
          return `<button type="button" class="wizard-month-btn ${selected ? "is-selected" : ""}" ${disabled ? "disabled" : ""} data-year="${year}" data-month="${idx}">
            <img src="${ICONS.calendar}" alt="">
            ${capitalize(name)}
          </button>`;
        }).join("");
        return `<div><p class="wizard-months-grid__year">${year}</p><div class="wizard-months-grid__row">${row}</div></div>`;
      })
      .join("");

    wrap.querySelectorAll("[data-month]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const year = Number(btn.dataset.year);
        const month = Number(btn.dataset.month);
        state.dateValue = { year, month };
        state.dateLabel = `${capitalize(MONTH_NAMES[month])} ${year}`;
        renderSummary();
        goToStep(4);
      });
    });
  }

  // ---------- step 4: ospiti ----------
  function renderStep4() {
    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Quanti ospiti partiranno?</h3>
      <p class="wizard-step__subtitle">Inserisci il numero di ospiti</p>
      <div class="wizard-guests">
        <div class="wizard-guests__row">
          <div><strong>ADULTI</strong><br><span class="wizard-guests__hint">dai 18 anni in su</span></div>
          <div class="wizard-counter">
            <button type="button" class="wizard-counter__btn" data-adjust="adults" data-delta="-1" ${state.adults <= 1 ? "disabled" : ""} aria-label="Diminuisci adulti">&minus;</button>
            <span class="wizard-counter__value">${state.adults}</span>
            <button type="button" class="wizard-counter__btn" data-adjust="adults" data-delta="1" ${state.adults >= 9 ? "disabled" : ""} aria-label="Aumenta adulti">+</button>
          </div>
        </div>
        <div class="wizard-guests__row">
          <div><strong>BAMBINI</strong><br><span class="wizard-guests__hint">da 0 a 17 anni</span></div>
          <div class="wizard-counter">
            <button type="button" class="wizard-counter__btn" data-adjust="children" data-delta="-1" ${state.children <= 0 ? "disabled" : ""} aria-label="Diminuisci bambini">&minus;</button>
            <span class="wizard-counter__value">${state.children}</span>
            <button type="button" class="wizard-counter__btn" data-adjust="children" data-delta="1" ${state.children >= 9 ? "disabled" : ""} aria-label="Aumenta bambini">+</button>
          </div>
        </div>
      </div>
      <div class="wizard-child-ages" id="wizard-child-ages"></div>
      <button type="button" class="btn btn--red wizard-search-cta" id="wizard-search-cta">Cerca</button>
    `;

    const paintChildAges = () => {
      const wrap = panelEl.querySelector("#wizard-child-ages");
      if (state.children === 0) {
        wrap.innerHTML = "";
        return;
      }
      wrap.innerHTML =
        Array.from(
          { length: state.children },
          (_, i) => `
        <div class="wizard-child-ages__row">
          <label for="wizard-child-age-${i}">Età bambino ${i + 1}</label>
          <select id="wizard-child-age-${i}" data-child-index="${i}">
            ${Array.from({ length: 18 }, (_, age) => `<option value="${age}" ${state.childAges[i] === age ? "selected" : ""}>${age}</option>`).join("")}
          </select>
        </div>`
        ).join("") + `<p class="wizard-step__subtitle">Indica l'età dei bambini alla data del viaggio</p>`;

      wrap.querySelectorAll("select").forEach((sel) => {
        sel.addEventListener("change", (e) => {
          state.childAges[Number(sel.dataset.childIndex)] = Number(e.target.value);
        });
      });
    };

    paintChildAges();

    panelEl.querySelectorAll("[data-adjust]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const field = btn.dataset.adjust;
        const delta = Number(btn.dataset.delta);
        const min = field === "adults" ? 1 : 0;
        state[field] = Math.max(min, Math.min(9, state[field] + delta));
        if (field === "children") {
          state.childAges = Array.from({ length: state.children }, (_, i) => state.childAges[i] ?? 0);
        }
        renderStep4();
        renderSummary();
      });
    });

    panelEl.querySelector("#wizard-search-cta").addEventListener("click", () => {
      renderSummary();
      renderDone();
    });
  }

  // ---------- step finale (demo) ----------
  function renderDone() {
    backBtn.hidden = true;
    panelEl.innerHTML = `
      <div class="wizard-done">
        <h3 class="wizard-step__title" id="wizard-step-title">Ricerca inviata!</h3>
        <p class="wizard-step__subtitle">Ecco il riepilogo della tua richiesta (demo — nessuna ricerca reale):</p>
        <ul>
          <li><strong>Destinazione:</strong> ${state.destination ? escapeHtml(state.destination.name) : "—"}</li>
          <li><strong>${state.isCruise ? "Porto" : "Aeroporto"}:</strong> ${state.transport ? escapeHtml(state.transport) : "—"}</li>
          <li><strong>Data:</strong> ${state.dateLabel || "—"}</li>
          <li><strong>Ospiti:</strong> ${guestsLabel()}</li>
        </ul>
        <button type="button" class="btn btn--outline-red" data-wizard-close>Chiudi</button>
      </div>
    `;
  }

  // ---------- navigazione ----------
  function renderPanel() {
    backBtn.hidden = state.step === 1;
    if (state.step === 1) renderStep1();
    else if (state.step === 2) renderStep2();
    else if (state.step === 3) renderStep3();
    else if (state.step === 4) renderStep4();
  }

  function renderAll() {
    renderStepper();
    renderSummary();
    renderPanel();
  }

  function goToStep(n) {
    state.step = n;
    renderAll();
    contentEl.scrollTop = 0;
  }

  backBtn.innerHTML = `<img src="${ICONS.back}" alt="">Indietro`;
  backBtn.addEventListener("click", () => {
    if (state.step > 1) goToStep(state.step - 1);
  });

  stepperEl.addEventListener("click", (e) => {
    const li = e.target.closest("[data-goto-step]");
    if (!li) return;
    const target = Number(li.dataset.gotoStep);
    if (target < state.step) goToStep(target);
  });

  // ---------- apertura / chiusura ----------
  function open(cluster, trigger) {
    lastFocusedTrigger = trigger || null;
    state = defaultState();
    state.cluster = cluster || "";
    state.isCruise = (cluster || "").toLowerCase() === "crociere";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    backBtn.hidden = true;
    renderAll();
    closeBtn?.focus();
  }

  function close() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    lastFocusedTrigger?.focus();
  }

  document.addEventListener("wizard:open", (e) => open(e.detail?.cluster, e.detail?.trigger));

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-wizard-close]")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });
});
