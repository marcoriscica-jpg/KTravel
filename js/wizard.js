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

// Porti di partenza crociere — elenco da Figma "Modal / Port".
const PORTS = [
  "Bari", "Cagliari", "Catania", "Civitavecchia", "Genova", "Golfo Aranci",
  "La Spezia", "Marghera", "Messina", "Napoli", "Olbia", "Palermo",
];

const PORT_FILTERS = [
  { key: "ovunque", label: "Ovunque" },
  { key: "italiani", label: "Porti italiani" },
  { key: "stranieri", label: "Porti stranieri" },
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

// Elenco "Tutte le destinazioni" per area geografica (Figma "Modal / Dest / List").
// Solo "Egitto e Mar Rosso" ha sotto-destinazioni nel file Figma di riferimento;
// le altre aree sono placeholder in attesa di contenuti reali.
const DESTINATION_GROUPS = [
  { region: "Egitto e Mar Rosso", items: ["Sharm El Sheikh", "Hurghada", "El Quseir", "Marsa Alam", "Berenice", "Marsa Matrouh"] },
  { region: "Europa", items: [] },
  { region: "Africa", items: [] },
  { region: "Nord America", items: [] },
  { region: "Isole Baleari", items: [] },
  { region: "Isole Canarie", items: [] },
];

const MONTH_NAMES = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const WEEKDAYS = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];

const ICONS = {
  search: "assets/icons/wizard/search.svg",
  back: "assets/icons/wizard/arrow-left.svg",
  arrowRight: "assets/icons/wizard/arrow-right.svg",
  calendar: "assets/icons/wizard/calendar.svg",
  check: "assets/icons/wizard/check-circle.svg",
  tabFlight: "assets/icons/wizard/tab-flight.svg",
  tabBed: "assets/icons/wizard/tab-bed.svg",
  tabShip: "assets/icons/wizard/tab-ship.svg",
  airportRow: "assets/icons/wizard/airport-row.svg",
  counterMinus: "assets/icons/wizard/counter-minus.svg",
  counterPlus: "assets/icons/wizard/counter-plus.svg",
  locationMarker: "assets/icons/wizard/location-marker.svg",
  locationMarkerActive: "assets/icons/wizard/location-marker-active.svg",
  locationMarkerSelected: "assets/icons/wizard/location-marker-selected.svg",
  checkCircleOutline: "assets/icons/wizard/check-circle-outline.svg",
  treeConnector: "assets/icons/wizard/tree-connector.svg",
  chevronDown: "assets/icons/wizard/chevron-down.svg",
  anchor: "assets/icons/wizard/anchor.svg",
  anchorActive: "assets/icons/wizard/anchor-active.svg",
  calendarOutline: "assets/icons/wizard/calendar-outline.svg",
  calendarOutlineSelected: "assets/icons/wizard/calendar-outline-selected.svg",
  calendarOutlineDisabled: "assets/icons/wizard/calendar-outline-disabled.svg",
  stepDotActive: "assets/icons/wizard/step-dot-active.svg",
  stepDotInactive: "assets/icons/wizard/step-dot-inactive.svg",
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function renderPrimaryCta(label, { disabled = false, icon = true } = {}) {
  return `<button type="button" class="btn btn--primary wizard-cta" id="wizard-cta" ${disabled ? "disabled" : ""}>
    ${escapeHtml(label)}
    ${icon ? `<img src="${ICONS.arrowRight}" alt="" class="btn__icon">` : ""}
  </button>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("wizard-modal");
  if (!modal) return;

  const closeBtn = modal.querySelector(".wizard-modal__close");
  const stepperEl = modal.querySelector(".wizard__stepper");
  const mobileProgressCurrent = modal.querySelector(".wizard-mobile-progress__current");
  const mobileProgressFill = modal.querySelector(".wizard-mobile-progress__fill");
  const mobileProgressSteps = modal.querySelector(".wizard-mobile-progress__steps");
  const summaryBox = modal.querySelector(".wizard__summary");
  const summaryToggle = modal.querySelector(".wizard__summary-toggle span");
  const summaryCategory = modal.querySelector(".wizard__summary-category");
  const summaryDestination = modal.querySelector(".wizard__summary-destination");
  const summaryList = modal.querySelector(".wizard__summary-list");
  const backBtn = modal.querySelector(".wizard__back");
  const panelEl = modal.querySelector(".wizard__panel");
  const actionsEl = modal.querySelector(".wizard__actions");

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
      dateFrom: null,
      dateTo: null,
      dateValue: null, // { year, month } — usato solo dalla variante Crociere
      calendarCursor: new Date(now.getFullYear(), now.getMonth(), 1),
      adults: 1,
      children: 0,
      childAges: [],
    };
  }

  function formatDayLabel(date) {
    return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  }

  function formatRangeLabel(from, to) {
    if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()) {
      return `${from.getDate()} – ${to.getDate()} ${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()}`;
    }
    if (from.getFullYear() === to.getFullYear()) {
      return `${from.getDate()} ${MONTH_NAMES[from.getMonth()]} – ${to.getDate()} ${MONTH_NAMES[to.getMonth()]} ${from.getFullYear()}`;
    }
    return `${formatDayLabel(from)} – ${formatDayLabel(to)}`;
  }

  function guestsLabel() {
    const total = state.adults + state.children;
    let label = `${total} Ospit${total === 1 ? "e" : "i"}: ${state.adults} Adult${state.adults === 1 ? "o" : "i"}`;
    if (state.children > 0) label += `, ${state.children} Bambin${state.children === 1 ? "o" : "i"}`;
    return label;
  }

  function setBack(label, handler) {
    backBtn.innerHTML = `<img src="${ICONS.back}" alt="">${escapeHtml(label)}`;
    backBtn.onclick = handler;
    backBtn.hidden = false;
  }

  function setActions(html) {
    if (!html) {
      actionsEl.hidden = true;
      actionsEl.innerHTML = "";
      return;
    }
    actionsEl.hidden = false;
    actionsEl.innerHTML = html;
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

    // barra di avanzamento orizzontale per mobile (etichette abbreviate)
    const shortSteps = [
      { n: 1, label: "Destinazione" },
      { n: 2, label: state.isCruise ? "Porto" : "Aeroporto" },
      { n: 3, label: "Data" },
      { n: 4, label: "Ospiti" },
    ];
    mobileProgressCurrent.textContent = state.step;
    mobileProgressFill.style.width = `${((state.step - 0.5) / 4) * 100}%`;
    mobileProgressSteps.innerHTML = shortSteps
      .map((s) => {
        const cls = s.n === state.step ? "is-active" : s.n < state.step ? "is-done" : "";
        const icon = s.n <= state.step ? ICONS.stepDotActive : ICONS.stepDotInactive;
        return `<li class="${cls}"><img src="${icon}" alt="">${escapeHtml(s.label)}</li>`;
      })
      .join("");
  }

  function renderSummary() {
    const categoryLabel = state.isCruise ? "Crociere" : `Vacanze - ${state.cluster.toUpperCase()}`;
    summaryCategory.textContent = categoryLabel;
    summaryDestination.textContent = state.destination
      ? (state.destination.subName ? `${state.destination.name} - ${state.destination.subName}` : state.destination.name)
      : "";

    const items = [
      { label: "Da:", value: state.transport },
      { label: "Il:", value: state.dateLabel },
      { label: "Ospiti:", value: state.step >= 4 ? guestsLabel() : "" },
    ];
    summaryList.innerHTML = items
      .map((it) => {
        const filled = Boolean(it.value);
        return `<li class="wizard__summary-item ${filled ? "is-filled" : ""}">
          <span class="wizard__summary-item-label">${it.label}</span>
          <span class="wizard__summary-item-value">${filled ? escapeHtml(it.value) : "Nessuna selezione"}</span>
        </li>`;
      })
      .join("");
  }

  // ---------- step 1: destinazione ----------
  function renderStep1() {
    setBack("Tutte le destinazioni", () => renderDestinationList());
    let pending = state.destination && !state.destination.subName ? state.destination : null;

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
            const selected = pending && pending.name === d.name;
            return `<button type="button" class="wizard-card ${selected ? "is-selected" : ""}" data-dest="${escapeHtml(d.name)}">
              <img src="${d.img}" alt="" class="wizard-card__photo">
              <span class="wizard-card__label">${escapeHtml(d.name)}</span>
              ${selected ? `<img src="${ICONS.check}" alt="" class="wizard-card__check">` : ""}
            </button>`;
          })
          .join("") || `<p class="wizard-list__empty">Nessuna destinazione trovata.</p>`;

      grid.querySelectorAll("[data-dest]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pending = DESTINATIONS.find((d) => d.name === btn.dataset.dest) || null;
          paintGrid(searchInput.value);
          paintActions();
        });
      });
    };

    paintGrid("");
    searchInput.addEventListener("input", (e) => paintGrid(e.target.value));

    function paintActions() {
      setActions(renderPrimaryCta("Prosegui", { disabled: !pending }));
      actionsEl.querySelector("#wizard-cta")?.addEventListener("click", () => {
        if (!pending) return;
        state.destination = pending;
        renderSummary();
        goToStep(2);
      });
    }
    paintActions();
  }

  // ---------- step 1 bis: "Tutte le destinazioni" (elenco per area) ----------
  function renderDestinationList() {
    setBack("Indietro", () => renderStep1());
    let openRegion = DESTINATION_GROUPS[0].region;
    let pending = state.destination && state.destination.subName ? state.destination : null;

    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Dove vuoi andare?</h3>
      <p class="wizard-step__subtitle">Trova la tua destinazione</p>
      <div class="wizard-search">
        <img src="${ICONS.search}" alt="">
        <input type="text" placeholder="Inizia a digitare..." id="wizard-dest-list-search" autocomplete="off" value="${pending ? escapeHtml(pending.subName) : ""}">
      </div>
      <div class="wizard-dest-groups" id="wizard-dest-groups"></div>
    `;

    const wrap = panelEl.querySelector("#wizard-dest-groups");
    const searchInput = panelEl.querySelector("#wizard-dest-list-search");

    const paint = () => {
      const q = searchInput.value.trim().toLowerCase();
      wrap.innerHTML = DESTINATION_GROUPS
        .map((group) => {
          const isOpen = group.region === openRegion;
          const items = q ? group.items.filter((i) => i.toLowerCase().includes(q)) : group.items;
          return `<div class="wizard-dest-group ${isOpen ? "is-open" : ""}">
            <button type="button" class="wizard-dest-group__header" data-region="${escapeHtml(group.region)}">
              <img src="${isOpen ? ICONS.locationMarkerActive : ICONS.locationMarker}" alt="" class="wizard-dest-group__icon">
              <span class="wizard-dest-group__label">${escapeHtml(group.region)}</span>
              <img src="${ICONS.chevronDown}" alt="" class="wizard-dest-group__chevron">
            </button>
            ${isOpen
              ? `<div class="wizard-dest-group__children">
                  ${items.length
                    ? items
                        .map((item) => {
                          const selected = Boolean(pending && pending.name === group.region && pending.subName === item);
                          return `<button type="button" class="wizard-dest-item ${selected ? "is-selected" : ""}" data-region="${escapeHtml(group.region)}" data-item="${escapeHtml(item)}">
                            <img src="${ICONS.treeConnector}" alt="" class="wizard-dest-item__connector">
                            <span class="wizard-dest-item__pill">
                              <img src="${selected ? ICONS.locationMarkerSelected : ICONS.locationMarker}" alt="">
                              <span>${escapeHtml(item)}</span>
                              ${selected ? `<img src="${ICONS.checkCircleOutline}" alt="" class="wizard-dest-item__check">` : ""}
                            </span>
                          </button>`;
                        })
                        .join("")
                    : `<p class="wizard-list__empty">Destinazioni in arrivo per questa area.</p>`}
                </div>`
              : ""}
          </div>`;
        })
        .join("");

      wrap.querySelectorAll(".wizard-dest-group__header").forEach((btn) => {
        btn.addEventListener("click", () => {
          openRegion = openRegion === btn.dataset.region ? null : btn.dataset.region;
          paint();
        });
      });
      wrap.querySelectorAll(".wizard-dest-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          const regionEntry = DESTINATIONS.find((d) => d.name === btn.dataset.region);
          pending = { name: btn.dataset.region, subName: btn.dataset.item, img: regionEntry ? regionEntry.img : DESTINATIONS[0].img };
          searchInput.value = btn.dataset.item;
          paint();
          paintActions();
        });
      });
    };

    paint();
    searchInput.addEventListener("input", paint);

    function paintActions() {
      setActions(renderPrimaryCta("Prosegui", { disabled: !pending }));
      actionsEl.querySelector("#wizard-cta")?.addEventListener("click", () => {
        if (!pending) return;
        state.destination = pending;
        renderSummary();
        goToStep(2);
      });
    }
    paintActions();
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
    setBack("Indietro", () => goToStep(1));
    let pending = state.transport;

    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Da dove parti?</h3>
      <p class="wizard-step__subtitle">Seleziona il tuo aeroporto</p>
      <div class="wizard-transport">
        <div class="wizard-transport__tabs" id="wizard-trip-tabs"></div>
        <div class="wizard-transport__groups" id="wizard-airport-groups"></div>
      </div>
    `;
    const tabsEl = panelEl.querySelector("#wizard-trip-tabs");
    const groupsEl = panelEl.querySelector("#wizard-airport-groups");

    tabsEl.innerHTML = TRIP_TYPES.map(
      (t, i) => `<button type="button" class="wizard-transport__tab ${i === 0 ? "is-active" : ""}" data-trip-type="${t.key}">
      <img src="${ICONS[t.icon]}" alt="">
      <span>${escapeHtml(t.label)}</span>
    </button>`
    ).join("");
    tabsEl.querySelectorAll("[data-trip-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        tabsEl.querySelectorAll("[data-trip-type]").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });

    const paintGroups = () => {
      groupsEl.innerHTML = AIRPORT_GROUPS.map(
        (group) => `<div class="wizard-transport__group">
          <p class="wizard-transport__group-title">${escapeHtml(group.region)}</p>
          ${group.items
            .map((apt) => {
              const selected = pending === apt.name;
              return `<button type="button" class="wizard-airport ${selected ? "is-selected" : ""}" data-transport="${escapeHtml(apt.name)}">
                <img src="${ICONS.airportRow}" alt="">
                <span class="wizard-airport__name">${escapeHtml(apt.name)} <strong class="wizard-airport__code">(${escapeHtml(apt.code)})</strong></span>
                ${selected ? `<img src="${ICONS.check}" alt="" class="wizard-airport__check">` : ""}
              </button>`;
            })
            .join("")}
        </div>`
      ).join("");

      groupsEl.querySelectorAll("[data-transport]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pending = btn.dataset.transport;
          paintGroups();
          paintActions();
        });
      });
    };
    paintGroups();

    function paintActions() {
      setActions(renderPrimaryCta("Prosegui", { disabled: !pending }));
      actionsEl.querySelector("#wizard-cta")?.addEventListener("click", () => {
        if (pending) selectTransport(pending);
      });
    }
    paintActions();
  }

  // variante Crociere: filtro Ovunque/Porti italiani/Porti stranieri + griglia
  // di porti come nel Figma "Modal / Port" (solo i porti italiani hanno dati reali).
  function renderStep2Ports() {
    setBack("Indietro", () => goToStep(1));
    let pending = state.transport;
    let activeFilter = "italiani";

    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Da dove parti?</h3>
      <p class="wizard-step__subtitle">Seleziona il porto di partenza</p>
      <div class="wizard-port">
        <div class="wizard-port-filters" id="wizard-port-filters"></div>
        <div class="wizard-port-grid" id="wizard-port-grid"></div>
      </div>
    `;
    const filtersEl = panelEl.querySelector("#wizard-port-filters");
    const gridEl = panelEl.querySelector("#wizard-port-grid");

    const paintFilters = () => {
      filtersEl.innerHTML = PORT_FILTERS.map(
        (f) => `<button type="button" class="wizard-port-filters__item ${activeFilter === f.key ? "is-active" : ""}" data-filter="${f.key}">
        <img src="${activeFilter === f.key ? ICONS.anchorActive : ICONS.anchor}" alt="">
        <span>${escapeHtml(f.label)}</span>
      </button>`
      ).join("");
      filtersEl.querySelectorAll("[data-filter]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeFilter = btn.dataset.filter;
          paintFilters();
          paintGrid();
        });
      });
    };

    const paintGrid = () => {
      const list = activeFilter === "stranieri" ? [] : PORTS;
      gridEl.innerHTML = list.length
        ? list
            .map((port) => {
              const selected = pending === port;
              return `<button type="button" class="wizard-port-pill ${selected ? "is-selected" : ""}" data-transport="${escapeHtml(port)}">${escapeHtml(port)}</button>`;
            })
            .join("")
        : `<p class="wizard-list__empty">Nessun porto disponibile per questo filtro.</p>`;

      gridEl.querySelectorAll("[data-transport]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pending = btn.dataset.transport;
          paintGrid();
          paintActions();
        });
      });
    };

    paintFilters();
    paintGrid();

    function paintActions() {
      setActions(renderPrimaryCta("Prosegui", { disabled: !pending }));
      actionsEl.querySelector("#wizard-cta")?.addEventListener("click", () => {
        if (pending) selectTransport(pending);
      });
    }
    paintActions();
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

  // Selezione di un periodo (andata/ritorno), non più una singola data:
  // primo click = inizio periodo, secondo click = fine periodo.
  function renderStep3Calendar() {
    setBack("Indietro", () => goToStep(2));
    let pendingFrom = state.dateFrom;
    let pendingTo = state.dateTo;

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
                const isStart = pendingFrom && date.getTime() === pendingFrom.getTime();
                const isEnd = pendingTo && date.getTime() === pendingTo.getTime();
                const isInRange = pendingFrom && pendingTo && date > pendingFrom && date < pendingTo;
                const cls = ["wizard-calendar__day"];
                if (isToday) cls.push("wizard-calendar__day--today");
                if (isInRange) cls.push("wizard-calendar__day--in-range");
                if (isStart || isEnd) cls.push("wizard-calendar__day--selected");
                if (isStart) cls.push("wizard-calendar__day--range-start");
                if (isEnd) cls.push("wizard-calendar__day--range-end");
                return `<button type="button" class="${cls.join(" ")}" ${isPast ? "disabled" : ""} data-date="${date.getTime()}">${date.getDate()}</button>`;
              })
              .join("")}
          </div>
        </div>`;
      }
      monthsEl.innerHTML = html;
      monthsEl.querySelectorAll("[data-date]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const clicked = new Date(Number(btn.dataset.date));
          if (!pendingFrom || (pendingFrom && pendingTo)) {
            pendingFrom = clicked;
            pendingTo = null;
          } else if (clicked.getTime() < pendingFrom.getTime()) {
            pendingTo = pendingFrom;
            pendingFrom = clicked;
          } else {
            pendingTo = clicked;
          }
          paintCalendar();
          paintActions();
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

    function paintActions() {
      const ready = Boolean(pendingFrom && pendingTo);
      setActions(renderPrimaryCta("Prosegui", { disabled: !ready }));
      actionsEl.querySelector("#wizard-cta")?.addEventListener("click", () => {
        if (!ready) return;
        state.dateFrom = pendingFrom;
        state.dateTo = pendingTo;
        state.dateLabel = formatRangeLabel(pendingFrom, pendingTo);
        renderSummary();
        goToStep(4);
      });
    }
    paintActions();
  }

  // variante Crociere: selezione del mese (non del giorno esatto).
  function renderStep3Months() {
    setBack("Indietro", () => goToStep(2));
    let pending = state.dateValue;

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

    const paint = () => {
      wrap.innerHTML = years
        .flatMap((year) =>
          MONTH_NAMES.map((name, idx) => {
            const disabled = year === currentYear && idx < currentMonth;
            const selected = pending && pending.year === year && pending.month === idx;
            const icon = disabled ? ICONS.calendarOutlineDisabled : selected ? ICONS.calendarOutlineSelected : ICONS.calendarOutline;
            return `<button type="button" class="wizard-month-btn ${selected ? "is-selected" : ""}" ${disabled ? "disabled" : ""} data-year="${year}" data-month="${idx}">
              <img src="${icon}" alt="">
              <span class="wizard-month-btn__label">${capitalize(name)}</span>
              <span class="wizard-month-btn__year">${year}</span>
            </button>`;
          })
        )
        .join("");

      wrap.querySelectorAll("[data-month]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pending = { year: Number(btn.dataset.year), month: Number(btn.dataset.month) };
          paint();
          paintActions();
        });
      });
    };
    paint();

    function paintActions() {
      setActions(renderPrimaryCta("Prosegui", { disabled: !pending }));
      actionsEl.querySelector("#wizard-cta")?.addEventListener("click", () => {
        if (!pending) return;
        state.dateValue = pending;
        state.dateLabel = `${capitalize(MONTH_NAMES[pending.month])} ${pending.year}`;
        renderSummary();
        goToStep(4);
      });
    }
    paintActions();
  }

  // ---------- step 4: ospiti ----------
  function renderStep4() {
    setBack("Indietro", () => goToStep(3));
    panelEl.innerHTML = `
      <h3 class="wizard-step__title" id="wizard-step-title">Quanti ospiti partiranno?</h3>
      <p class="wizard-step__subtitle">Inserisci il numero di ospiti</p>
      <div class="wizard-guests">
        <div class="wizard-guests__row">
          <div><strong>ADULTI</strong><br><span class="wizard-guests__hint">dai 18 anni in su</span></div>
          <div class="wizard-counter">
            <button type="button" class="wizard-counter__btn" data-adjust="adults" data-delta="-1" ${state.adults <= 1 ? "disabled" : ""} aria-label="Diminuisci adulti"><img src="${ICONS.counterMinus}" alt=""></button>
            <span class="wizard-counter__value">${state.adults}</span>
            <button type="button" class="wizard-counter__btn" data-adjust="adults" data-delta="1" ${state.adults >= 9 ? "disabled" : ""} aria-label="Aumenta adulti"><img src="${ICONS.counterPlus}" alt=""></button>
          </div>
        </div>
        <div class="wizard-guests__row">
          <div><strong>BAMBINI</strong><br><span class="wizard-guests__hint">da 0 a 17 anni</span></div>
          <div class="wizard-counter">
            <button type="button" class="wizard-counter__btn" data-adjust="children" data-delta="-1" ${state.children <= 0 ? "disabled" : ""} aria-label="Diminuisci bambini"><img src="${ICONS.counterMinus}" alt=""></button>
            <span class="wizard-counter__value">${state.children}</span>
            <button type="button" class="wizard-counter__btn" data-adjust="children" data-delta="1" ${state.children >= 9 ? "disabled" : ""} aria-label="Aumenta bambini"><img src="${ICONS.counterPlus}" alt=""></button>
          </div>
        </div>
      </div>
      <div class="wizard-child-ages" id="wizard-child-ages"></div>
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

    setActions(renderPrimaryCta("Cerca", { icon: false }));
    actionsEl.querySelector("#wizard-cta")?.addEventListener("click", () => {
      renderSummary();
      renderDone();
    });
  }

  // ---------- step finale (demo) ----------
  function renderDone() {
    backBtn.hidden = true;
    setActions("");
    panelEl.innerHTML = `
      <div class="wizard-done">
        <h3 class="wizard-step__title" id="wizard-step-title">Ricerca inviata!</h3>
        <p class="wizard-step__subtitle">Ecco il riepilogo della tua richiesta (demo — nessuna ricerca reale):</p>
        <ul>
          <li><strong>Destinazione:</strong> ${state.destination ? escapeHtml(state.destination.subName ? `${state.destination.name} - ${state.destination.subName}` : state.destination.name) : "—"}</li>
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
    summaryBox.classList.remove("is-expanded");
    summaryToggle.textContent = "Apri dettagli";
    renderAll();
    panelEl.scrollTop = 0;
  }

  stepperEl.addEventListener("click", (e) => {
    const li = e.target.closest("[data-goto-step]");
    if (!li) return;
    const target = Number(li.dataset.gotoStep);
    if (target < state.step) goToStep(target);
  });

  // riepilogo collassabile (solo mobile — su desktop è sempre espanso via CSS)
  summaryBox.addEventListener("click", (e) => {
    if (!e.target.closest("[data-toggle-details]")) return;
    const expanded = summaryBox.classList.toggle("is-expanded");
    summaryToggle.textContent = expanded ? "Chiudi dettagli" : "Apri dettagli";
  });

  // ---------- apertura / chiusura ----------
  function open(cluster, trigger) {
    lastFocusedTrigger = trigger || null;
    state = defaultState();
    state.cluster = cluster || "";
    state.isCruise = (cluster || "").toLowerCase() === "crociere";
    summaryBox.classList.remove("is-expanded");
    summaryToggle.textContent = "Apri dettagli";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
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
