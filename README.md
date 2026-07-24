# Kira Viaggi

Prototipo statico (HTML/CSS/JS, no build step) della homepage di **Kira Viaggi**, realizzato a partire dal file Figma "UI - New Version v2.00.01". Sviluppato per OTO Travel Tech.

🔗 **Demo:** https://marcoriscica-jpg.github.io/KTravel/

> Pagina non indicizzata (`<meta name="robots" content="noindex, nofollow">`) — prototipo, non ancora contenuto di produzione.

## Stack

- HTML5 + CSS3 (custom properties, CSS Grid, `clamp()`/`max()` per il layout fluido) — nessun framework, nessun preprocessore.
- JavaScript vanilla (ES modules).
- [Motion](https://motion.dev) (libreria di animazione, vendorizzata localmente in `js/vendor/motion.js`, nessuna dipendenza da CDN a runtime) per le animazioni di entrata, hover e il menu.
- Font: [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk) (Google Fonts).

## Struttura

```
├── index.html
├── css/
│   ├── reset.css        # reset di base
│   ├── variables.css     # design tokens (colori, tipografia, spaziature)
│   └── site.css          # stili del sito
├── js/
│   ├── app.js             # interazioni: menu, hero, modal, scroll header
│   └── vendor/motion.js   # libreria Motion vendorizzata
└── assets/
    ├── icons/             # SVG (social, carte di pagamento)
    └── images/             # foto hero/card, logo, badge
```

## Funzionalità principali

- **Hero a griglia bento** (4 immagini, layout responsive) con:
  - animazione di entrata a cascata al caricamento;
  - hover con zoom della foto, overlay scuro leggero e titolo del cluster di ricerca (City Break, Safari, Adventure, Asia);
  - click su una tile → apre un modal placeholder per il futuro wizard di ricerca guidata (da progettare).
- **Menu di navigazione** a comparsa con effetto "cerchio che si espande" dal pulsante hamburger (icona che si trasforma in una X), voci in cascata in apertura/chiusura.
- **Header** fisso, che si nasconde scorrendo verso il basso e riappare subito scorrendo verso l'alto.
- Layout **responsive** (mobile-first), contenuto con `max-width` di 1440px, hero sempre a piena larghezza.
- Rispetta `prefers-reduced-motion`: le animazioni vengono disattivate/istantanee se l'utente lo richiede.

## Sviluppo locale

Nessuna dipendenza da installare. Basta un server statico qualsiasi, ad esempio:

```bash
python -m http.server 8080
# oppure l'estensione "Live Server" di VS Code
```

Poi apri `http://localhost:8080`.

## Note

- Alcuni link (`pages/destinazioni.html`, `pages/chi-siamo.html`, `pages/contatti.html`) puntano a pagine non ancora create.
- Il colore primario (`--color-primary` in `css/variables.css`) è un placeholder, da sostituire con il colore brand ufficiale.
- Contenuti testuali (descrizioni, dati legali) sono segnaposto a scopo di sviluppo.
