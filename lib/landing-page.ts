export function renderLandingHtml(): string {
  return `<!doctype html>
<html lang="en" data-type="software" data-radius="soft" data-ground="sky" data-buttons="solid" data-motion>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Universal Service: Next.js SaaS template for service venues</title>
<meta name="description" content="Ship a QR menu, online booking, LiqPay and MonoPay payments, Telegram alerts and an admin dashboard from one Next.js codebase.">
<meta property="og:type" content="website">
<meta property="og:title" content="Universal Service: Next.js SaaS template for service venues">
<meta property="og:description" content="QR menu with 24 dishes, 7 bookable services, LiqPay and MonoPay checkout and Telegram alerts in one MIT-licensed Next.js repository.">
<meta property="og:image" content="/share.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#ffffff">
<!-- <link rel="canonical" href="https://universal-service.example/"> -->
<meta name="site-kind" content="software">
<meta name="page-type" content="software">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chivo:wght@400..700&family=Chivo+Mono:wght@400..500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/system.css">
<link rel="stylesheet" href="/assets/ui/cards.css">
<link rel="stylesheet" href="/assets/motion/motion.css">
<link rel="stylesheet" href="/assets/backgrounds/backgrounds.css">
<link rel="stylesheet" href="/assets/layout/layout.css">
<link rel="stylesheet" href="/assets/icons/icon.css">
<style>
:root {
  --p-bg: #ffffff; --p-surface: #f3f3f3; --p-ink: #232323; --p-muted: #686868;
  --p-accent: #a1ffcb; --p-accent-ink: #232323; --p-action: #232323; --p-action-ink: #ffffff;
  --p-inv-bg: #232323; --p-inv-surface: #303030; --p-inv-ink: #ffffff; --p-inv-muted: #a4a4a4;
  --p-inv-accent: #a1ffcb; --p-inv-accent-ink: #232323; --p-inv-action: #a1ffcb; --p-inv-action-ink: #232323;
  --font-display: "Chivo", system-ui, sans-serif;
  --font-text: "Chivo", system-ui, sans-serif;
  --font-mono: "Chivo Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --display-weight: 400;
  --display-tracking: -0.03em;
  --display-tracking-xl: -0.04em;
  --ly-scale: 0.96;
}
</style>
<link rel="stylesheet" href="/assets/ui/base.css">
<link rel="stylesheet" href="/assets/ui/window/fragment.css">
<link rel="stylesheet" href="/assets/ui/calendar/fragment.css">
<link rel="stylesheet" href="/assets/ui/search/fragment.css">
<link rel="stylesheet" href="/assets/ui/notify/fragment.css">
<link rel="stylesheet" href="/assets/ui/toggles/fragment.css">
<link rel="stylesheet" href="/assets/ui/integrations/fragment.css">
<link rel="stylesheet" href="/assets/moments/letters-assemble/moment.css">
<script>document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)</script>
<script src="/assets/backgrounds/backgrounds.js"></script>
<script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
<link rel="modulepreload" href="/assets/moments/moments.js">
<link rel="modulepreload" href="/assets/moments/lib.js">
<link rel="modulepreload" href="/assets/moments/letters-assemble/moment.js">
<style>
  .app.ui { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); margin-top: var(--s-7); background: var(--u-bg); border: 1px solid var(--u-border); border-radius: var(--u-r); box-shadow: var(--u-shadow); }
  .app > .app__pane { position: relative; min-width: 0; min-height: 0; overflow: hidden; }
  .app > .app__pane + .app__pane { border-left: 1px solid var(--u-line); }
  .app > .app__pane > .ui-panel { width: 100%; max-width: none; border: 0; border-radius: 0; box-shadow: none; }
  .app > .app__pane::after { content: ""; position: absolute; inset: auto 0 0 0; height: 64px; background: linear-gradient(transparent, var(--u-bg)); pointer-events: none; }
  @media (min-width: 1024px) and (max-width: 1279px) { .app.ui { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); } }
  @media (max-width: 1023px) {
    .app.ui { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }
    .app > .app__pane--list { max-height: 252px; }
    .app > .app__pane--list::after { display: none; }
    .app .ui-win__side { display: none; }
    .app .ui-win__body { grid-template-columns: minmax(0, 1fr); }
    .app > .app__pane + .app__pane { border-left: 0; border-top: 1px solid var(--u-line); }
  }
  @media (max-width: 639px) {
    .app.ui { grid-template-rows: minmax(0, 1fr); }
    .app > .app__pane--list { display: none; }
    .app > .app__pane + .app__pane { border-top: 0; }
    #faq .faq > .faq__item { padding: var(--s-3) 0; }
    .nav:not(.is-open) .nav__actions { display: none; }
    .nav:not(.is-open) .nav__actions + .nav__toggle { margin-left: auto; }
  }
  #features .panel { --p-h: 280px; }
  @media (min-width: 640px) and (max-width: 1023px) {
    #features .card--open.span-6 { grid-column: 1 / -1; }
    #features .panel { --p-h: clamp(196px, 20.5svh, 250px); }
    #pricing { --h: 2; }
  }
  @media (max-width: 639px) {
    #features .panel { --p-h: 160px; }
    #features .stage { --fade-h: 40px; }
    .hero--split {
      height: auto !important;
      min-height: 100svh;
      padding-bottom: 32px;
    }
    main > :is(section, .section):not(.hero),
    footer.closing {
      height: auto !important;
      min-height: 0 !important;
      padding-top: 56px !important;
      padding-bottom: 40px !important;
    }
    main > .section.g2 > .wrap {
      display: flex !important;
      flex-direction: column !important;
      row-gap: var(--s-5) !important;
    }
    main > .section > .wrap > .fill {
      flex: none !important;
      height: auto !important;
    }
    .app.ui {
      grid-template-rows: auto !important;
    }
    main > .section .section-head {
      margin-bottom: var(--s-5);
    }
  }
  .hero__media[data-fx], #features .panel[data-fx] {
    background-image: radial-gradient(75% 70% at 22% 18%, #e4edf5 0%, #c6d3df 56%, #b2c3d3 100%);
  }
  #statement .mo-la__type { font-size: var(--t-h2); line-height: 1.08; letter-spacing: var(--display-tracking); max-width: 24ch; }
  #statement .mo-la__sub { color: var(--ink); margin-top: var(--s-4); }
  .stack-tiles { display: flex; flex-wrap: wrap; gap: var(--s-3); margin-top: var(--s-5); }
  .plan-head { display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); }
  .venue-rows li { align-items: start; padding-block: var(--s-4); }
  .venue-rows .rows__name small { display: block; font-weight: 400; color: var(--ink); font-size: var(--t-small); margin-top: 2px; }
</style>
</head>
<body>
<!-- type: software
     deal: hero split | palette white-mint-tiles | type chivo (third pairing from start.mjs deal after urbanist and schibsted wrapped the 45-char hero-lines stress test to 4 lines at 1440) | nav nav-centre | footer footer-columns (re-dealt from footer-dark because white-mint-tiles --p-inv-action #a1ffcb adds a third button fill on inverse) | close close-type | rhythm space | buttons solid | mark ring | ground sky | effect gradient-mesh (hero) | card painterly-landscape | moments letters-assemble (#statement) -->
<header class="nav nav--centre">
  <div class="wrap nav__bar">
    <a class="skip-link" href="#top">Skip to content</a>
    <a class="nav__logo" href="#top"><span class="mark" data-mark="ring" aria-hidden="true"></span>Universal Service</a>
    <nav class="nav__links" aria-label="Main">
      <div class="nav__item">
        <a class="nav__link" href="#workspace">Admin <svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <div class="nav__menu">
          <div class="wrap grid">
            <div class="menu-col span-3">
              <p class="t-label">Sections</p>
              <a href="#workspace">Admin window<span>Orders and slots together</span></a>
              <a href="#features">Venue modules<span>Menus, slots and payments</span></a>
              <a href="#statement">Venue trades<span>Six supported business types</span></a>
            </div>
            <div class="menu-col span-3">
              <p class="t-label">Live routes</p>
              <a href="/menu/demo-restaurant">Demo Restaurant<span>Interactive QR menu</span></a>
              <a href="/book/haircut-classic">Demo Barbershop<span>Online slot picker</span></a>
              <a href="/admin">Admin dashboard<span>Orders, menu and tables</span></a>
            </div>
          </div>
        </div>
      </div>
      <div class="nav__item"><a class="nav__link" href="#features">Modules</a></div>
      <div class="nav__item"><a class="nav__link" href="#pricing">Pricing</a></div>
      <div class="nav__item"><a class="nav__link" href="#faq">Questions</a></div>
    </nav>
    <div class="nav__actions">
      <a class="nav__link" href="/admin">Admin</a>
      <a class="btn btn--primary" href="/menu/demo-restaurant">Try demo menu</a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-label="Menu">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
  </div>
</header>

<main id="top">
  <section class="hero hero--split" data-enter aria-labelledby="hero-h">
    <div class="wrap">
      <div class="hero-text grid hero__grid">
        <div class="hero__text span-5">
          <p class="hero__kicker"><span class="dot" aria-hidden="true"></span>Next.js · TypeScript · MIT License</p>
          <h1 id="hero-h">SaaS template for service venues</h1>
          <p class="hero__lead">Ship a QR menu, online booking, LiqPay and MonoPay payments, and Telegram alerts from one repository. Includes 24 menu dishes and 7 services.</p>
          <div class="btn-row">
            <a class="btn btn--primary" href="/menu/demo-restaurant">Try demo menu<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg></a>
            <a class="btn btn--secondary" href="/book/haircut-classic">Book a test slot</a>
          </div>
        </div>

        <div class="hero__media span-6 start-7" data-visual="hero-window" data-fx="gradient-mesh" data-fx-seed="42" data-fx-palette='{"bg":"#c6d3df","surface":"#d6e0e9","ink":"#25303a","accent":"#3f6a92"}' data-fx-params='{"speed":0.16,"calmX":0.5,"calmY":0.95}'>
          <div class="stage stage--fade-br">
            <div class="at-corner to-edge" style="--ax:24px;--ay:28px;--ay-sm:16px" data-ui-loop>
              <div class="ui ui-panel ui-win" data-ui="window" data-open="New" data-work="Kitchen" data-done="Paid" role="img" aria-label="Live queue of Demo Restaurant table orders and barbershop bookings">
                <div class="ui-win__bar">
                  <span class="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                  <span class="ui-win__crumb">Demo Restaurant <i>/</i> <b>Orders</b></span>
                  <span class="ui-spacer"></span>
                  <span class="ui-win__search" aria-hidden="true"><svg class="ui-icon" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg><span class="ui-win__ph">Filter</span><span class="ui-kbd">/</span></span>
                </div>
                <div class="ui-win__body">
                  <nav class="ui-win__side" aria-hidden="true">
                    <span class="ui-win__nav is-on"><svg class="ui-icon" viewBox="0 0 16 16"><path d="M2.5 9h3l1 1.5h3l1-1.5h3"/><path d="M2.5 9 4 3.5h8L13.5 9v3.5h-11z"/></svg>Orders<em>24</em></span>
                    <span class="ui-win__nav"><svg class="ui-icon" viewBox="0 0 16 16"><circle cx="8" cy="6" r="2.5"/><path d="M3.5 13.5c.6-2.3 2.4-3.5 4.5-3.5s3.9 1.2 4.5 3.5"/></svg>Slots<em>7</em></span>
                    <span class="ui-win__nav"><svg class="ui-icon" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>Tables<em>12</em></span>
                    <span class="ui-win__nav"><svg class="ui-icon" viewBox="0 0 16 16"><path d="m3.5 8.4 2.8 2.8 6.2-6.4"/></svg>Bot log</span>
                    <span class="ui-win__label">Gateways</span>
                    <span class="ui-win__nav"><span class="ui-win__hash">#</span>LiqPay</span>
                    <span class="ui-win__nav"><span class="ui-win__hash">#</span>MonoPay</span>
                  </nav>
                  <div class="ui-win__main">
                    <div class="ui-win__cols" aria-hidden="true"><span>Guest</span><span>Item</span><span>Status</span><span>Age</span></div>
                    <ul class="ui-win__rows">
                      <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="1">T4</span><span class="ui-win__who">Table 4</span><span class="ui-win__sub">Ribeye · 890 UAH</span><span class="ui-win__st" data-st>New</span><span class="ui-win__age">1m</span></li>
                      <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="3">T7</span><span class="ui-win__who">Table 7</span><span class="ui-win__sub">Burrata · 320 UAH</span><span class="ui-win__st" data-st>New</span><span class="ui-win__age">3m</span></li>
                      <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="4">AK</span><span class="ui-win__who">Andrii K.</span><span class="ui-win__sub">Haircut · 450 UAH</span><span class="ui-win__st is-done" data-st>Paid</span><span class="ui-win__age">8m</span></li>
                      <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="2">T2</span><span class="ui-win__who">Table 2</span><span class="ui-win__sub">Pizza · 360 UAH</span><span class="ui-win__st is-you" data-st>Kitchen</span><span class="ui-win__age">12m</span></li>
                      <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="5">IB</span><span class="ui-win__who">Iryna B.</span><span class="ui-win__sub">Massage · 1,200 UAH</span><span class="ui-win__st is-done" data-st>Paid</span><span class="ui-win__age">19m</span></li>
                      <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="3">T9</span><span class="ui-win__who">Table 9</span><span class="ui-win__sub">Negroni · 220 UAH</span><span class="ui-win__st is-done" data-st>Paid</span><span class="ui-win__age">25m</span></li>
                      <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="1">OP</span><span class="ui-win__who">Olha P.</span><span class="ui-win__sub">Kids cut · 300 UAH</span><span class="ui-win__st is-done" data-st>Paid</span><span class="ui-win__age">34m</span></li>
                      <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="4">T5</span><span class="ui-win__who">Table 5</span><span class="ui-win__sub">Salmon · 620 UAH</span><span class="ui-win__st is-done" data-st>Paid</span><span class="ui-win__age">41m</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ly-float">
            <div class="ly-float__row"><span class="ly-live">Live routes</span><span>UA / EN</span></div>
            <div class="ly-float__title">7 categories, 24 dishes, 7 services</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="workspace" aria-labelledby="workspace-h">
    <div class="wrap">
      <div class="grid">
        <div class="span-5">
          <h2 id="workspace-h">Admin window for orders and bookings</h2>
        </div>
        <div class="span-6 start-7 stack-4">
          <p class="t-lead">Edit menu dishes, review table orders and confirm service slots on one Next.js backend. All records read from one typed file until you connect PostgreSQL.</p>
          <p><a class="link" href="/admin/orders">Inspect live orders</a></p>
        </div>
      </div>

      <div class="ui app fill" role="img" aria-label="Universal Service admin window listing venue bookings beside the November 2026 schedule calendar" data-ui-pause-host>
        <div class="app__pane app__pane--list">
          <div class="ui ui-panel ui-win" data-ui="window" data-ui-still data-open="Pending" data-work="Checking" data-done="Confirmed">
            <div class="ui-win__bar">
              <span class="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="ui-win__crumb">Admin <i>/</i> <b>Bookings</b></span>
              <span class="ui-spacer"></span>
              <span class="ui-win__search" aria-hidden="true"><svg class="ui-icon" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg><span class="ui-win__ph">Search</span><span class="ui-kbd">/</span></span>
            </div>
            <div class="ui-win__body">
              <nav class="ui-win__side" aria-hidden="true">
                <span class="ui-win__nav is-on"><svg class="ui-icon" viewBox="0 0 16 16"><path d="M2.5 9h3l1 1.5h3l1-1.5h3"/><path d="M2.5 9 4 3.5h8L13.5 9v3.5h-11z"/></svg>Bookings<em>7</em></span>
                <span class="ui-win__nav"><svg class="ui-icon" viewBox="0 0 16 16"><circle cx="8" cy="6" r="2.5"/><path d="M3.5 13.5c.6-2.3 2.4-3.5 4.5-3.5s3.9 1.2 4.5 3.5"/></svg>Menu<em>24</em></span>
                <span class="ui-win__nav"><svg class="ui-icon" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>Tables<em>12</em></span>
                <span class="ui-win__nav"><svg class="ui-icon" viewBox="0 0 16 16"><path d="m3.5 8.4 2.8 2.8 6.2-6.4"/></svg>Bot log</span>
                <span class="ui-win__label">Venues</span>
                <span class="ui-win__nav"><span class="ui-win__hash">#</span>Barbershop</span>
                <span class="ui-win__nav"><span class="ui-win__hash">#</span>Spa</span>
              </nav>
              <div class="ui-win__main">
                <div class="ui-win__cols" aria-hidden="true"><span>Master</span><span>Service</span><span>Status</span><span>Time</span></div>
                <ul class="ui-win__rows">
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="1">AK</span><span class="ui-win__who">Andrii K.</span><span class="ui-win__sub">Haircut · 450 UAH</span><span class="ui-win__st is-done" data-st>Confirmed</span><span class="ui-win__age">10:00</span></li>
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="3">AK</span><span class="ui-win__who">Andrii K.</span><span class="ui-win__sub">Beard Trim · 250 UAH</span><span class="ui-win__st" data-st>Pending</span><span class="ui-win__age">11:30</span></li>
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="4">IB</span><span class="ui-win__who">Iryna B.</span><span class="ui-win__sub">Massage · 1,200 UAH</span><span class="ui-win__st is-done" data-st>Confirmed</span><span class="ui-win__age">12:00</span></li>
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="2">KL</span><span class="ui-win__who">Kateryna L.</span><span class="ui-win__sub">Facial · 950 UAH</span><span class="ui-win__st is-you" data-st>LiqPay</span><span class="ui-win__age">13:30</span></li>
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="5">OP</span><span class="ui-win__who">Olha P.</span><span class="ui-win__sub">Kids Cut · 300 UAH</span><span class="ui-win__st is-done" data-st>Confirmed</span><span class="ui-win__age">14:30</span></li>
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="1">IB</span><span class="ui-win__who">Iryna B.</span><span class="ui-win__sub">Deep Tissue · 1,700 UAH</span><span class="ui-win__st is-done" data-st>Confirmed</span><span class="ui-win__age">15:00</span></li>
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="3">MZ</span><span class="ui-win__who">Dr. Zhuk</span><span class="ui-win__sub">Consult · 0 UAH</span><span class="ui-win__st is-done" data-st>Confirmed</span><span class="ui-win__age">16:30</span></li>
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="4">DR</span><span class="ui-win__who">Table 6</span><span class="ui-win__sub">Duck · 580 UAH</span><span class="ui-win__st is-done" data-st>Paid</span><span class="ui-win__age">17:15</span></li>
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="2">DR</span><span class="ui-win__who">Table 3</span><span class="ui-win__sub">Risotto · 420 UAH</span><span class="ui-win__st is-done" data-st>Paid</span><span class="ui-win__age">18:00</span></li>
                  <li class="ui-win__row" data-row><span class="ui-avatar" data-tone="5">DR</span><span class="ui-win__who">Table 8</span><span class="ui-win__sub">Lamb · 760 UAH</span><span class="ui-win__st is-done" data-st>Paid</span><span class="ui-win__age">18:45</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="app__pane app__pane--open" data-ui-loop>
          <div class="ui ui-panel ui-calendar" data-ui="calendar" data-start="23" data-end="27" data-month="Nov">
            <div class="ui-cal__head">
              <div class="ui-cal__month">November <span>2026</span></div>
              <span class="ui-spacer"></span>
              <span class="ui-chip ui-chip--plain ui-chip--ink" data-cal-range>Nov 23 – 27</span>
              <span class="ui-cal__nav" aria-hidden="true"><svg class="ui-icon" viewBox="0 0 16 16"><path d="M10 4 6 8l4 4"/></svg></span>
              <span class="ui-cal__nav" aria-hidden="true"><svg class="ui-icon" viewBox="0 0 16 16"><path d="m6 4 4 4-4 4"/></svg></span>
            </div>
            <div class="ui-cal__dow" aria-hidden="true"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>
            <div class="ui-cal__days">
              <span class="ui-cal__d is-out"><b>26</b></span><span class="ui-cal__d is-out"><b>27</b></span><span class="ui-cal__d is-out"><b>28</b></span><span class="ui-cal__d is-out"><b>29</b></span><span class="ui-cal__d is-out"><b>30</b></span><span class="ui-cal__d is-out"><b>31</b></span><span class="ui-cal__d" data-d="1"><b>1</b></span>
              <span class="ui-cal__d" data-d="2"><b>2</b></span><span class="ui-cal__d" data-d="3"><b>3</b></span><span class="ui-cal__d" data-d="4"><b>4</b></span><span class="ui-cal__d" data-d="5"><b>5</b></span><span class="ui-cal__d" data-d="6"><b>6</b></span><span class="ui-cal__d" data-d="7"><b>7</b></span><span class="ui-cal__d" data-d="8"><b>8</b></span>
              <span class="ui-cal__d" data-d="9"><b>9</b></span><span class="ui-cal__d" data-d="10"><b>10</b></span><span class="ui-cal__d" data-d="11"><b>11</b></span><span class="ui-cal__d" data-d="12"><b>12</b></span><span class="ui-cal__d" data-d="13"><b>13</b></span><span class="ui-cal__d" data-d="14"><b>14</b></span><span class="ui-cal__d" data-d="15"><b>15</b></span>
              <span class="ui-cal__d" data-d="16"><b>16</b></span><span class="ui-cal__d" data-d="17"><b>17</b></span><span class="ui-cal__d" data-d="18"><b>18</b></span><span class="ui-cal__d" data-d="19"><b>19</b></span><span class="ui-cal__d" data-d="20"><b>20</b></span><span class="ui-cal__d is-today" data-d="21"><b>21</b></span><span class="ui-cal__d" data-d="22"><b>22</b></span>
              <span class="ui-cal__d is-start" data-d="23"><b>23</b></span><span class="ui-cal__d is-in" data-d="24"><b>24</b></span><span class="ui-cal__d is-in" data-d="25"><b>25</b></span><span class="ui-cal__d is-in" data-d="26"><b>26</b></span><span class="ui-cal__d is-end" data-d="27"><b>27</b></span><span class="ui-cal__d is-mark" data-d="28"><b>28</b></span><span class="ui-cal__d" data-d="29"><b>29</b></span>
            </div>
            <div class="ui-cal__events">
              <div class="ui-cal__ev" data-ev="23">
                <span class="ui-cal__date"><b>23</b><i>Nov</i></span>
                <span class="ui-cal__evtext"><span class="ui-cal__evtitle">Classic Haircut · Andrii K.</span><span class="ui-cal__evsub">Demo Barbershop · 60 min · 450 UAH</span></span>
              </div>
              <div class="ui-cal__ev" data-ev="27">
                <span class="ui-cal__date"><b>27</b><i>Nov</i></span>
                <span class="ui-cal__evtext"><span class="ui-cal__evtitle">Relaxation Massage · Iryna B.</span><span class="ui-cal__evsub">Demo Spa · 60 min · 1,200 UAH</span></span>
              </div>
              <div class="ui-cal__ev" data-ev="28">
                <span class="ui-cal__date"><b>28</b><i>Nov</i></span>
                <span class="ui-cal__evtext"><span class="ui-cal__evtitle">Free Consultation · Dr. Zhuk</span><span class="ui-cal__evsub">Demo Clinic · 30 min · 0 UAH</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section g2" id="features" aria-labelledby="features-h">
    <div class="wrap">
      <div class="group">
        <div class="section-head">
          <h2 id="features-h">Modules for menus, bookings and payments. <span class="muted">Swap one TypeScript file to rebrand a client.</span></h2>
        </div>

        <div class="grid">
          <article class="card card--row card--open span-6">
            <h3><a class="link" href="/menu/demo-restaurant/table/1">Publish QR menus</a></h3>
            <p>Serve 7 categories with portions, allergens and printable table QR cards from one menu editor.</p>
            <div class="panel" data-fx="painterly-landscape" data-fx-seed="77" data-fx-palette='{"bg":"#a3b0b6","accent":"#c49a6c"}' data-fx-params='{"blur":1,"brush":0.35,"slope":0,"hillY":0.3,"horizon":0.62,"speed":0,"drift":0}'>
              <div class="stage stage--fade-b">
                <div class="at-rise fit to-edge" style="--fit-max:380px;--ax:max(24px, 50% - 190px);--ay:32px;--ay-sm:14px" data-ui-loop>
                  <div class="ui ui-panel ui-search" data-ui="search">
                    <div class="ui-search__field">
                      <svg class="ui-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>
                      <span class="ui-search__q"><span data-search-q>burrata</span><i class="ui-search__caret"></i></span>
                      <kbd class="ui-search__kbd">Ctrl K</kbd>
                    </div>
                    <div class="ui-search__group">Demo Restaurant</div>
                    <ul class="ui-search__list" data-search-list>
                      <li class="ui-search__row is-sel"><span class="ui-search__ico"><svg class="ui-icon" viewBox="0 0 16 16"><path d="M4 2.5h5l3 3v8H4z"/><path d="M9 2.5v3h3"/></svg></span><span class="ui-search__t"><b>Burrata</b> with Tomatoes</span><span class="ui-search__m">320 UAH</span></li>
                      <li class="ui-search__row"><span class="ui-search__ico"><svg class="ui-icon" viewBox="0 0 16 16"><path d="M4 2.5h5l3 3v8H4z"/><path d="M9 2.5v3h3"/></svg></span><span class="ui-search__t">Ribeye Steak 350g</span><span class="ui-search__m">890 UAH</span></li>
                      <li class="ui-search__row"><span class="ui-search__ico"><svg class="ui-icon" viewBox="0 0 16 16"><path d="M4 2.5h5l3 3v8H4z"/><path d="M9 2.5v3h3"/></svg></span><span class="ui-search__t">Margherita 30 cm</span><span class="ui-search__m">360 UAH</span></li>
                    </ul>
                    <div class="ui-search__foot"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> to move</span><span><kbd>Enter</kbd> to open</span></div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article class="card card--row card--open span-6">
            <h3><a class="link" href="/book/beard-trim">Accept online bookings</a></h3>
            <p>Check open slots by master, confirm appointments and send Telegram webhook alerts to staff.</p>
            <div class="panel frame--lit">
              <div class="stage stage--fade-b">
                <div class="at-rise fit" style="--fit-max:390px;--ax:max(24px, 50% - 195px);--ay:28px;--ay-sm:14px" data-ui-still>
                  <div class="ui ui-notify" data-ui="notify">
                    <ul class="ui-notify__list" data-notify-list>
                      <li class="ui-note"><span class="ui-agent ui-note__av" aria-hidden="true"></span><span class="ui-note__text"><span class="ui-note__title">New booking logged<time>now</time></span><span class="ui-note__body">Classic Haircut · 450 UAH</span></span><span class="ui-btn ui-btn--sm ui-note__btn">Open</span></li>
                      <li class="ui-note"><span class="ui-avatar ui-note__av" data-tone="5">LP</span><span class="ui-note__text"><span class="ui-note__title">LiqPay settled<time>4m</time></span><span class="ui-note__body">Order #ord_abc123 · 450 UAH</span></span></li>
                      <li class="ui-note"><span class="ui-note__ico"><svg class="ui-icon" viewBox="0 0 16 16"><path d="m3.5 8.4 2.8 2.8 6.2-6.4"/></svg></span><span class="ui-note__text"><span class="ui-note__title">Dish paused<time>11m</time></span><span class="ui-note__body">Linguine hidden in QR menu</span></span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="grid">
        <article class="card card--row card--open span-6">
          <h3><a class="link" href="/admin/settings">Payment and menu settings</a></h3>
          <p>Toggle payment gateways, bilingual UA/EN menus, table QR sheets and Telegram alerts per location.</p>
          <div class="panel frame--lit">
            <div class="stage stage--fade-b">
              <div class="at-right to-edge" style="--ax:32px;--ay:28px;--ay-sm:14px" data-ui-still>
                <div class="ui ui-panel ui-toggles" data-ui="toggles">
                  <div class="ui-head">
                    <svg class="ui-icon ui-toggles__ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 13 4v3.6c0 3-2.1 5.4-5 6.6-2.9-1.2-5-3.6-5-6.6V4z"/><path d="m5.8 8 1.6 1.6 3-3.2"/></svg>
                    <div class="ui-title">Venue modules</div>
                    <span class="ui-spacer"></span>
                    <div class="ui-meta" data-tg-count>4 of 5 on</div>
                  </div>
                  <ul class="ui-toggles__list">
                    <li class="ui-tg"><span class="ui-tg__text"><span class="ui-tg__label">LiqPay QR checkout</span><span class="ui-tg__sub">POST /api/payment/create</span></span><button class="ui-switch is-on" type="button" role="switch" aria-checked="true" aria-label="LiqPay QR checkout"><i></i></button></li>
                    <li class="ui-tg"><span class="ui-tg__text"><span class="ui-tg__label">Telegram webhook alerts</span><span class="ui-tg__sub">Notify admin on each order</span></span><button class="ui-switch is-on" type="button" role="switch" aria-checked="true" aria-label="Telegram webhook alerts"><i></i></button></li>
                    <li class="ui-tg"><span class="ui-tg__text"><span class="ui-tg__label">MonoPay fallback</span><span class="ui-tg__sub">Add MONOPAY_TOKEN in .env</span></span><button class="ui-switch" type="button" role="switch" aria-checked="false" aria-label="MonoPay fallback"><i></i></button></li>
                    <li class="ui-tg"><span class="ui-tg__text"><span class="ui-tg__label">Bilingual UA / EN</span><span class="ui-tg__sub">Powered by next-intl</span></span><button class="ui-switch is-on" type="button" role="switch" aria-checked="true" aria-label="Bilingual UA and EN"><i></i></button></li>
                    <li class="ui-tg"><span class="ui-tg__text"><span class="ui-tg__label">Table QR print sheets</span><span class="ui-tg__sub">3 cards per A4 row</span></span><button class="ui-switch is-on" type="button" role="switch" aria-checked="true" aria-label="Table QR print sheets"><i></i></button></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="card card--row card--open m-nolift span-6">
          <h3>Next.js API routes and stack</h3>
          <p>Seven typed Next.js API routes wire Zod validation, Supabase PostgreSQL, Telegram webhooks and Vercel deploys.</p>
          <div class="panel frame--lit">
            <div class="stage stage--fade-b">
              <div class="at-corner fit" style="--fit-max:380px;--ax:32px;--ay:28px;--ay-sm:14px" data-ui-still>
                <div class="ui ui-panel ui-apps" data-ui="integrations">
                  <div class="ui-head">
                    <div class="ui-title">Connected stack</div>
                    <span class="ui-spacer"></span>
                    <div class="ui-meta" data-apps-count>3 connected</div>
                  </div>
                  <ul class="ui-apps__list">
                    <li class="ui-app is-on">
                      <span class="ui-logo ui-logo--sm"><img src="/assets/icons/nextjs.svg" alt="" width="20" height="20" loading="lazy"></span>
                      <span class="ui-app__text"><span class="ui-app__name">Next.js App Router</span><span class="ui-app__sub">Menu, booking and API routes</span></span>
                      <span class="ui-app__state"><span class="ui-chip ui-app__on">Connected</span></span>
                    </li>
                    <li class="ui-app is-on">
                      <span class="ui-logo ui-logo--sm"><img src="/assets/icons/telegram.svg" alt="" width="20" height="20" loading="lazy"></span>
                      <span class="ui-app__text"><span class="ui-app__name">Telegram Bot</span><span class="ui-app__sub">POST /api/bot/webhook alerts</span></span>
                      <span class="ui-app__state"><span class="ui-chip ui-app__on">Connected</span></span>
                    </li>
                    <li class="ui-app" data-apps-target>
                      <span class="ui-logo ui-logo--sm"><img src="/assets/icons/supabase.svg" alt="" width="20" height="20" loading="lazy"></span>
                      <span class="ui-app__text"><span class="ui-app__name">Supabase PostgreSQL</span><span class="ui-app__sub">Production menu and slot storage</span></span>
                      <span class="ui-app__state"><span class="ui-chip ui-app__on">Connected</span><button class="ui-btn ui-btn--ghost ui-btn--sm ui-app__connect" type="button"><span class="ui-spin ui-app__spin" aria-hidden="true"></span><span>Connect</span></button></span>
                    </li>
                    <li class="ui-app is-on">
                      <span class="ui-logo ui-logo--sm"><img src="/assets/icons/vercel.svg" alt="" width="20" height="18" loading="lazy"></span>
                      <span class="ui-app__text"><span class="ui-app__name">Vercel</span><span class="ui-app__sub">One-command production deploy</span></span>
                      <span class="ui-app__state"><span class="ui-chip ui-app__on">Connected</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="section" id="pricing" style="--hm:2" aria-labelledby="pricing-h">
    <div class="wrap">
      <div class="section-head">
        <h2 id="pricing-h">Pricing for hosted venues</h2>
        <p>Self-host the MIT codebase on Vercel at zero licence cost, or run managed plans per venue.</p>
      </div>

      <div class="grid">
        <article class="card card--plan span-4">
          <div class="plan-head">
            <h3>Free</h3>
            <span class="ic-tile"><img class="ic ic-24" src="/assets/icons/nextjs.svg" alt="" width="24" height="24" loading="lazy"></span>
          </div>
          <p>Single cafes replacing paper menus.</p>
          <p class="price"><span class="t-stat">0 UAH</span><span class="t-small muted">/ month</span></p>
          <a class="btn btn--secondary" href="https://github.com/Mykhailo-Zhuk/universal-service-template" target="_blank" rel="noreferrer">Get MIT repository</a>
          <ul class="checks">
            <li>QR menu up to 30 items</li>
            <li>Printable table QR sheets</li>
            <li>UA and EN interface</li>
            <li>Mobile-first guest view</li>
          </ul>
        </article>

        <article class="card card--plan is-featured span-4">
          <div class="plan-head">
            <h3>Basic</h3>
            <span class="badge">1 location</span>
          </div>
          <p>Barbershops, salons and clinics taking slots.</p>
          <p class="price"><span class="t-stat">500 UAH</span><span class="t-small muted">/ month</span></p>
          <a class="btn btn--primary" href="/book/haircut-classic">Book a test slot</a>
          <ul class="checks">
            <li>Unlimited QR menu items</li>
            <li>Online slot booking by master</li>
            <li>Telegram bot alerts</li>
            <li>Protected admin dashboard</li>
          </ul>
        </article>

        <article class="card card--plan span-4">
          <div class="plan-head">
            <h3>Pro</h3>
            <span class="ic-tile"><img class="ic ic-24" src="/assets/icons/supabase.svg" alt="" width="24" height="24" loading="lazy"></span>
          </div>
          <p>Multi-location venues taking online checkout.</p>
          <p class="price"><span class="t-stat">1,200 UAH</span><span class="t-small muted">/ month</span></p>
          <a class="btn btn--secondary" href="/admin">See admin panel</a>
          <ul class="checks">
            <li>Multiple venue locations</li>
            <li>LiqPay and MonoPay checkout</li>
            <li>Supabase PostgreSQL backend</li>
            <li>Order and booking stats</li>
          </ul>
        </article>
      </div>
    </div>
  </section>

  <section class="section" id="statement" data-moment="letters-assemble" style="--hm:2" aria-labelledby="statement-h">
    <div class="wrap">
      <div class="grid">
        <div class="span-5 stack-4">
          <h2 class="mo-la__type" id="statement-h">One template, six trades</h2>
          <p class="mo-la__sub">Fork the repository once and adapt it for restaurants, cafes, barbershops, spas, auto washes or clinics by replacing <code>data/demo.ts</code> and adding your keys.</p>
          <div class="stack-tiles" aria-label="Included technology stack">
            <span class="ic-tile"><img class="ic ic-28" src="/assets/icons/nextjs.svg" alt="Next.js" width="28" height="28" loading="lazy"></span>
            <span class="ic-tile"><img class="ic ic-28" src="/assets/icons/typescript.svg" alt="TypeScript" width="28" height="28" loading="lazy"></span>
            <span class="ic-tile"><img class="ic ic-28 ic-land" src="/assets/icons/tailwindcss.svg" alt="Tailwind CSS" width="28" height="17" loading="lazy"></span>
            <span class="ic-tile"><img class="ic ic-28" src="/assets/icons/supabase.svg" alt="Supabase" width="27" height="28" loading="lazy"></span>
            <span class="ic-tile"><img class="ic ic-28" src="/assets/icons/telegram.svg" alt="Telegram" width="28" height="28" loading="lazy"></span>
            <span class="ic-tile"><img class="ic ic-28 ic-ink" src="/assets/icons/vercel.svg" alt="Vercel" width="28" height="24" loading="lazy"></span>
          </div>
          <p><a class="link" href="/admin/tables">Preview table QR print sheet</a></p>
        </div>
        <ul class="rows venue-rows span-6 start-7">
          <li><span class="rows__name">Restaurants and pizzerias<small>7 categories, weights, allergens and printable table QR sheets</small></span><span class="rows__value">QR menu</span></li>
          <li><span class="rows__name">Cafes and cocktail bars<small>Portion variations, drink sizes and instant availability toggles</small></span><span class="rows__value">Table order</span></li>
          <li><span class="rows__name">Barbershops and salons<small>Master selection with 30 and 60 minute booking slots</small></span><span class="rows__value">Slot picker</span></li>
          <li><span class="rows__name">Spas and massage studios<small>60 and 90 minute sessions with LiqPay prepayment support</small></span><span class="rows__value">LiqPay QR</span></li>
          <li><span class="rows__name">Auto washes and tyre shops<small>Bay reservation slots paired with Telegram staff webhooks</small></span><span class="rows__value">Telegram bot</span></li>
          <li><span class="rows__name">Dental and local clinics<small>Introductory consultations and protected admin schedules</small></span><span class="rows__value">Admin panel</span></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section" id="faq" aria-labelledby="faq-h">
    <div class="wrap">
      <div class="grid">
        <div class="span-5 stack-4">
          <h2 id="faq-h">Questions</h2>
          <p class="t-lead">Local seed records, Supabase PostgreSQL, payment webhooks and MIT licensing.</p>
          <div class="stack-tiles" aria-label="Backend tools">
            <span class="ic-tile"><img class="ic ic-24" src="/assets/icons/postgres.svg" alt="PostgreSQL" width="23" height="24" loading="lazy"></span>
            <span class="ic-tile"><img class="ic ic-24" src="/assets/icons/supabase.svg" alt="Supabase" width="23" height="24" loading="lazy"></span>
            <span class="ic-tile"><img class="ic ic-24" src="/assets/icons/telegram.svg" alt="Telegram" width="24" height="24" loading="lazy"></span>
            <span class="ic-tile"><img class="ic ic-24 ic-ink" src="/assets/icons/github.svg" alt="GitHub" width="24" height="23" loading="lazy"></span>
          </div>
          <p><a class="link" href="https://github.com/Mykhailo-Zhuk/universal-service-template/issues" target="_blank" rel="noreferrer">Read issues on GitHub</a></p>
        </div>
        <div class="faq span-6 start-7">
          <div class="faq__item">
            <h3>How do I swap menu items for a client?</h3>
            <p>Edit the restaurant and service arrays in <code>data/demo.ts</code> and replace the logo in <code>public/</code>.</p>
          </div>
          <div class="faq__item">
            <h3>Which database runs in production?</h3>
            <p>Local TypeScript files power <code>npm run dev</code>. Connect Supabase PostgreSQL for live venues.</p>
          </div>
          <div class="faq__item">
            <h3>How do LiqPay and Telegram connect to the template?</h3>
            <p>API routes wire LiqPay and MonoPay callbacks plus a Telegram webhook once keys are added to <code>.env</code>.</p>
          </div>
          <div class="faq__item">
            <h3>How does admin login protect venue routes?</h3>
            <p>Middleware checks <code>admin_token</code> against <code>ADMIN_SECRET</code> on every <code>/admin</code> request.</p>
          </div>
          <div class="faq__item">
            <h3>What licence covers commercial service sites?</h3>
            <p>The codebase ships under the MIT License for commercial venues deployed on Vercel or Node.js.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="footer closing" id="contact" aria-labelledby="close-h">
  <div class="wrap">
    <div class="closing__cta close--type">
      <div class="section-head">
        <h2 id="close-h">Test the live menu</h2>
        <p>Browse 24 dishes across 7 categories in Demo Restaurant, or deploy the MIT repository on Vercel.</p>
      </div>
      <a class="btn btn--primary btn--xl btn--wide" href="/menu/demo-restaurant">Try demo menu<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg></a>
    </div>

    <div class="closing__links">
      <div class="grid">
        <div class="span-6 stack-4">
          <a class="nav__logo" href="#top"><span class="mark" data-mark="ring" aria-hidden="true"></span>Universal Service</a>
          <p class="footer__lede">Next.js SaaS template for restaurants, barbershops, spas and clinics.</p>
        </div>
        <div class="span-3 footer__col">
          <h3>Product</h3>
          <ul>
            <li><a href="#workspace">Admin window</a></li>
            <li><a href="#features">Modules</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">Questions</a></li>
          </ul>
        </div>
        <div class="span-3 footer__col">
          <h3>Routes</h3>
          <ul>
            <li><a href="/menu/demo-restaurant">Demo Restaurant</a></li>
            <li><a href="/book/haircut-classic">Online booking</a></li>
            <li><a href="/admin">Admin panel</a></li>
            <li><a href="https://github.com/Mykhailo-Zhuk/universal-service-template" target="_blank" rel="noreferrer">GitHub source</a></li>
          </ul>
        </div>
      </div>

      <div class="footer__legal">
        <span>&copy; 2026 Universal Service Template · MIT License</span>
        <div class="socials"></div>
        <span class="credits">Product names and logos are trademarks of their owners</span>
      </div>
    </div>
  </div>
</footer>

<script type="module" src="/assets/system.js"></script>
<script type="module" src="/assets/motion/motion.js"></script>
<script type="module" src="/assets/layout/layout.js"></script>
</body>
</html>`;
}
