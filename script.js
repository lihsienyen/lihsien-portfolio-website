const COST_DEFAULTS = Object.freeze({ projects: 18, resume: 30, economy: 10, progression: 14, experience: 18, eff1: 5, eff2: 12, eff3: 25, eff4: 45, ring: 5, red: 6, orange: 7, yellow: 8, green: 9, blue: 10, indigo: 11, violet: 12, disco: 35, bonus: 50 });
const COST_STORAGE_KEY = 'portfolio-quest-costs-v1';
let costs = { ...COST_DEFAULTS };
try {
  const savedCosts = JSON.parse(localStorage.getItem(COST_STORAGE_KEY) || '{}');
  for (const key of Object.keys(COST_DEFAULTS)) {
    if (Number.isInteger(savedCosts[key]) && savedCosts[key] >= 0 && savedCosts[key] <= 9999) costs[key] = savedCosts[key];
  }
} catch { /* Invalid local tuning falls back to the published defaults. */ }
const COST_FIELDS = [
  { key: 'projects', label: 'Projects area', group: 'Major areas' },
  { key: 'resume', label: 'Resume area', group: 'Major areas' },
  { key: 'economy', label: 'Resource Loop case study', group: 'Case studies' },
  { key: 'progression', label: 'Road to Mastery case study', group: 'Case studies' },
  { key: 'experience', label: 'Moment to Moment case study', group: 'Case studies' },
  { key: 'eff1', label: 'Efficiency I', group: 'Focus Sprint · Efficiency' },
  { key: 'eff2', label: 'Efficiency II', group: 'Focus Sprint · Efficiency' },
  { key: 'eff3', label: 'Efficiency III', group: 'Focus Sprint · Efficiency' },
  { key: 'eff4', label: 'Efficiency IV', group: 'Focus Sprint · Efficiency' },
  { key: 'ring', label: 'Pulse Ring', group: 'Focus Sprint · Cosmetic' },
  { key: 'red', label: 'Red glow', group: 'Focus Sprint · Cosmetic' },
  { key: 'orange', label: 'Orange glow', group: 'Focus Sprint · Cosmetic' },
  { key: 'yellow', label: 'Yellow glow', group: 'Focus Sprint · Cosmetic' },
  { key: 'green', label: 'Green glow', group: 'Focus Sprint · Cosmetic' },
  { key: 'blue', label: 'Blue glow', group: 'Focus Sprint · Cosmetic' },
  { key: 'indigo', label: 'Indigo glow', group: 'Focus Sprint · Cosmetic' },
  { key: 'violet', label: 'Violet glow', group: 'Focus Sprint · Cosmetic' },
  { key: 'disco', label: 'Rainbow Disco', group: 'Focus Sprint · Cosmetic' },
  { key: 'bonus', label: 'Quick Bonus Target', group: 'Focus Sprint · Gameplay' }
];
const RAINBOW = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const RAINBOW_HEX = { red: '#f16d78', orange: '#ffa459', yellow: '#ffe36f', green: '#8cda8e', blue: '#70b6f4', indigo: '#8f88ed', violet: '#ca82ec' };
const TREE_NODES = [
  { id: 'eff1', label: 'Efficiency I', detail: '+1 value per hit', needs: [], branch: 'efficiency' },
  { id: 'eff2', label: 'Efficiency II', detail: '+1 value per hit', needs: ['eff1'], branch: 'efficiency' },
  { id: 'eff3', label: 'Efficiency III', detail: '+1 value per hit', needs: ['eff2'], branch: 'efficiency' },
  { id: 'eff4', label: 'Efficiency IV', detail: '+1 value per hit', needs: ['eff3'], branch: 'efficiency' },
  { id: 'ring', label: 'Pulse Ring', detail: 'Each hit sends out a growing ring', needs: [], branch: 'cosmetic' },
  ...RAINBOW.map(id => ({ id, label: id[0].toUpperCase() + id.slice(1), detail: 'Adds ' + id + ' glow', needs: ['ring'], branch: 'cosmetic' })),
  { id: 'disco', label: 'Rainbow Disco', detail: 'Rotate all seven colors on each hit', needs: RAINBOW, branch: 'cosmetic' },
  { id: 'bonus', label: 'Quick Bonus Target', detail: 'Catch a fading +10 target within 2 seconds', needs: ['eff4', 'disco'], branch: 'gameplay' }
];
const TUNING_MODE = new URLSearchParams(location.search).get('tune') === '1';
const AREA_META = [
  { id: 'home', label: 'Home', icon: '⌂', cost: 0 },
  { id: 'about', label: 'About me', icon: '◉', cost: 0 },
  { id: 'projects', label: 'Projects', icon: '▦', cost: costs.projects },
  { id: 'resume', label: 'Resume', icon: '≡', cost: costs.resume },
  { id: 'arcade', label: 'Mini-games', icon: '✧', cost: 0 }
];
const PROJECTS = [
  { id: 'economy', title: 'The resource loop', type: 'ECONOMY DESIGN', symbol: '✦', cost: costs.economy, description: 'A place to unpack how you balance earning, spending, and meaningful player choice.', detail: 'Suggested case study structure: design goal → constraints → your role → economy diagram → iteration → outcome.' },
  { id: 'progression', title: 'The road to mastery', type: 'PROGRESSION SYSTEM', symbol: '↗', cost: costs.progression, description: 'Show how milestones, pacing, and rewards help players keep moving forward.', detail: 'Suggested case study structure: player journey → pacing problem → progression map → playtest learning → impact.' },
  { id: 'experience', title: 'The moment to moment', type: 'PLAYER EXPERIENCE', symbol: '◇', cost: costs.experience, description: 'Demonstrate how feedback and clarity turn complex systems into intuitive play.', detail: 'Suggested case study structure: experience problem → interface decisions → prototype → feedback → result.' }
];
const GAME_GALLERY = [
  { id: 'skullgirls', title: 'Skullgirls Mobile', role: 'Economy & Monetization Consultant', image: 'skullgirls-mobile.jpg', imageSource: 'https://www.pocketgamer.com/skullgirls-mobile/5-2-update/', metric: '10M+ Android installs', metricNote: 'Google Play install tier · 2026', metricSource: 'https://play.google.com/store/apps/details?hl=en_US&id=com.autumn.skullgirls' },
  { id: 'shovel', title: 'Shovel Up!', role: 'Senior Economy Designer', image: 'shovel-up.jpg', imageSource: 'https://horizon.meta.com/world/733399513180174/', metric: '4.2K+ likes', metricNote: 'Meta Horizon milestone · Nov 2025', metricSource: 'https://developers.meta.com/vr/blog/worlds/shovel-up-goes-remixable-best-practices-for-world-builders/' },
  { id: 'kingdom', title: 'Kingdom Maker', role: 'Senior Game Designer', image: 'kingdom-maker.jpg', imageSource: 'https://www.pocketgamer.com/kingdom-maker/famous-noble-traits/', metric: '1M+ Android installs', metricNote: 'Google Play install tier · 2026', metricSource: 'https://play.google.com/store/apps/details?hl=en&id=com.gww.km' },
  { id: 'ffxv', title: 'Final Fantasy XV: A New Empire', role: 'Senior Game Designer', image: 'final-fantasy-xv-a-new-empire.jpg', imageSource: 'https://gnn.gamer.com.tw/detail.php?sn=147706', metric: '$375M gross in 2018', metricNote: 'Sensor Tower estimate · 2018', metricSource: 'https://sensortower.com/blog/final-fantasy-xv-a-new-empire-revenue-2018' },
  { id: 'shop', title: 'Shop Heroes', role: 'Lead Game Designer', image: 'shop-heroes.jpg', imageSource: 'https://store.steampowered.com/app/506140/Shop_Heroes/', metric: '1.5M players', metricNote: 'Cloudcade-reported milestone · 2015', metricSource: 'https://gamesbeat.com/cloudcade-adds-player-vs-player-mode-to-fantasy-rpg-shop-heroes/' },
  { id: 'sonic', title: 'Sonic Dash', role: 'Product Manager', image: 'sonic-dash.jpg', imageSource: 'https://www.games.ch/9108-sonic-dash/news/global-challange-gestartet-9Vf/', metric: '676M downloads', metricNote: 'SEGA cumulative figure · 2025', metricSource: 'https://www.segasammy.co.jp/en/ir/individual/business/?ct=IR' },
  { id: 'got', title: 'Game of Thrones: Conquest', role: 'Game Design Consultant', image: 'game-of-thrones-conquest.jpg', imageSource: 'https://www.warnerbrosgames.com/game/game-of-thrones-conquest', metric: '$125M first-year gross', metricNote: 'Sensor Tower estimate · 2018', metricSource: 'https://sensortower.com/blog/game-of-thrones-conquest-revenue' },
  { id: 'gow', title: 'Game of War: Fire Age', role: 'Game Designer', image: 'game-of-war-fire-age.png', imageSource: 'https://www.deconstructoroffun.com/blog/2020/1/9/2020-predictions-strategy', metric: '$2.8B in first five years', metricNote: 'Sensor Tower estimate · 2018', metricSource: 'https://sensortower.com/blog/game-of-war-revenue' }
];
// Contributions are separate from the public, title-wide milestones above.
const GAME_CONTRIBUTIONS = {
  skullgirls: {
    summary: 'Rebuilt the Backstage Pass point curve, task difficulty, and rewards around attainable player goals, increasing pass revenue by 35.3%, unique pass buyers by 38.8%, and doubling paid-tier upsell conversion. Restructured monthly offers and taught an AI-assisted tuning workflow.'
  },
  shovel: {
    summary: 'Owned progression and economy from concept to launch. In response to playtest feedback, designed two complementary layers of player guidance—persistent Objectives and guided Quests—and revised the unlock order to give players a clearer path forward.'
  },
  kingdom: {
    summary: 'Designed and tuned systems from pre-launch into Live Ops. Built reward aggregation tooling that cut one manager’s weekly event reporting from two days to one hour. Contributed to tutorial, early progression, and monetization improvements that helped the team reduce customer acquisition payback from 36 to 28 days.'
  },
  ffxv: {
    summary: 'Designed, tuned, and shipped Live Ops content on a two-week cadence with the team, using bundle performance to inform offer structure and pricing. Partnered with Engineering on a Google Sheets map authoring tool that let designers place terrain visually and export game-ready JSON.'
  },
  shop: {
    summary: 'Owned Shop Heroes Live Ops design, analyzing and tuning the economy to balance revenue goals with player sentiment.'
  },
  sonic: {
    summary: 'Owned performance optimization work on Sonic Dash, partnering with internal teams and development partners to focus on three core KPIs: ad impressions, session length, and daily session count.'
  },
  got: {
    summary: 'Consulted on feature prototypes and partnered with Design and Analytics to define KPIs, identify launch risks, and recommend post-launch mitigations.'
  },
  gow: {
    summary: 'Progressed from QA to Game Design and owned four core systems: Gifts, Quests, Heroes, and Equipment. Built economy models and progression projections for those systems through the July 2013 launch.'
  }
};
// Tags describe the work, not a change to the person’s official job title.
const EXPERIENCE = [
  { company: 'Autumn Games', role: 'Economy & Monetization Consultant', dates: 'May 2026 – September 2026', bullets: [
    { views: ['design', 'product'], text: 'Rebuilt Skullgirls Mobile’s Backstage Pass point curve, task difficulty, and rewards around attainable goals, lifting pass revenue 35.3%, unique buyers 38.8%, and paid-tier upsell conversion 2×.' },
    { views: ['design', 'product'], text: 'Restructured monthly offers and their cadence, lifting conversion rate and average revenue per paying user 10%.' },
    { views: ['design'], text: 'Built an AI-assisted tuning pipeline that translated spreadsheet specifications into Unity values designers could change and playtest.' },
    { views: ['product'], text: 'Taught the tuning workflow to designers so they could iterate without routine engineering support.' }
  ] },
  { company: 'BigBox VR — A Meta Company', role: 'Senior Economy Designer', dates: 'September 2024 – February 2026', bullets: [
    { views: ['design', 'product'], text: 'Owned Shovel Up! progression and economy from concept to launch on Meta Horizon, connecting player goals, rewards, and unlock pacing.' },
    { views: ['design'], text: 'Designed persistent Objectives and smaller guided Quests after playtests showed players lacked clear next goals.' },
    { views: ['design'], text: 'Reworked progression unlock order to give players a clearer path through the experience.' },
    { views: ['design', 'product'], text: 'Contributed to a launch that ranked #1 platform-wide in minutes per weekly active user and sustained visit rate, and #2 in monetization and D30-retained weekly active users; these are game-wide team outcomes.' },
    { views: ['product'], text: 'Co-led a cross-studio screen of 100+ mobile and Roblox titles, identifying 20 AI-recreatable concepts to inform a 2026 business-vertical plan.' }
  ] },
  { company: 'Scopely', role: 'Senior Game Designer', dates: 'November 2021 – February 2024', bullets: [
    { views: ['design'], text: 'Served as a key systems and economy designer on Kingdom Maker from pre-launch through its June 2022 global launch and ongoing Live Ops.' },
    { views: ['design', 'product'], text: 'Contributed to early progression, tutorial, and monetization changes that reduced customer acquisition payback from 36 to 28 days.' },
    { views: ['design', 'product'], text: 'Built a reward aggregation spreadsheet that cut one Live Ops manager’s weekly event reporting from two days to one hour.' },
    { views: ['design', 'product'], text: 'Partnered with Product, Analytics, and Engineering on changes that improved D1–D15 retention, using player behavior to guide iteration.' },
    { views: ['product'], text: 'Analyzed competing games and features to inform content and roadmap recommendations.' },
    { views: ['product'], text: 'Coordinated schedules, releases, and iterations with cross-functional partners, surfacing performance concerns and scope or priority tradeoffs.' }
  ] },
  { company: 'Machine Zone / AppLovin', role: 'Senior Game Designer', dates: 'December 2019 – October 2021', bullets: [
    { views: ['design'], text: 'Designed, tuned, and shipped Final Fantasy XV: A New Empire Live Ops content on a two-week cadence with the design team.' },
    { views: ['design', 'product'], text: 'Analyzed bundle and content performance to inform offer structure, pricing, and Live Ops iteration.' },
    { views: ['design', 'product'], text: 'Designed a Google Sheets map authoring tool with Engineering so designers could place terrain visually and export game-ready JSON.' },
    { views: ['design', 'product'], text: 'Optimized the tutorial and onboarding funnel for an unannounced title during soft testing, reducing churn and improving early retention.' },
    { views: ['product'], text: 'Coordinated content, QA, and publishing work to support recurring Live Ops delivery.' }
  ] },
  { company: 'Cloudcade', role: 'Lead Game Designer', dates: 'January 2018 – September 2019', bullets: [
    { views: ['design', 'product'], text: 'Led an eight-person Design, Art, and QA team on an unannounced title, setting direction for engagement systems, meta progression, and monetization.' },
    { views: ['design', 'product'], text: 'Owned Shop Heroes Live Ops design and economy tuning, balancing revenue goals with player sentiment.' },
    { views: ['design', 'product'], text: 'Authored game specifications and risk assessments that surfaced technical and design issues early in production.' },
    { views: ['product'], text: 'Planned Shop Heroes Live Ops content delivery and tuning to support revenue stability.' },
    { views: ['design'], text: 'Mentored two junior designers in their design work and professional development.' }
  ] },
  { company: 'SEGA of America', role: 'Product Manager', dates: 'August 2016 – December 2017', bullets: [
    { views: ['design', 'product'], text: 'Owned Sonic Dash performance optimization work focused on ad impressions, session length, and daily session count.' },
    { views: ['design'], text: 'Created UI wireframes and feature flow diagrams for a new unannounced title, making proposed player experiences concrete for development partners.' },
    { views: ['product'], text: 'Built data infrastructure and product documentation for the new title to support internal and external team alignment.' },
    { views: ['product'], text: 'Coordinated internal teams and external development partners on feature and project work.' },
    { views: ['product'], text: 'Briefed leadership on Eastern-market competitive developments to inform feature concepts and project proposals.' }
  ] },
  { company: 'Turbine (WB Boston)', role: 'Game Design Consultant', dates: 'June 2016 – March 2017', concurrent: true, bullets: [
    { views: ['design'], text: 'Consulted on Game of Thrones: Conquest feature prototypes.' },
    { views: ['design', 'product'], text: 'Partnered with Design and Analytics to define KPIs, identify launch risks, and recommend post-launch mitigations.' }
  ] },
  { company: 'SEGA Hardlight', role: 'Game Design Consultant', dates: 'March 2016 – March 2017', concurrent: true, bullets: [
    { views: ['design'], text: 'Led economy design and playtests for an unreleased card-based 4X title.' },
    { views: ['design', 'product'], text: 'Supported a closed beta for that title that raised £1,200 for SpecialEffect in five days.' }
  ] },
  { company: 'Legend Gaming', role: 'Game Designer', dates: 'July 2015 – February 2016', bullets: [
    { views: ['design', 'product'], text: 'Assessed partner-developed RPGs for Western-market appeal, gameplay depth, and localization feasibility.' },
    { views: ['design'], text: 'Created feature and Live Ops tool wireframes and user flows.' },
    { views: ['design', 'product'], text: 'Converted partner spreadsheets into scalable content-management tools.' }
  ] },
  { company: 'FunPlus', role: 'Senior Game Designer', dates: 'October 2013 – May 2015', bullets: [
    { views: ['design'], text: 'Specified systems and features for 4X strategy titles in development.' },
    { views: ['design', 'product'], text: 'Helped connect the US and China teams on live and in-development projects.' }
  ] },
  { company: 'Addmired / Machine Zone', role: 'QA Tester / Game Designer', dates: 'July 2011 – October 2013', bullets: [
    { views: ['design', 'product'], text: 'Moved from QA into Game Design and became feature owner for Gifts, Quests, Heroes, and Equipment on Game of War: Fire Age.' },
    { views: ['design'], text: 'Built economy models and progression projections for those systems through the game’s July 2013 launch.' }
  ] }
];
const RESUME_VIEWS = {
  combined: {
    label: 'Combined', subtitle: 'Game design · Product management perspective',
    profile: 'Game designer specializing in economy design, progression, monetization, and Live Ops. I’ve owned systems from concept through launch, improved live features through data-informed iteration, and built tools that give design teams more autonomy. My Product Manager role at SEGA and cross-functional work bring a product perspective to player-centered design.',
    focus: 'Economy & progression · Live Ops · Experimentation · Product analytics · Cross-functional delivery · Design tooling'
  },
  design: {
    label: 'Game Design', subtitle: 'Economies · Progression · Player experience',
    profile: 'Economy and systems designer focused on player goals, reward pacing, progression, and Live Ops. My work spans concept-to-launch system ownership, playtest-led iteration, monetization design, and spreadsheet tools that help designers balance and ship content.',
    focus: 'Economy modeling · Reward balance · Progression pacing · Quest systems · Playtesting · Live Ops design'
  },
  product: {
    label: 'Product Management', subtitle: 'Product outcomes · Experimentation · Team delivery',
    profile: 'Product management experience at SEGA, complemented by product-focused work in game design roles. I connect player behavior and business goals through KPI analysis, onboarding and monetization improvements, competitive research, and cross-functional delivery. I build practical tools and documentation that help teams make decisions and execute.',
    focus: 'KPI analysis · Retention & monetization · Competitive research · Roadmap input · Cross-functional delivery · Workflow improvements'
  }
};
const STORAGE_KEY = 'portfolio-quest-prototype-v1';
const initial = { points: 0, unlocked: ['home', 'about', 'arcade'], discovered: [], visited: [], projects: [], expanded: [], recruiter: false, active: 'home', resumeView: 'combined', sprint: { earned: 0, spent: 0, totalHits: 0, runs: 0, unlocked: [] } };
let state;
try { state = { ...initial, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch { state = { ...initial }; }
state.unlocked = Array.isArray(state.unlocked) ? state.unlocked : [...initial.unlocked];
state.discovered = Array.isArray(state.discovered) ? state.discovered : [];
state.projects = Array.isArray(state.projects) ? state.projects : [];
state.visited = Array.isArray(state.visited) ? [...new Set(state.visited.filter(id => ['about', 'projects', 'resume', 'arcade'].includes(id)))] : [];
if (!Object.hasOwn(RESUME_VIEWS, state.resumeView)) state.resumeView = 'combined';
state.sprint = { ...initial.sprint, ...(state.sprint && typeof state.sprint === 'object' ? state.sprint : {}) };
state.sprint.unlocked = Array.isArray(state.sprint.unlocked) ? state.sprint.unlocked.filter(id => TREE_NODES.some(n => n.id === id)) : [];
for (const key of ['earned', 'spent', 'totalHits', 'runs']) state.sprint[key] = Math.max(0, Math.floor(Number(state.sprint[key]) || 0));
state.sprint.spent = Math.min(state.sprint.spent, state.sprint.earned);
state.expanded = Array.isArray(state.expanded) ? state.expanded : [];
state.points = Math.max(0, Number(state.points) || 0);
if (!AREA_META.some(x => x.id === state.active)) state.active = 'home';
if (!state.recruiter && !state.unlocked.includes(state.active) && AREA_META.find(x => x.id === state.active)?.cost !== 0) state.active = 'home';

const $ = selector => document.querySelector(selector);
let toastTimer;
let journeyCelebrationTimer;
let journeyBurstTimer;
let gameInterval;
let gameEnds = 0;
let hits = 0;
let lastGameResult = null;
let runHitPoints = 0;
let bonusSpawnTimer;
let bonusFadeTimer;
let avatarCoolTimer;
let recentClicks = [];
const MOTIVATION = ['You got this!', 'Keep going!', 'Good job!', 'So awesome!'];
let motivationIndex = 0;
const pendingCelebrations = [];
let celebrationSide = 0;
let bestSprint = 0;
function renderExperience() {
  const view = RESUME_VIEWS[state.resumeView];
  const list = $('#experience-list');
  list.replaceChildren();
  let bulletCount = 0;
  let roleCount = 0;
  EXPERIENCE.forEach(job => {
    const visibleBullets = job.bullets.filter(bullet => state.resumeView === 'combined' || bullet.views.includes(state.resumeView));
    if (!visibleBullets.length) return;
    roleCount++;
    bulletCount += visibleBullets.length;
    const entry = document.createElement('section');
    entry.className = 'resume-entry';
    const heading = document.createElement('h3');
    heading.textContent = job.role;
    const company = document.createElement('strong');
    company.textContent = job.company;
    const meta = document.createElement('div');
    meta.className = 'resume-entry-meta';
    meta.textContent = `${job.dates}${job.concurrent ? ' · Consultant (concurrent)' : ''}`;
    const bullets = document.createElement('ul');
    visibleBullets.forEach(bullet => {
      const item = document.createElement('li');
      item.textContent = bullet.text;
      bullets.append(item);
    });
    entry.append(heading, company, meta, bullets);
    list.append(entry);
  });
  document.querySelectorAll('[data-resume-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.resumeView === state.resumeView)));
  $('#resume-subtitle').textContent = view.subtitle;
  $('#resume-profile').textContent = view.profile;
  $('#resume-focus').textContent = view.focus;
  $('#resume-view-status').textContent = `${view.label} · ${bulletCount} accomplishments across ${roleCount} roles`;
}
function setResumeView(view) {
  if (!Object.hasOwn(RESUME_VIEWS, view) || state.resumeView === view) return;
  state.resumeView = view;
  save();
  renderExperience();
}
function dismissJourneyCelebration() {
  clearTimeout(journeyCelebrationTimer);
  clearTimeout(journeyBurstTimer);
  const closeButton = $('#journey-celebration-close');
  if (document.activeElement === closeButton) $('#main-content').focus({ preventScroll: true });
  $('#journey-celebration').hidden = true;
  $('#journey-meter').classList.remove('celebrating');
  $('#journey-burst').replaceChildren();
}
function celebrateJourney() {
  dismissJourneyCelebration();
  clearTimeout(toastTimer);
  $('#toast').classList.remove('show');
  $('#journey-meter').classList.add('celebrating');
  $('#journey-celebration').hidden = false;
  $('#journey-announcement').textContent = 'Quest complete! Menu exploration is at 100%. All four areas discovered.';
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const colors = ['#b6f277', '#d4a336', '#48a46e', '#9bc5ff'];
    for (let i = 0; i < 24; i++) {
      const spark = document.createElement('i');
      const angle = i / 24 * Math.PI * 2;
      const distance = 40 + (i % 4) * 14;
      spark.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--spark-y', `${Math.sin(angle) * distance}px`);
      spark.style.setProperty('--spark-rotation', `${i * 47}deg`);
      spark.style.setProperty('--spark-delay', `${i % 4 * 45}ms`);
      spark.style.background = colors[i % colors.length];
      $('#journey-burst').append(spark);
    }
  }
  journeyBurstTimer = setTimeout(() => {
    $('#journey-burst').replaceChildren();
    $('#journey-meter').classList.remove('celebrating');
  }, 1800);
  journeyCelebrationTimer = setTimeout(dismissJourneyCelebration, 7200);
}
function homeVisualVisible() {
  const visual = $('.hero-visual');
  const bounds = visual.getBoundingClientRect();
  return $('#title-screen').hidden && state.active === 'home' && bounds.top < innerHeight && bounds.bottom > 0;
}
function flushCelebrations() {
  if (!homeVisualVisible()) return;
  pendingCelebrations.splice(0, 2).forEach((event, index) => {
    setTimeout(() => {
      if (!homeVisualVisible()) { pendingCelebrations.unshift(event); return; }
      const chip = document.createElement('span');
      chip.className = `profile-event ${celebrationSide++ % 2 ? 'event-bottom' : 'event-top'}`;
      const symbol = document.createElement('span');
      symbol.textContent = event.icon;
      chip.append(symbol, document.createTextNode(` ${event.message}`));
      $('#profile-events').append(chip);
      chip.addEventListener('animationend', () => chip.remove(), { once: true });
    }, index * 250);
  });
}
function celebrate(message, icon = '✦') {
  pendingCelebrations.push({ message, icon });
  if (pendingCelebrations.length > 2) pendingCelebrations.shift();
  flushCelebrations();
}
function revealHomeVisual() {
  const visual = $('.hero-visual');
  if (!homeVisualVisible()) return;
  visual.classList.remove('is-visible');
  void visual.offsetWidth;
  const card = visual.querySelector('.profile-card');
  const quest = $('.quest-panel');
  const cardBounds = card.getBoundingClientRect();
  const questBounds = quest.getBoundingClientRect();
  const scale = visual.getBoundingClientRect().width / visual.offsetWidth || 1;
  const cardX = cardBounds.left + cardBounds.width / 2;
  const cardY = cardBounds.top + cardBounds.height / 2;
  visual.style.setProperty('--profile-from-x', `${(questBounds.left + questBounds.width * .56 - cardX) / scale}px`);
  visual.style.setProperty('--profile-from-y', `${(questBounds.top + 48 - cardY) / scale}px`);
  visual.querySelectorAll('.orbit-node').forEach(node => {
    const bounds = node.getBoundingClientRect();
    node.style.setProperty('--node-from-x', `${(cardX - bounds.left - bounds.width / 2) / scale}px`);
    node.style.setProperty('--node-from-y', `${(cardY - bounds.top - bounds.height / 2) / scale}px`);
  });
  visual.classList.add('is-visible');
  flushCelebrations();
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function toast(message, kind = '') { const el = $('#toast'); el.textContent = message; el.classList.toggle('error', kind === 'error'); el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), kind === 'error' ? 1800 : 2600); }
function addPoints(amount, message) { state.points += amount; save(); updateUI(); if (message) toast(message); }
function animateClickPoint() {
  const score = $('#points');
  score.classList.remove('bump');
  void score.offsetWidth;
  score.classList.add('bump');
  const float = document.createElement('span');
  float.className = 'point-float';
  float.textContent = '+1';
  float.style.left = `${25 + Math.random() * 48}%`;
  float.style.top = `${8 + Math.random() * 34}%`;
  float.style.setProperty('--rise', `${-30 - Math.round(Math.random() * 28)}px`);
  $('#points-fx').append(float);
  float.addEventListener('animationend', () => float.remove(), { once: true });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(() => float.remove(), 100);
}
function animateClickRipple(event) {
  if (!event.clientX && !event.clientY) return;
  const ripple = document.createElement('span');
  ripple.className = 'click-ripple';
  ripple.style.left = `${event.clientX}px`;
  ripple.style.top = `${event.clientY}px`;
  document.body.append(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(() => ripple.remove(), 100);
}
function canAccess(id) { return state.recruiter || state.unlocked.includes(id) || AREA_META.find(x => x.id === id)?.cost === 0; }
function flashLocked(id) {
  const button = document.querySelector(`#main-nav [data-go="${id}"]`);
  if (!button) return;
  button.classList.remove('denied');
  void button.offsetWidth;
  button.classList.add('denied');
  button.addEventListener('animationend', () => button.classList.remove('denied'), { once: true });
}
function displayCost(cost) { return `${cost} pts`; }
function renderNav() {
  $('#main-nav').innerHTML = AREA_META.map(a => {
    const locked = !canAccess(a.id);
    return `<button type="button" class="nav-item ${state.active === a.id ? 'active' : ''} ${locked ? 'locked' : ''}" data-go="${a.id}" ${state.active === a.id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${locked ? '♧' : a.icon}</span><span class="nav-text">${a.label}</span><span class="nav-cost">${locked ? displayCost(a.cost) : (a.id === 'home' ? '' : '↗')}</span></button>`;
  }).join('');
}
function renderProjects() {
  $('#projects-grid').innerHTML = PROJECTS.map(p => {
    const owned = state.projects.includes(p.id);
    const open = state.expanded.includes(p.id) && (owned || state.recruiter);
    return `<article class="project-card"><div class="project-art ${p.id}"><span class="art-corner">CASE STUDY / EXAMPLE</span><span class="art-symbol">${p.symbol}</span></div><div class="project-body"><div class="project-meta">${p.type}</div><h2>${p.title}</h2><p>${p.description}</p><button type="button" class="project-open" data-project="${p.id}">${owned || state.recruiter ? (open ? 'Close case study −' : 'Open case study ↗') : `Unlock case study · ${p.cost} pts`}</button></div><div class="project-detail ${open ? 'show' : ''}"><strong>CASE STUDY BLUEPRINT</strong><p>${p.detail}</p><div class="sample-callout">Replace this blueprint with a real project and your actual contribution.</div></div></article>`;
  }).join('');
}
function renderGameGallery() {
  $('#game-gallery').innerHTML = GAME_GALLERY.map(game => {
    const work = GAME_CONTRIBUTIONS[game.id];
    return `<article class="game-gallery-card">
      <a class="game-gallery-image" href="${game.imageSource}" target="_blank" rel="noopener noreferrer" data-gallery="${game.id}" aria-label="View ${game.title} artwork source"><img src="assets/${game.image}" alt="Promotional artwork for ${game.title}" loading="lazy"></a>
      <div class="game-gallery-body"><span class="game-gallery-role">${game.role}</span><h3>${game.title}</h3><div class="game-contribution"><span class="contribution-label">MY WORK</span><p>${work.summary}</p></div></div>
      <footer class="game-title-context"><span class="title-context-label">TITLE-WIDE CONTEXT · NOT INDIVIDUAL IMPACT</span><div class="game-gallery-metric"><strong>${game.metric}</strong><span>${game.metricNote}</span></div><p>Reported game milestone; may fall outside my time on the team.</p><div class="game-gallery-links"><a href="${game.metricSource}" target="_blank" rel="noopener noreferrer" data-gallery="${game.id}">Milestone source ↗</a><a href="${game.imageSource}" target="_blank" rel="noopener noreferrer" data-gallery="${game.id}">Art source ↗</a></div></footer>
    </article>`;
  }).join('');
}

function syncCosts() {
  AREA_META.find(a => a.id === 'projects').cost = costs.projects;
  AREA_META.find(a => a.id === 'resume').cost = costs.resume;
  PROJECTS.forEach(p => { p.cost = costs[p.id]; });
}
function renderTuningFields() {
  $('#tuning-fields').innerHTML = COST_FIELDS.map((field, index) => `<label class="tuning-field"><span>${index === 0 || COST_FIELDS[index - 1].group !== field.group ? `<small>${field.group}</small>` : ''}${field.label}</span><span class="tuning-input"><input type="number" min="0" max="9999" step="1" name="${field.key}" value="${costs[field.key]}" required><span>pts</span></span></label>`).join('');
}
function saveTuning() {
  const next = {};
  for (const field of COST_FIELDS) {
    const input = $(`#tuning-fields [name="${field.key}"]`);
    const value = Number(input.value);
    if (!Number.isInteger(value) || value < 0 || value > 9999 || input.value.trim() === '') {
      input.focus(); $('#tuning-message').textContent = 'Use whole numbers from 0 to 9,999.'; return;
    }
    next[field.key] = value;
  }
  costs = next;
  localStorage.setItem(COST_STORAGE_KEY, JSON.stringify(costs));
  syncCosts(); updateUI(); renderTree();
  $('#tuning-message').textContent = 'Saved in this browser. Unlock prices now use these values.';
}
function sprintBalance() { return Math.max(0, state.sprint.earned - state.sprint.spent); }
function sprintValue() { return 1 + ['eff1', 'eff2', 'eff3', 'eff4'].filter(id => state.sprint.unlocked.includes(id)).length; }
function updateTreeWallet() {
  $('#tree-balance').textContent = sprintBalance().toLocaleString();
  $('#tree-earned').textContent = state.sprint.earned.toLocaleString();
  $('#tree-spent').textContent = state.sprint.spent.toLocaleString();
  $('#game-value').textContent = '+' + sprintValue();
}
const TREE_LAYOUT = {
  root: [400, 235], eff1: [300, 235], eff2: [220, 190], eff3: [145, 145], eff4: [75, 100],
  ring: [500, 235], red: [610, 55], orange: [650, 100], yellow: [685, 145], green: [700, 235],
  blue: [685, 325], indigo: [650, 370], violet: [610, 415], disco: [760, 235], bonus: [400, 55]
};
const TREE_ICONS = { eff1: '+', eff2: '+', eff3: '+', eff4: '+', ring: '◉', red: '●', orange: '●', yellow: '●', green: '●', blue: '●', indigo: '●', violet: '●', disco: '✺', bonus: '✦' };
let selectedTreeNode = null;
let arenaMode = 'play';
let renderedTreeNodes = new Set();
function setArenaMode(mode) {
  if (mode === 'tree' && (!state.sprint.runs || gameInterval)) return;
  if (mode !== arenaMode) clearTreeSelection();
  arenaMode = mode;
  $('#sprint-play').hidden = mode !== 'play';
  $('#focus-tree').hidden = mode !== 'tree';
  $('#arena-tabs').hidden = state.sprint.runs === 0;
  $('#sprint-view-play').setAttribute('aria-pressed', String(mode === 'play'));
  $('#sprint-view-tree').setAttribute('aria-pressed', String(mode === 'tree'));
  $('#game-arena').classList.toggle('tree-mode', mode === 'tree');
  if (mode === 'tree') requestAnimationFrame(() => {
    centerTreeOnNode(selectedTreeNode || 'root');
    positionTreePopover();
  });
}
function centerTreeOnNode(id) {
  const scroller = $('.tree-scroll');
  const node = id === 'root' ? $('.tree-root') : $('#tree-body').querySelector(`[data-tree="${id}"]`);
  if (!node || !scroller.clientWidth) return;
  const map = scroller.getBoundingClientRect();
  const bounds = node.getBoundingClientRect();
  scroller.scrollLeft += bounds.left + bounds.width / 2 - map.left - map.width / 2;
  scroller.scrollTop += bounds.top + bounds.height / 2 - map.top - map.height / 2;
}
function positionTreePopover() {
  const popover = $('#node-popover');
  if (!selectedTreeNode || popover.hidden || $('#focus-tree').hidden) return;
  if (window.matchMedia('(max-width: 600px)').matches) {
    popover.style.left = '';
    popover.style.top = '';
    popover.classList.remove('popover-left');
    return;
  }
  const node = $('#tree-body').querySelector(`[data-tree="${selectedTreeNode}"]`);
  if (!node) return;
  const tree = $('#focus-tree').getBoundingClientRect();
  const bounds = node.getBoundingClientRect();
  const center = bounds.left + bounds.width / 2 - tree.left;
  const onLeft = center > tree.width / 2;
  const preferred = onLeft ? bounds.left - tree.left - popover.offsetWidth - 12 : bounds.right - tree.left + 12;
  popover.style.left = `${Math.max(8, Math.min(preferred, tree.width - popover.offsetWidth - 8))}px`;
  popover.style.top = `${Math.max(8, Math.min(bounds.top - tree.top - 35, tree.height - popover.offsetHeight - 8))}px`;
  popover.classList.toggle('popover-left', onLeft);
}
function treeNodeHTML(node) {
  const [x, y] = TREE_LAYOUT[node.id];
  const owned = state.sprint.unlocked.includes(node.id);
  const status = owned ? 'unlocked' : 'available';
  return `<button type="button" data-tree="${node.id}" class="tree-node ${status} ${node.branch} ${renderedTreeNodes.has(node.id) ? '' : 'revealed'}" style="left:${x}px;top:${y}px" aria-label="${node.label}, ${status}, ${costs[node.id]} Hit Points" aria-pressed="false" title="${node.label}"><span aria-hidden="true">${owned ? '✓' : TREE_ICONS[node.id]}</span></button>`;
}
function clearTreeSelection() {
  selectedTreeNode = null;
  $('#tree-body').querySelectorAll('[data-tree]').forEach(button => {
    button.classList.remove('selected');
    button.setAttribute('aria-pressed', 'false');
  });
  const popover = $('#node-popover');
  if (popover) { popover.hidden = true; popover.innerHTML = ''; }
}
function selectTreeNode(id) {
  const node = TREE_NODES.find(n => n.id === id);
  if (!node || !$('#tree-body').querySelector(`[data-tree="${id}"]`)) return;
  selectedTreeNode = id;
  $('#tree-body').querySelectorAll('[data-tree]').forEach(button => {
    const selected = button.dataset.tree === id;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const owned = state.sprint.unlocked.includes(id);
  const missing = node.needs.filter(key => !state.sprint.unlocked.includes(key));
  const affordable = sprintBalance() >= costs[id];
  const needs = missing.length ? `Requires ${missing.map(key => TREE_NODES.find(n => n.id === key).label).join(', ')}.` : '';
  const status = owned ? 'Unlocked and active in every run.' : missing.length ? needs : affordable ? 'Ready to unlock.' : `${costs[id] - sprintBalance()} more Hit Points needed.`;
  $('#node-popover').innerHTML = `<button class="node-popover-close" id="node-popover-close" type="button" aria-label="Close skill details">×</button><span class="node-popover-kicker">${node.branch.toUpperCase()} / ${costs[id]} HP</span><h4>${node.label}</h4><p>${node.detail}.</p><small>${status}</small>${owned ? '' : `<button type="button" data-tree-invest="${id}" ${missing.length || !affordable ? 'disabled' : ''}>Invest ${costs[id]} Hit Points <span>→</span></button>`}`;
  $('#node-popover').hidden = false;
  requestAnimationFrame(() => {
    if (window.matchMedia('(max-width: 600px)').matches) centerTreeOnNode(id);
    positionTreePopover();
  });
}
function renderTree() {
  const owned = state.sprint.unlocked;
  $('#arena-tabs').hidden = state.sprint.runs === 0;
  if (state.sprint.runs === 0) { renderedTreeNodes.clear(); setArenaMode('play'); return; }
  const visible = TREE_NODES.filter(node => owned.includes(node.id) || node.needs.every(required => owned.includes(required)));
  const edges = visible.flatMap(node => (node.needs.length ? node.needs : ['root']).map(parent => {
    const [x1, y1] = TREE_LAYOUT[parent];
    const [x2, y2] = TREE_LAYOUT[node.id];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="active"/>`;
  })).join('');
  $('#tree-body').innerHTML = `<svg class="tree-links" viewBox="0 0 800 470" aria-hidden="true">${edges}</svg><span class="tree-map-label efficiency-label">EFFICIENCY</span><span class="tree-map-label cosmetic-label">COSMETIC</span><div class="tree-root" style="left:400px;top:235px" aria-label="Focus Sprint starting node">✦</div>${visible.map(treeNodeHTML).join('')}`;
  renderedTreeNodes = new Set(visible.map(node => node.id));
  updateTreeWallet();
  if (selectedTreeNode && visible.some(node => node.id === selectedTreeNode)) selectTreeNode(selectedTreeNode);
  else clearTreeSelection();
  setArenaMode(arenaMode);
}
function investNode(id) {
  const node = TREE_NODES.find(n => n.id === id);
  if (!node || state.sprint.unlocked.includes(id)) return;
  const missing = node.needs.filter(required => !state.sprint.unlocked.includes(required));
  if (missing.length) { $('#tree-message').textContent = `Unlock ${missing.map(key => TREE_NODES.find(n => n.id === key).label).join(', ')} first.`; return; }
  if (sprintBalance() < costs[id]) { $('#tree-message').textContent = `Need ${costs[id] - sprintBalance()} more Hit Points for ${node.label}.`; return; }
  state.sprint.spent += costs[id];
  state.sprint.unlocked.push(id);
  save(); renderTree(); selectTreeNode(id);
  $('#tree-message').textContent = `${node.label} unlocked! ${node.detail}.`;
  if (id === 'disco' || id === 'bonus' || id === 'eff4') celebrate(`${node.label.toUpperCase()} UNLOCKED`, '✦');
}
function markVisited(id) {
  if (id === 'home' || state.visited.includes(id)) return false;
  state.visited.push(id);
  save(); updateUI();
  if (state.visited.length === 4) { celebrateJourney(); return true; }
  return false;
}
function updateAvatar() {
  const avatar = $('#desk-avatar');
  const playing = state.active === 'arcade';
  avatar.classList.toggle('playing', playing);
  avatar.setAttribute('aria-label', playing ? 'Pixel avatar playing with a controller' : 'Pixel avatar typing at a computer');
  $('#avatar-activity').textContent = playing ? 'PLAY MODE' : 'DESK MODE';
  $('#avatar-line').textContent = playing ? 'One more round?' : 'One curious click at a time.';
}
function recordClickFrenzy() {
  const now = performance.now();
  recentClicks = recentClicks.filter(time => now - time < 1800);
  recentClicks.push(now);
  const furious = recentClicks.length >= 5;
  $('#desk-avatar').classList.toggle('furious', furious);
  $('#avatar-speed').textContent = furious ? 'TURBO' : 'STEADY';
  clearTimeout(avatarCoolTimer);
  avatarCoolTimer = setTimeout(() => { recentClicks = []; $('#desk-avatar').classList.remove('furious'); $('#avatar-speed').textContent = 'STEADY'; }, 1800);
}
function pulseSprint() {
  if (!state.sprint.unlocked.includes('ring')) return;
  const ring = document.createElement('span');
  ring.className = 'sprint-pulse' + (state.sprint.unlocked.includes('disco') ? ' disco' : '');
  ring.style.setProperty('--pulse-scale', Math.min(2.7, 1.05 + state.sprint.totalHits * .025).toFixed(2));
  const colors = RAINBOW.filter(id => state.sprint.unlocked.includes(id)).map((id, i) => `0 0 ${10 + i * 4}px ${4 + i * 2}px ${RAINBOW_HEX[id]}99`);
  if (colors.length) ring.style.boxShadow = colors.join(',');
  $('#game-target').append(ring);
  ring.addEventListener('animationend', () => ring.remove(), { once: true });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(() => ring.remove(), 100);
}
function clearBonus() {
  clearTimeout(bonusSpawnTimer); clearTimeout(bonusFadeTimer);
  $('#game-bonus').hidden = true;
}
function scheduleBonus() {
  if (!gameInterval || !state.sprint.unlocked.includes('bonus')) return;
  bonusSpawnTimer = setTimeout(() => {
    if (!gameInterval || performance.now() >= gameEnds) return;
    const button = $('#game-bonus');
    button.style.left = `${18 + Math.random() * 64}%`;
    button.style.top = `${73 + Math.random() * 95}px`;
    button.hidden = false;
    bonusFadeTimer = setTimeout(() => { button.hidden = true; scheduleBonus(); }, 2000);
  }, 1400 + Math.random() * 1300);
}
function claimBonus() {
  if (!gameInterval || $('#game-bonus').hidden || performance.now() >= gameEnds) return;
  clearTimeout(bonusFadeTimer);
  $('#game-bonus').hidden = true;
  state.sprint.earned += 10;
  runHitPoints += 10;
  save(); addPoints(9);
  updateTreeWallet();
  toast('Quick bonus caught · +10 Hit Points and Points!');
  scheduleBonus();
}
function updateUI() {
  $('#points').textContent = Math.floor(state.points).toLocaleString();
  $('#wallet-points').textContent = Math.floor(state.points).toLocaleString();
  $('#recruiter-toggle').setAttribute('aria-checked', String(state.recruiter));
  $('#title-recruiter-toggle').setAttribute('aria-checked', String(state.recruiter));
  const count = AREA_META.filter(a => canAccess(a.id)).length;
  $('#unlock-count').textContent = `${count} of ${AREA_META.length} areas open`;
  $('#progress-fill').style.width = `${count / AREA_META.length * 100}%`;
  const next = AREA_META.find(a => !canAccess(a.id));
  $('#next-unlock').textContent = next ? `Next: ${next.label} · ${next.cost} pts` : 'All areas open ✦';
  $('#journey-percent').textContent = `${state.visited.length * 25}%`;
  $('#journey-fill').style.width = `${state.visited.length * 25}%`;
  $('#journey-detail').textContent = state.visited.length === 4 ? '✦ All four areas discovered' : `${state.visited.length} of 4 areas visited`;
  $('.journey-track').setAttribute('aria-valuenow', String(state.visited.length * 25));
  $('#journey-meter').classList.toggle('complete', state.visited.length === 4);
  renderNav(); renderProjects(); updateAvatar(); updateTreeWallet();
  if (!gameInterval) {
    $('#game-start').innerHTML = `${lastGameResult === null ? 'Start sprint' : 'Play again'} <span>→</span>`;
    $('#game-message').textContent = lastGameResult === null ? 'Ready when you are.' : `${lastGameResult.hits} ${lastGameResult.hits === 1 ? 'hit' : 'hits'} · +${lastGameResult.earned} Hit Points earned this run.`;
  }
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === state.active));
}
function discover(id) {
  const completed = markVisited(id);
  if (id === 'home' || state.discovered.includes(id)) return;
  state.discovered.push(id); addPoints(5, completed ? undefined : 'New area discovered · +5 points');
  if (!completed) celebrate('AREA DISCOVERED', '✦');
}
function go(id) {
  const area = AREA_META.find(a => a.id === id);
  if (!area) return;
  if (!canAccess(id)) {
    if (state.points < area.cost) { flashLocked(id); toast('Not enough points! Keep clicking around!', 'error'); return; }
    state.points -= area.cost;
    state.unlocked.push(id);
    toast(`${area.label} unlocked · −${area.cost} points`);
    celebrate('NEW AREA UNLOCKED', '↗');
  }
  state.active = id; save(); updateUI(); discover(id);
  if (id === 'home') revealHomeVisual();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $('#main-content').focus({ preventScroll: true });
}
function toggleRecruiter(forceOn = false, announce = true) {
  state.recruiter = forceOn ? true : !state.recruiter;
  if (!state.recruiter && !canAccess(state.active)) state.active = 'home';
  save(); updateUI();
  if (announce) toast(state.recruiter ? 'Recruiter view: everything is open' : 'Game view restored');
}
function openProject(id) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;
  if (!state.recruiter && !state.projects.includes(id)) {
    if (state.points < p.cost) { toast(`${p.title} needs ${p.cost} points · ${p.cost-state.points} to go`); return; }
    state.points -= p.cost; state.projects.push(id);
  }
  if (!state.discovered.includes(`project:${id}`)) {
    state.discovered.push(`project:${id}`); state.points += 7; toast('Case study discovered · +7 points'); celebrate('CASE STUDY FOUND', '◇');
  }
  state.expanded = state.expanded.includes(id) ? state.expanded.filter(x => x !== id) : [...state.expanded, id];
  save(); updateUI();
}
function scrollArenaIntoView(behavior) {
  const arena = $('#game-arena');
  const topbarHeight = $('.topbar').getBoundingClientRect().height;
  const navHeight = window.innerWidth <= 760 ? $('.sidebar').getBoundingClientRect().height : 0;
  const top = window.scrollY + arena.getBoundingClientRect().top - topbarHeight - navHeight - 12;
  window.scrollTo({ top: Math.max(0, top), behavior });
}
function finishGame() {
  if (!gameInterval) return;
  clearInterval(gameInterval); gameInterval = null;
  clearBonus();
  state.sprint.runs++;
  lastGameResult = { hits, earned: runHitPoints };
  save();
  $('#game-target').disabled = true;
  $('#game-start').disabled = false;
  $('#game-start').innerHTML = 'Play again <span>→</span>';
  $('#game-time').textContent = '0.0s';
  $('#game-message').textContent = `${hits} ${hits === 1 ? 'hit' : 'hits'} · +${runHitPoints} Hit Points earned this run.`;
  renderTree();
  setArenaMode('tree');
  scrollArenaIntoView('smooth');
  if (hits > bestSprint) { bestSprint = hits; celebrate('FOCUS SPRINT BEST', '✦'); }
}
function startGame() {
  if (gameInterval) return;
  setArenaMode('play');
  scrollArenaIntoView('instant');
  clearBonus();
  hits = 0; runHitPoints = 0; lastGameResult = null; gameEnds = performance.now() + 10000;
  $('#game-hits').textContent = '0'; $('#game-time').textContent = '10.0s';
  $('#game-message').textContent = 'Go! Every hit counts.';
  $('#game-target').disabled = false; $('#game-start').disabled = true;
  $('#game-target').focus({ preventScroll: true });
  gameInterval = setInterval(() => {
    const remaining = Math.max(0, (gameEnds - performance.now()) / 1000);
    $('#game-time').textContent = `${remaining.toFixed(1)}s`;
    if (remaining <= 0) finishGame();
  }, 60);
  scheduleBonus();
}
function hitGameTarget() {
  if (!gameInterval || performance.now() >= gameEnds) return;
  hits++;
  const value = sprintValue();
  runHitPoints += value;
  state.sprint.earned += value;
  state.sprint.totalHits++;
  $('#game-hits').textContent = hits;
  $('#game-message').textContent = `${hits} ${hits === 1 ? 'hit' : 'hits'} · +${runHitPoints} Hit Points this run.`;
  save();
  if (value > 1) addPoints(value - 1);
  updateTreeWallet();
  pulseSprint();
}
function beginExperience() {
  if ($('#title-screen').classList.contains('leaving')) return;
  state.active = TUNING_MODE ? 'arcade' : state.recruiter ? 'projects' : 'home';
  save(); updateUI();
  $('#title-screen').classList.add('leaving');
  const transition = $('#start-transition');
  transition.hidden = false;
  transition.classList.add('playing');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    $('#title-screen').hidden = true;
    $('.app-shell').inert = false;
    document.body.classList.remove('title-active');
    window.scrollTo(0, 0);
    if (state.recruiter) discover('projects');
    if (TUNING_MODE) { discover('arcade'); renderTuningFields(); $('#tuning-dialog').showModal(); }
    if (state.active === 'home') revealHomeVisual();
  }, reduced ? 0 : 900);
  setTimeout(() => {
    transition.hidden = true;
    transition.classList.remove('playing');
    $('#main-content').focus({ preventScroll: true });
  }, reduced ? 10 : 2000);
}
document.addEventListener('click', event => {
  addPoints(1);
  animateClickPoint();
  animateClickRipple(event);
  recordClickFrenzy();
}, true);
document.addEventListener('click', event => {
  if (event.target.closest('#journey-celebration-close')) { dismissJourneyCelebration(); return; }
  const resumeFilter = event.target.closest('[data-resume-view]');
  if (resumeFilter) { setResumeView(resumeFilter.dataset.resumeView); return; }
  if (event.target.closest('#title-recruiter-toggle')) { toggleRecruiter(false, false); return; }
  if (event.target.closest('#title-start')) { beginExperience(); return; }
  if (event.target.closest('#points-open')) { $('#points-dialog').showModal(); $('#points-close').focus(); return; }
  if (event.target.closest('#points-close')) { $('#points-dialog').close(); return; }
  if (event.target.closest('#tuning-open, #tree-tune')) { renderTuningFields(); $('#tuning-message').textContent = ''; $('#tuning-dialog').showModal(); return; }
  if (event.target.closest('#tuning-close')) { $('#tuning-dialog').close(); return; }
  if (event.target.closest('#tuning-save')) { saveTuning(); return; }
  if (event.target.closest('#tuning-reset')) { costs = { ...COST_DEFAULTS }; localStorage.removeItem(COST_STORAGE_KEY); syncCosts(); renderTuningFields(); updateUI(); renderTree(); $('#tuning-message').textContent = 'Published defaults restored in this browser.'; return; }
  const support = event.target.closest('[data-support]');
  if (support) { $('#wallet-notice').textContent = 'Design preview only — no payment was made and no purchase points were granted.'; return; }
  if (event.target.closest('#motivation-button')) {
    const stage = $('#motivation-stage');
    stage.textContent = '';
    const pop = document.createElement('span');
    pop.className = 'motivation-pop';
    pop.textContent = MOTIVATION[motivationIndex++ % MOTIVATION.length];
    stage.append(pop);
    pop.addEventListener('animationend', () => pop.remove(), { once: true });
    return;
  }
  const nav = event.target.closest('[data-go]');
  if (nav) { go(nav.dataset.go); return; }
  const project = event.target.closest('[data-project]');
  if (project) { openProject(project.dataset.project); return; }
  const gallery = event.target.closest('[data-gallery]');
  if (gallery && !state.discovered.includes(`gallery:${gallery.dataset.gallery}`)) {
    state.discovered.push(`gallery:${gallery.dataset.gallery}`);
    addPoints(3, 'Game discovered · +3 points');
    celebrate('GAME DISCOVERED', '✦');
    return;
  }
  if (event.target.closest('#recruiter-toggle')) { toggleRecruiter(); return; }
  if (event.target.closest('#hero-recruiter')) { toggleRecruiter(true); go('projects'); return; }
  const investButton = event.target.closest('[data-tree-invest]');
  if (investButton) { investNode(investButton.dataset.treeInvest); return; }
  if (event.target.closest('#node-popover-close')) { clearTreeSelection(); return; }
  const treeNode = event.target.closest('[data-tree]');
  if (treeNode) {
    if (selectedTreeNode === treeNode.dataset.tree) clearTreeSelection();
    else selectTreeNode(treeNode.dataset.tree);
    return;
  }
  if (event.target.closest('#node-popover')) return;
  if (event.target.closest('#sprint-view-play')) { setArenaMode('play'); return; }
  if (event.target.closest('#sprint-view-tree')) { setArenaMode('tree'); return; }
  if (event.target.closest('#game-start')) { startGame(); return; }
  if (event.target.closest('#game-bonus')) { claimBonus(); return; }
  if (event.target.closest('#game-target')) { hitGameTarget(); return; }
  if (event.target.closest('#reset-button')) {
    if (gameInterval) finishGame();
    clearBonus();
    lastGameResult = null;
    state = { ...initial, unlocked: [...initial.unlocked], discovered: [], visited: [], projects: [], expanded: [], sprint: { ...initial.sprint, unlocked: [] } };
    dismissJourneyCelebration(); $('#journey-announcement').textContent = '';
    clearTreeSelection(); save(); updateUI(); renderExperience(); renderTree(); window.scrollTo({ top: 0, behavior: 'smooth' }); toast('Progress reset');
    return;
  }
  if (selectedTreeNode) clearTreeSelection();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (selectedTreeNode) clearTreeSelection();
    dismissJourneyCelebration();
  }
});
$('.tree-scroll').addEventListener('scroll', () => {
  if (selectedTreeNode) requestAnimationFrame(positionTreePopover);
}, { passive: true });
window.addEventListener('resize', () => {
  if (arenaMode === 'tree') requestAnimationFrame(() => {
    centerTreeOnNode(selectedTreeNode || 'root');
    positionTreePopover();
  });
});
$('#points-dialog').addEventListener('click', event => {
  if (event.target !== $('#points-dialog')) return;
  const bounds = event.target.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.target.close();
});
let visibleSeconds = 0;
setInterval(() => {
  if (document.visibilityState !== 'visible') return;
  visibleSeconds++;
  if (visibleSeconds >= 5) { visibleSeconds = 0; addPoints(1); }
}, 1000);
renderExperience();
renderGameGallery();
syncCosts();
updateUI();
renderTree();
const heroObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!$('#title-screen').hidden || state.active !== 'home') return;
    if (entry.isIntersecting && !$('.hero-visual').classList.contains('is-visible')) revealHomeVisual();
    if (!entry.isIntersecting) $('.hero-visual').classList.remove('is-visible');
  });
}, { threshold: .25 });
heroObserver.observe($('.hero-visual'));
const journeyObserver = new IntersectionObserver(entries => {
  $('#journey-meter').classList.toggle('in-view', entries[0].isIntersecting);
}, { threshold: .45 });
journeyObserver.observe($('#journey-meter'));
const syncHeaderHeight = () => document.documentElement.style.setProperty('--topbar-height', `${Math.ceil($('.topbar').getBoundingClientRect().height)}px`);
syncHeaderHeight();
new ResizeObserver(syncHeaderHeight).observe($('.topbar'));
$('#title-start').focus();
