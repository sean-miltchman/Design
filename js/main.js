// ===== NUTRIPATH — MAIN APP LOGIC =====

// ─── Global state ────────────────────────────────────────
let user, foods, plan, game;
let activeTab     = 'home';
let activeMeal    = 'breakfast';
let selectedFood  = null;
let editingLogId  = null;

const MEAL_META = {
  breakfast: { label: 'Breakfast', icon: '🌅', cals: 0.25 },
  lunch:     { label: 'Lunch',     icon: '☀️',  cals: 0.35 },
  dinner:    { label: 'Dinner',    icon: '🌙',  cals: 0.30 },
  snack:     { label: 'Snack',     icon: '🍎',  cals: 0.10 },
};

const ALL_BADGES = [
  { id: 'first_step',    emoji: '🌱', name: 'First Step',     desc: 'Completed setup'            },
  { id: 'rookie_logger', emoji: '📝', name: 'Rookie Logger',  desc: 'Logged your first meal'     },
  { id: 'on_a_roll',     emoji: '🔥', name: 'On a Roll',      desc: '3-day logging streak'       },
  { id: 'week_warrior',  emoji: '⚔️',  name: 'Week Warrior',  desc: '7-day logging streak'       },
  { id: 'protein_king',  emoji: '👑', name: 'Protein King',   desc: 'Hit protein goal 3x'        },
  { id: 'cal_crusher',   emoji: '💪', name: 'Calorie Crusher',desc: 'Hit calorie goal 5x'        },
  { id: 'explorer',      emoji: '🗺️', name: 'Food Explorer',  desc: 'Tried 10 different foods'   },
  { id: 'clean_eater',   emoji: '🥗', name: 'Clean Eater',    desc: 'Logged 3 vegan meals'       },
  { id: 'cheat_day',     emoji: '🍕', name: 'Cheat Day',      desc: 'Earned a 7-day reward'      },
];

// ─── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  user  = DB.getUser();
  if (!user) { window.location.href = 'index.html'; return; }

  foods = DB.getFoods();
  plan  = DB.getPlan();
  game  = DB.getGame();

  updateStreak();
  switchTab('home');
  renderSearch(''); // prime food list
});

// ─── Tab switching ───────────────────────────────────────
function switchTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  if (tabName === 'home')  renderHome();
  if (tabName === 'log')   renderLog();
  if (tabName === 'plan')  renderPlan();
  if (tabName === 'stats') renderStats();
}

// ─── HOME TAB ────────────────────────────────────────────
function renderHome() {
  user = DB.getUser();
  game = DB.getGame();
  const todayLogs = DB.getTodayLogs();
  const summary   = getDailySummary(todayLogs);
  const targets   = user.targets;

  // Greeting
  const hour    = new Date().getHours();
  const emoji   = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  document.getElementById('homeGreeting').innerHTML =
    `<h2>${emoji} Hey, ${user.name}!</h2><p>${dateStr}</p>`;

  // Pills
  const level = Math.floor(game.xp / 200) + 1;
  document.getElementById('streakPill').textContent = `🔥 ${game.streak} day${game.streak !== 1 ? 's' : ''}`;
  document.getElementById('levelPill').textContent  = `⚡ Lv.${level}`;

  // Calorie hero
  const remaining = Math.max(0, targets.calories - summary.cals);
  const calPct    = Math.min(100, Math.round((summary.cals / targets.calories) * 100));
  document.getElementById('calRemaining').textContent = remaining.toLocaleString();
  document.getElementById('calEaten').textContent     = summary.cals.toLocaleString();
  document.getElementById('calTarget').textContent    = targets.calories.toLocaleString();
  const fill = document.getElementById('calWideFill');
  fill.style.width      = calPct + '%';
  fill.style.background = calPct >= 100
    ? '#FF6B6B'
    : `linear-gradient(90deg, #E8635A ${calPct}%, #FFD166)`;

  // Macro bars
  [
    { id: 'pro',  eaten: Math.round(summary.pro),  target: targets.protein, color: '#E8635A' },
    { id: 'carb', eaten: Math.round(summary.carb), target: targets.carbs,   color: '#6C9FD6' },
    { id: 'fat',  eaten: Math.round(summary.fat),  target: targets.fat,     color: '#FFD166' },
  ].forEach(m => {
    const pct = m.target > 0 ? Math.min(100, Math.round((m.eaten / m.target) * 100)) : 0;
    document.getElementById(`${m.id}Fill`).style.width      = pct + '%';
    document.getElementById(`${m.id}Fill`).style.background = m.color;
    document.getElementById(`${m.id}Nums`).textContent      = `${m.eaten}/${m.target}g`;
  });

  // Desktop meal cards (4 columns)
  ['breakfast','lunch','dinner','snack'].forEach(meal => {
    const mealLogs   = todayLogs.filter(e => e.meal === meal);
    const mealCals   = mealLogs.reduce((s, e) => s + (e.cals || 0), 0);
    const meta       = MEAL_META[meal];
    const mealTarget = Math.round(targets.calories * meta.cals);
    const pct        = mealTarget > 0 ? Math.min(100, Math.round((mealCals / mealTarget) * 100)) : 0;
    const hasFood    = mealLogs.length > 0;
    const barColor   = hasFood ? 'var(--teal)' : 'var(--violet)';

    const foodRows = mealLogs.length > 0
      ? mealLogs.map(e => `
          <div class="meal-food-entry">
            <span class="meal-food-name-txt">${e.emoji || ''} ${e.name}</span>
            <span class="meal-food-right">
              <span>${e.cals} cal</span>
              <button class="btn-del" onclick="deleteLog('${e.id}')">✕</button>
            </span>
          </div>`).join('')
      : `<div class="empty-meal-txt">Nothing logged yet</div>`;

    document.getElementById(`meal-${meal}`).innerHTML = `
      <div class="meal-card-wrap">
        <div class="meal-card-header">
          <span class="meal-card-title">${meta.icon} ${meta.label}</span>
          <span class="meal-card-cals">${mealCals}/${mealTarget}</span>
        </div>
        <div class="meal-card-bar-track">
          <div class="meal-card-bar-fill" style="width:${pct}%;background:${barColor}"></div>
        </div>
        ${foodRows}
        <button class="meal-add-btn" onclick="goToLog('${meal}')">+ Add food</button>
      </div>`;
  });

  // Update sidebar user info
  const sn = document.getElementById('sidebarName');
  const sl = document.getElementById('sidebarLevel');
  if (sn) sn.textContent = user.name;
  if (sl) sl.textContent = `⚡ Level ${Math.floor(game.xp / 200) + 1}  ·  ${game.xp} XP`;
}

function toggleMealExpand(meal) {
  const el = document.getElementById(`expand-${meal}`);
  if (el) el.classList.toggle('open');
}

function renderRing(svgId, pct, color, size) {
  const r   = (size / 2) - 8;
  const c   = 2 * Math.PI * r;
  const off = c - (pct * c);
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.innerHTML = `
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#F0F0F0" stroke-width="10"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}"
            stroke-width="10" stroke-linecap="round"
            stroke-dasharray="${c}" stroke-dashoffset="${off}"
            style="transition: stroke-dashoffset 0.6s ease"/>`;
}

function renderMacroRing(svgId, current, target, color) {
  const pct = target > 0 ? Math.min(1, current / target) : 0;
  renderRing(svgId, pct, color, 60);
  const pctEl = document.getElementById(svgId + 'Pct');
  if (pctEl) pctEl.textContent = Math.round(pct * 100) + '%';
}

function goToLog(meal) {
  activeMeal = meal;
  switchTab('log');
  // Highlight the correct meal type button
  document.querySelectorAll('.meal-type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.meal === meal);
  });
}

// ─── LOG TAB ─────────────────────────────────────────────
function renderLog() {
  document.querySelectorAll('.meal-type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.meal === activeMeal);
  });
  renderSearch(document.getElementById('foodSearch')?.value || '');
  renderLogSidebar();
}

function renderLogSidebar() {
  const todayLogs = DB.getTodayLogs();
  const summary   = getDailySummary(todayLogs);
  const targets   = (DB.getUser() || {}).targets || {};

  const calPct = targets.calories > 0 ? Math.min(100, Math.round((summary.cals / targets.calories) * 100)) : 0;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setW = (id, w) => { const el = document.getElementById(id); if (el) el.style.width = w + '%'; };

  set('logCalEaten', summary.cals.toLocaleString());
  set('logCalTarget', (targets.calories || '—').toLocaleString?.() || targets.calories);
  setW('logBarFill', calPct);

  [['Pro', summary.pro, targets.protein], ['Carb', summary.carb, targets.carbs], ['Fat', summary.fat, targets.fat]]
    .forEach(([key, eaten, target]) => {
      const pct = target > 0 ? Math.min(100, Math.round((eaten / target) * 100)) : 0;
      setW(`log${key}Fill`, pct);
      set(`log${key}Nums`, `${Math.round(eaten)}g`);
    });

  const listEl = document.getElementById('logTodayList');
  if (listEl) {
    listEl.innerHTML = todayLogs.length === 0
      ? `<span style="font-size:12px;color:var(--muted2)">Nothing logged yet</span>`
      : todayLogs.map(e => `
          <div class="ltf-entry">
            <span class="ltf-name">${e.emoji || ''} ${e.name}</span>
            <span class="ltf-cal">${e.cals} cal</span>
          </div>`).join('');
  }
}

function selectMeal(meal) {
  activeMeal = meal;
  document.querySelectorAll('.meal-type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.meal === meal);
  });
}

function renderSearch(query) {
  foods = DB.getFoods();
  const q = query.toLowerCase().trim();
  const filtered = q
    ? foods.filter(f => f.name.toLowerCase().includes(q))
    : foods;

  const container = document.getElementById('foodListContainer');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--muted);font-weight:700;">No foods found 😅</div>`;
    return;
  }

  container.innerHTML = filtered.map(f => {
    const tags = [
      f.vegan ? `<span class="ftag vegan">Vegan</span>` : '',
      f.nuts  ? `<span class="ftag nuts">Contains Nuts</span>` : '',
    ].join('');
    return `
      <div class="food-item" onclick="openFoodModal(${f.id})">
        <span class="fi">${f.emoji}</span>
        <div class="food-info">
          <div class="fn">${f.name}</div>
          <div class="fm">${f.pro}g pro · ${f.carb}g carb · ${f.fat}g fat per 100g</div>
          <div class="food-tags">${tags}</div>
        </div>
        <span class="fc">${f.cal} cal</span>
      </div>`;
  }).join('');
}

// ─── FOOD MODAL ──────────────────────────────────────────
function openFoodModal(foodId) {
  selectedFood   = foods.find(f => f.id === foodId);
  editingLogId   = null;
  if (!selectedFood) return;

  document.getElementById('sheetFoodEmoji').textContent = selectedFood.emoji;
  document.getElementById('sheetFoodName').textContent  = selectedFood.name;
  document.getElementById('sheetFoodCal').textContent   = `${selectedFood.cal} cal per 100g`;
  document.getElementById('confirmBtn').textContent = `Log to ${MEAL_META[activeMeal].label} ${MEAL_META[activeMeal].icon}`;

  const slider = document.getElementById('amountSlider');
  slider.value = 100;
  updateAmountPreview(100);
  document.getElementById('overlay').classList.add('open');
}

function updateAmountPreview(grams) {
  const m = macrosForAmount(selectedFood, parseInt(grams));
  document.getElementById('amountDisplay').innerHTML = `${grams}<span>g</span>`;
  document.getElementById('prevCals').textContent  = m.cals;
  document.getElementById('prevPro').textContent   = m.pro + 'g';
  document.getElementById('prevCarb').textContent  = m.carb + 'g';
  document.getElementById('prevFat').textContent   = m.fat + 'g';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  selectedFood = null;
  editingLogId = null;
}

function confirmLog() {
  if (!selectedFood) return;
  const grams = parseInt(document.getElementById('amountSlider').value);
  const m     = macrosForAmount(selectedFood, grams);

  if (editingLogId) {
    // UPDATE: editing an existing entry
    DB.updateLogAmount(editingLogId, grams, m.cals, m.pro, m.carb, m.fat);
    showToast(`Updated ${selectedFood.name}!`);
  } else {
    // CREATE: new log entry
    DB.addLog({
      name:   selectedFood.name,
      emoji:  selectedFood.emoji,
      foodId: selectedFood.id,
      meal:   activeMeal,
      amount: grams,
      cals:   m.cals,
      pro:    m.pro,
      carb:   m.carb,
      fat:    m.fat,
    });
    awardXP(10, `+10 XP for logging ${selectedFood.name}!`);
    checkBadges();
    checkDailyGoal();
  }

  closeModal();

  if (activeTab === 'home') renderHome();
  else if (activeTab === 'log') renderLog();
}

// ─── DELETE LOG ──────────────────────────────────────────
function deleteLog(entryId) {
  DB.deleteLog(entryId);
  renderHome();
  showToast('Food removed from log.');
}

// ─── CUSTOM FOOD ─────────────────────────────────────────
function toggleCustomForm() {
  const form = document.getElementById('customForm');
  form.classList.toggle('open');
}

function saveCustomFood() {
  const name  = document.getElementById('cName').value.trim();
  const emoji = document.getElementById('cEmoji').value.trim() || '🍽️';
  const cal   = parseFloat(document.getElementById('cCal').value);
  const pro   = parseFloat(document.getElementById('cPro').value);
  const carb  = parseFloat(document.getElementById('cCarb').value);
  const fat   = parseFloat(document.getElementById('cFat').value);
  const vegan = document.getElementById('cVegan').checked;
  const nuts  = document.getElementById('cNuts').checked;

  if (!name || isNaN(cal)) { showToast('Fill in at least a name and calories! 🙏'); return; }

  const food = DB.addFood({ name, emoji, cal: cal || 0, pro: pro || 0, carb: carb || 0, fat: fat || 0, vegan, nuts });
  foods = DB.getFoods();
  showToast(`"${name}" added to your food list! ✅`);

  // Clear form
  ['cName','cEmoji','cCal','cPro','cCarb','cFat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('customForm').classList.remove('open');
  renderSearch('');
}

// ─── PLAN TAB ────────────────────────────────────────────
function renderPlan() {
  user = DB.getUser();
  plan = DB.getPlan();
  const targets      = user.targets;
  const dayOfWeek    = new Date().getDay();
  const todayPlanIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0 … Sun=6

  // Macro strip
  document.getElementById('planCals').textContent    = targets.calories.toLocaleString();
  document.getElementById('planPro').textContent     = targets.protein + 'g';
  document.getElementById('planCarbs').textContent   = targets.carbs + 'g';
  document.getElementById('planFat').textContent     = targets.fat + 'g';
  document.getElementById('planGoalBadge').textContent =
    user.goal === 'bulk' ? '💪 Bulk' : '🔥 Cut';

  // TODAY featured card
  const todayPlan = plan[todayPlanIdx] || plan[0];
  document.getElementById('planTodayDay').textContent =
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  document.getElementById('planTodayMeals').innerHTML =
    ['breakfast','lunch','dinner','snack'].map(meal => {
      const items    = todayPlan[meal] || [];
      const mealCals = items.reduce((s, i) => s + (i.cals || 0), 0);
      const foodItems = items.length
        ? items.map(i => `<div class="ptm-food-item">${i.emoji} ${i.name} <span class="ptm-food-amt">(${i.amount}g)</span></div>`).join('')
        : '<div class="ptm-food-item" style="opacity:0.35">Nothing planned</div>';
      return `
        <div class="ptm-meal-block">
          <div class="ptm-meal-hdr">
            <span class="ptm-meal-icon">${MEAL_META[meal].icon}</span>
            <span class="ptm-meal-name">${MEAL_META[meal].label}</span>
            <span class="ptm-meal-cals">${mealCals} cal</span>
          </div>
          <div class="ptm-food-list">${foodItems}</div>
        </div>`;
    }).join('');

  // Rest of the week (skip today)
  const container = document.getElementById('planDays');
  container.innerHTML = plan
    .map((dayPlan, idx) => ({ dayPlan, idx }))
    .filter(({ idx }) => idx !== todayPlanIdx)
    .map(({ dayPlan, idx }) => {
      const totalCals = calcPlanDayCals(dayPlan);
      // Preview: first item from lunch + dinner
      const lunchItem  = (dayPlan.lunch  || [])[0];
      const dinnerItem = (dayPlan.dinner || [])[0];
      const preview = [lunchItem, dinnerItem]
        .filter(Boolean)
        .map(i => `${i.emoji} ${i.name}`)
        .join(' · ');

      const expandedMeals = ['breakfast','lunch','dinner','snack'].map(meal => {
        const items   = dayPlan[meal] || [];
        const cals    = items.reduce((s, i) => s + (i.cals || 0), 0);
        const foodStr = items.map(i => `${i.emoji} ${i.name}`).join(' · ') || '—';
        return `
          <div class="pwe-meal-row">
            <span class="pwe-icon">${MEAL_META[meal].icon}</span>
            <span class="pwe-name">${MEAL_META[meal].label}</span>
            <span class="pwe-foods">${foodStr}</span>
            <span class="pwe-cals">${cals}</span>
          </div>`;
      }).join('');

      return `
        <div class="plan-week-row" onclick="toggleDay(${idx})">
          <span class="pwr-day">${dayPlan.dayName.slice(0,3)}</span>
          <span class="pwr-preview">${preview}</span>
          <span class="pwr-cals">${totalCals.toLocaleString()} cal</span>
          <span class="pwr-arrow" id="pwarrow${idx}">›</span>
        </div>
        <div class="plan-week-expand" id="dayBody${idx}">${expandedMeals}</div>`;
    }).join('');
}

function calcPlanDayCals(dayPlan) {
  return ['breakfast','lunch','dinner','snack'].reduce((total, m) =>
    total + (dayPlan[m] || []).reduce((s, i) => s + (i.cals || 0), 0), 0);
}

function toggleDay(idx) {
  const body   = document.getElementById(`dayBody${idx}`);
  const arrow  = document.getElementById(`pwarrow${idx}`);
  if (!body) return;
  const open = body.classList.toggle('open');
  if (arrow) arrow.textContent = open ? '⌄' : '›';
}

function surpriseMe() {
  if (!confirm("🎲 Swap today's meals for something new?")) return;
  foods = DB.getFoods();
  const dayOfWeek    = new Date().getDay();
  const todayPlanIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Regenerate today with a shuffled seed
  const seed    = Math.floor(Math.random() * 100) + 10;
  const targets = user.targets;
  const available = foods.filter(f => {
    if (user.restrictions.vegan        && !f.vegan) return false;
    if (user.restrictions.peanutAllergy && f.nuts) return false;
    return true;
  });

  const proteins = available.filter(f => f.pro >= 10);
  const carbSrc  = available.filter(f => f.carb >= 15 && f.cal < 450);
  const veggies  = available.filter(f => f.cal < 60);
  const fruits   = available.filter(f => f.carb >= 8 && f.cal < 110);
  const extras   = available.filter(f => f.cal < 200);

  plan[todayPlanIdx].breakfast = buildMeal(targets.calories * 0.25, proteins, carbSrc, fruits,  seed,     0);
  plan[todayPlanIdx].lunch     = buildMeal(targets.calories * 0.35, proteins, carbSrc, veggies, seed + 1, 1);
  plan[todayPlanIdx].dinner    = buildMeal(targets.calories * 0.30, proteins, veggies, carbSrc, seed + 2, 2);
  plan[todayPlanIdx].snack     = buildSnack(targets.calories * 0.10, fruits, extras, seed + 3);

  DB.setPlan(plan);
  renderPlan();
  showToast("✨ Today's meals have been refreshed!");
}

// ─── EDIT PROFILE ────────────────────────────────────────
function openEditProfile() {
  user = DB.getUser();
  document.getElementById('editWeight').value      = user.weight;
  document.getElementById('editTarget').value      = user.targetWeight;
  document.getElementById('editActivity').value    = user.activityMins;
  document.getElementById('editVegan').checked     = user.restrictions.vegan;
  document.getElementById('editNuts').checked      = user.restrictions.peanutAllergy;
  document.getElementById('editGoal').value        = user.goal;
  document.getElementById('editModal').classList.add('open');
}

function closeEditProfile() {
  document.getElementById('editModal').classList.remove('open');
}

function saveProfile() {
  user = DB.getUser();
  const newWeight   = parseFloat(document.getElementById('editWeight').value);
  const newTarget   = parseFloat(document.getElementById('editTarget').value);
  const newActivity = parseInt(document.getElementById('editActivity').value);
  const newGoal     = document.getElementById('editGoal').value;

  if (isNaN(newWeight) || newWeight < 50)  { showToast('Enter a valid weight.'); return; }
  if (isNaN(newTarget) || newTarget < 50)  { showToast('Enter a valid target.'); return; }
  if (isNaN(newActivity))                  { showToast('Enter valid activity.'); return; }

  user.weight                     = newWeight;
  user.targetWeight               = newTarget;
  user.activityMins               = newActivity;
  user.goal                       = newGoal;
  user.restrictions.vegan         = document.getElementById('editVegan').checked;
  user.restrictions.peanutAllergy = document.getElementById('editNuts').checked;

  // Recalculate targets
  user.targets = calculateTargets(user);
  DB.setUser(user);

  // Regenerate plan
  const freshFoods = DB.getFoods();
  const newPlan    = generatePlan(user, freshFoods);
  DB.setPlan(newPlan);
  plan = newPlan;

  closeEditProfile();
  showToast('Profile updated! Plan regenerated. 🔄');
  renderPlan();
}

// ─── STATS TAB ───────────────────────────────────────────
function renderStats() {
  user = DB.getUser();
  game = DB.getGame();
  const targets  = user.targets;
  const { days, avg } = getWeeklySummary();

  // Streak hero
  document.getElementById('statsStreak').textContent   = game.streak;
  document.getElementById('statsXP').textContent       = game.xp;

  // Fun fact
  document.getElementById('funFact').textContent = getFunFact(avg, targets);

  // Weekly macro cards
  renderWeekMacro('weekPro',  avg.pro,  targets.protein, 'g', '#E8635A');
  renderWeekMacro('weekCarb', avg.carb, targets.carbs,   'g', '#6C9FD6');
  renderWeekMacro('weekFat',  avg.fat,  targets.fat,     'g', '#FFD166');

  // Bar chart
  renderBarChart(days, targets.calories);

  // Badges
  renderBadges();
}

function renderWeekMacro(containerId, avg, target, unit, color) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const rounded = Math.round(avg);
  const pct     = target > 0 ? Math.round(((rounded - target) / target) * 100) : 0;
  const cls     = Math.abs(pct) < 10 ? 'on' : pct > 0 ? 'over' : 'under';
  const label   = cls === 'on' ? 'On target ✓' : pct > 0 ? `+${pct}% over` : `${Math.abs(pct)}% under`;

  el.innerHTML = `
    <div class="wv" style="color:${color}">${rounded}${unit}</div>
    <div class="wl">${containerId.replace('week','').toUpperCase()}</div>
    <span class="wpct ${cls}">${label}</span>`;
}

function renderBarChart(days, calTarget) {
  const maxCals = Math.max(calTarget * 1.2, ...days.map(d => d.cals));
  const container = document.getElementById('barChart');
  if (!container) return;

  container.innerHTML = days.map(d => {
    const height = maxCals > 0 ? Math.round((d.cals / maxCals) * 80) : 0;
    const isToday = d.date === today();
    const color = isToday ? '#8B5CF6' : d.cals > calTarget * 1.1 ? '#FBBF24' : '#38BDF8';
    const label = shortDayName(d.date);
    return `
      <div class="bar-col">
        <div class="bar" style="height:${height}px;background:${color};opacity:${d.cals > 0 ? 1 : 0.15}"></div>
        <div class="bar-day">${label}</div>
      </div>`;
  }).join('');
}

function renderBadges() {
  game = DB.getGame();
  const container = document.getElementById('badgesGrid');
  if (!container) return;

  container.innerHTML = ALL_BADGES.map(b => {
    const unlocked = game.badges.includes(b.id);
    return `
      <div class="badge-card ${unlocked ? '' : 'locked'}" title="${unlocked ? 'Unlocked!' : 'Keep going!'}">
        <span class="badge-emoji">${b.emoji}</span>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
      </div>`;
  }).join('');
}

// ─── GAMIFICATION ────────────────────────────────────────
function updateStreak() {
  game = DB.getGame();
  const todayLogs = DB.getTodayLogs();
  const yest      = yesterday();

  // If there are logs today and lastLogDate isn't today yet, it's a new logging day
  if (todayLogs.length > 0 && game.lastLogDate !== today()) {
    if (game.lastLogDate === yest) {
      game.streak += 1; // consecutive day
    } else if (game.lastLogDate !== today()) {
      game.streak = 1; // restart
    }
    game.lastLogDate = today();
    DB.setGame(game);
  } else if (game.lastLogDate && game.lastLogDate !== today() && game.lastLogDate !== yest) {
    // Streak broken
    if (game.streak > 0) {
      game.streak = 0;
      DB.setGame(game);
    }
  }
}

function awardXP(amount, msg) {
  game = DB.getGame();
  game.xp += amount;
  DB.setGame(game);
  showToast(msg || `+${amount} XP!`);
}

function checkBadges() {
  game  = DB.getGame();
  const todayLogs  = DB.getTodayLogs();
  const allLogs    = DB.getLogs();
  const earned     = [];

  // Rookie Logger
  if (!game.badges.includes('rookie_logger') && game.totalFoodsLogged >= 0) {
    earned.push('rookie_logger');
  }

  // Update total foods logged
  game.totalFoodsLogged = (game.totalFoodsLogged || 0) + 1;

  // Food Explorer
  if (!game.badges.includes('explorer')) {
    const allFoodIds = new Set(Object.values(allLogs).flat().map(e => e.foodId));
    if (allFoodIds.size >= 10) earned.push('explorer');
  }

  // Clean Eater
  if (!game.badges.includes('clean_eater')) {
    const allEntries = Object.values(allLogs).flat();
    const veganCount = allEntries.filter(e => {
      const f = foods.find(f => f.id === e.foodId);
      return f && f.vegan;
    }).length;
    if (veganCount >= 3) earned.push('clean_eater');
  }

  // Streak badges (checked after increment)
  if (!game.badges.includes('on_a_roll') && game.streak >= 3)   earned.push('on_a_roll');
  if (!game.badges.includes('week_warrior') && game.streak >= 7) {
    earned.push('week_warrior');
    earned.push('cheat_day');
    celebrateCheatDay();
  }

  earned.forEach(id => {
    if (!game.badges.includes(id)) {
      game.badges.push(id);
      const badge = ALL_BADGES.find(b => b.id === id);
      if (badge) showToast(`${badge.emoji} Badge unlocked: ${badge.name}!`, 'badge');
    }
  });

  DB.setGame(game);
}

function checkDailyGoal() {
  const summary = getDailySummary(DB.getTodayLogs());
  const target  = user.targets.calories;
  if (Math.abs(summary.cals - target) <= 100) {
    awardXP(50, `🎯 +50 XP — Daily calorie goal hit!`);
    checkBadges();
  }
}

function celebrateCheatDay() {
  showToast("🍕 7-DAY STREAK! You've earned a cheat day!", 'cheat');
  launchConfetti();
}

function launchConfetti() {
  const colors = ['#E8635A','#FFD166','#6C9FD6','#4CAF50','#FF9800','#9C27B0'];
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        animation-duration: ${2 + Math.random() * 1.5}s;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 30);
  }
}

// ─── TOAST ───────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast${type ? ' ' + type : ''}`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}
