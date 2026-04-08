// ===== FOOD DATABASE =====
// All nutrition values are per 100g

const DEFAULT_FOODS = [
  // ── Proteins ──────────────────────────────────────────────────────────────
  { id: 1,  name: "Chicken Breast",    emoji: "🍗", cal: 165, pro: 31.0, carb: 0.0,  fat: 3.6,  vegan: false, nuts: false },
  { id: 5,  name: "Eggs",              emoji: "🥚", cal: 155, pro: 13.0, carb: 1.1,  fat: 11.0, vegan: false, nuts: false },
  { id: 10, name: "Salmon",            emoji: "🐟", cal: 208, pro: 20.0, carb: 0.0,  fat: 13.0, vegan: false, nuts: false },
  { id: 18, name: "Tuna (Canned)",     emoji: "🐠", cal: 116, pro: 26.0, carb: 0.0,  fat: 1.0,  vegan: false, nuts: false },
  { id: 20, name: "Turkey Breast",     emoji: "🦃", cal: 135, pro: 30.0, carb: 0.0,  fat: 1.0,  vegan: false, nuts: false },
  { id: 9,  name: "Greek Yogurt",      emoji: "🥛", cal: 100, pro: 17.0, carb: 6.0,  fat: 0.7,  vegan: false, nuts: false },
  { id: 19, name: "Cottage Cheese",    emoji: "🧀", cal: 98,  pro: 11.0, carb: 3.4,  fat: 4.3,  vegan: false, nuts: false },
  { id: 26, name: "Ground Beef (Lean)",emoji: "🥩", cal: 215, pro: 26.0, carb: 0.0,  fat: 12.0, vegan: false, nuts: false },
  { id: 27, name: "Shrimp",            emoji: "🦐", cal: 99,  pro: 24.0, carb: 0.2,  fat: 0.3,  vegan: false, nuts: false },
  { id: 28, name: "Cheddar Cheese",    emoji: "🧀", cal: 403, pro: 25.0, carb: 1.3,  fat: 33.0, vegan: false, nuts: false },
  { id: 29, name: "Pork Tenderloin",   emoji: "🥩", cal: 143, pro: 22.0, carb: 0.0,  fat: 6.0,  vegan: false, nuts: false },
  { id: 30, name: "Beef Steak",        emoji: "🥩", cal: 271, pro: 26.0, carb: 0.0,  fat: 18.0, vegan: false, nuts: false },
  { id: 41, name: "Whey Protein",      emoji: "💪", cal: 400, pro: 80.0, carb: 8.0,  fat: 8.0,  vegan: false, nuts: false },
  { id: 47, name: "Skim Milk",         emoji: "🍼", cal: 34,  pro: 3.4,  carb: 5.0,  fat: 0.1,  vegan: false, nuts: false },
  { id: 24, name: "Whole Milk",        emoji: "🥛", cal: 61,  pro: 3.2,  carb: 4.8,  fat: 3.3,  vegan: false, nuts: false },

  // ── Plant Proteins ────────────────────────────────────────────────────────
  { id: 3,  name: "Tofu",              emoji: "🟨", cal: 76,  pro: 8.0,  carb: 1.9,  fat: 4.2,  vegan: true,  nuts: false },
  { id: 17, name: "Lentils",           emoji: "🫘", cal: 116, pro: 9.0,  carb: 20.0, fat: 0.4,  vegan: true,  nuts: false },
  { id: 31, name: "Edamame",           emoji: "🫛", cal: 121, pro: 11.0, carb: 9.0,  fat: 5.0,  vegan: true,  nuts: false },
  { id: 32, name: "Chickpeas",         emoji: "🫘", cal: 164, pro: 9.0,  carb: 27.0, fat: 2.6,  vegan: true,  nuts: false },
  { id: 40, name: "Black Beans",       emoji: "🫘", cal: 132, pro: 9.0,  carb: 24.0, fat: 0.5,  vegan: true,  nuts: false },
  { id: 33, name: "Hummus",            emoji: "🫙", cal: 177, pro: 5.0,  carb: 14.0, fat: 10.0, vegan: true,  nuts: false },
  { id: 4,  name: "Peanut Butter",     emoji: "🥜", cal: 588, pro: 25.0, carb: 20.0, fat: 50.0, vegan: true,  nuts: true  },
  { id: 13, name: "Almonds",           emoji: "🌰", cal: 579, pro: 21.0, carb: 22.0, fat: 50.0, vegan: true,  nuts: true  },

  // ── Carbs & Grains ────────────────────────────────────────────────────────
  { id: 2,  name: "Brown Rice",        emoji: "🍚", cal: 130, pro: 2.7,  carb: 28.0, fat: 0.3,  vegan: true,  nuts: false },
  { id: 25, name: "White Rice",        emoji: "🍚", cal: 130, pro: 2.7,  carb: 28.0, fat: 0.3,  vegan: true,  nuts: false },
  { id: 6,  name: "Oatmeal",           emoji: "🥣", cal: 389, pro: 17.0, carb: 66.0, fat: 7.0,  vegan: true,  nuts: false },
  { id: 14, name: "Whole Wheat Bread", emoji: "🍞", cal: 247, pro: 13.0, carb: 41.0, fat: 3.4,  vegan: true,  nuts: false },
  { id: 15, name: "Pasta",             emoji: "🍝", cal: 131, pro: 5.0,  carb: 25.0, fat: 1.1,  vegan: true,  nuts: false },
  { id: 21, name: "Quinoa",            emoji: "🌾", cal: 120, pro: 4.4,  carb: 22.0, fat: 1.9,  vegan: true,  nuts: false },
  { id: 11, name: "Sweet Potato",      emoji: "🍠", cal: 86,  pro: 1.6,  carb: 20.0, fat: 0.1,  vegan: true,  nuts: false },
  { id: 35, name: "White Potato",      emoji: "🥔", cal: 77,  pro: 2.0,  carb: 17.0, fat: 0.1,  vegan: true,  nuts: false },
  { id: 44, name: "Corn",              emoji: "🌽", cal: 86,  pro: 3.3,  carb: 19.0, fat: 1.4,  vegan: true,  nuts: false },
  { id: 48, name: "Granola",           emoji: "🥣", cal: 471, pro: 10.0, carb: 64.0, fat: 19.0, vegan: true,  nuts: true  },
  { id: 49, name: "Rice Cakes",        emoji: "🍘", cal: 387, pro: 8.0,  carb: 82.0, fat: 3.0,  vegan: true,  nuts: false },

  // ── Vegetables ────────────────────────────────────────────────────────────
  { id: 12, name: "Broccoli",          emoji: "🥦", cal: 34,  pro: 2.8,  carb: 7.0,  fat: 0.4,  vegan: true,  nuts: false },
  { id: 23, name: "Spinach",           emoji: "🥬", cal: 23,  pro: 2.9,  carb: 3.6,  fat: 0.4,  vegan: true,  nuts: false },
  { id: 36, name: "Cauliflower",       emoji: "🥦", cal: 25,  pro: 1.9,  carb: 5.0,  fat: 0.3,  vegan: true,  nuts: false },
  { id: 37, name: "Bell Pepper",       emoji: "🫑", cal: 31,  pro: 1.0,  carb: 6.0,  fat: 0.3,  vegan: true,  nuts: false },
  { id: 38, name: "Mushrooms",         emoji: "🍄", cal: 22,  pro: 3.1,  carb: 3.3,  fat: 0.3,  vegan: true,  nuts: false },
  { id: 39, name: "Kale",              emoji: "🥬", cal: 49,  pro: 4.3,  carb: 9.0,  fat: 0.9,  vegan: true,  nuts: false },
  { id: 45, name: "Carrot",            emoji: "🥕", cal: 41,  pro: 0.9,  carb: 10.0, fat: 0.2,  vegan: true,  nuts: false },
  { id: 46, name: "Cucumber",          emoji: "🥒", cal: 16,  pro: 0.7,  carb: 3.6,  fat: 0.1,  vegan: true,  nuts: false },

  // ── Fruits ────────────────────────────────────────────────────────────────
  { id: 7,  name: "Banana",            emoji: "🍌", cal: 89,  pro: 1.1,  carb: 23.0, fat: 0.3,  vegan: true,  nuts: false },
  { id: 8,  name: "Apple",             emoji: "🍎", cal: 52,  pro: 0.3,  carb: 14.0, fat: 0.2,  vegan: true,  nuts: false },
  { id: 22, name: "Blueberries",       emoji: "🫐", cal: 57,  pro: 0.7,  carb: 14.0, fat: 0.3,  vegan: true,  nuts: false },
  { id: 34, name: "Mango",             emoji: "🥭", cal: 60,  pro: 0.8,  carb: 15.0, fat: 0.4,  vegan: true,  nuts: false },
  { id: 50, name: "Grapes",            emoji: "🍇", cal: 69,  pro: 0.7,  carb: 18.0, fat: 0.2,  vegan: true,  nuts: false },
  { id: 51, name: "Strawberries",      emoji: "🍓", cal: 32,  pro: 0.7,  carb: 8.0,  fat: 0.3,  vegan: true,  nuts: false },
  { id: 52, name: "Orange",            emoji: "🍊", cal: 47,  pro: 0.9,  carb: 12.0, fat: 0.1,  vegan: true,  nuts: false },
  { id: 53, name: "Watermelon",        emoji: "🍉", cal: 30,  pro: 0.6,  carb: 8.0,  fat: 0.2,  vegan: true,  nuts: false },

  // ── Fats & Extras ─────────────────────────────────────────────────────────
  { id: 16, name: "Avocado",           emoji: "🥑", cal: 160, pro: 2.0,  carb: 9.0,  fat: 15.0, vegan: true,  nuts: false },
  { id: 42, name: "Olive Oil",         emoji: "🫒", cal: 884, pro: 0.0,  carb: 0.0,  fat: 100.0,vegan: true,  nuts: false },
  { id: 43, name: "Honey",             emoji: "🍯", cal: 304, pro: 0.3,  carb: 82.0, fat: 0.0,  vegan: false, nuts: false },
];

// ===== STORAGE HELPERS =====

const DB = {
  // Keys
  USER: 'nutripath_user',
  FOODS: 'nutripath_foods',
  LOGS: 'nutripath_logs',
  PLAN: 'nutripath_plan',
  GAME: 'nutripath_gamification',

  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // User
  getUser()       { return this.get(this.USER); },
  setUser(u)      { this.set(this.USER, u); },

  // Foods — initialize with defaults, and merge any new default foods added later
  getFoods() {
    let foods = this.get(this.FOODS);
    if (!foods || foods.length === 0) {
      this.set(this.FOODS, DEFAULT_FOODS);
      return DEFAULT_FOODS.map(f => ({ ...f }));
    }
    // Merge new default foods without overwriting custom ones
    const existingIds = new Set(foods.map(f => f.id));
    const newFoods = DEFAULT_FOODS.filter(f => !existingIds.has(f.id));
    if (newFoods.length > 0) {
      foods = [...foods, ...newFoods];
      this.set(this.FOODS, foods);
    }
    return foods;
  },
  addFood(food) {
    const foods = this.getFoods();
    const newId = Math.max(...foods.map(f => f.id)) + 1;
    food.id = newId;
    food.custom = true;
    foods.push(food);
    this.set(this.FOODS, foods);
    return food;
  },

  // Logs
  getLogs()       { return this.get(this.LOGS) || {}; },
  getTodayLogs()  {
    const logs = this.getLogs();
    return logs[today()] || [];
  },
  addLog(entry) {
    const logs = this.getLogs();
    const t = today();
    if (!logs[t]) logs[t] = [];
    entry.id = Date.now().toString();
    entry.date = t;
    logs[t].push(entry);
    this.set(this.LOGS, logs);
    return entry;
  },
  deleteLog(entryId) {
    const logs = this.getLogs();
    const t = today();
    if (!logs[t]) return;
    logs[t] = logs[t].filter(e => e.id !== entryId);
    this.set(this.LOGS, logs);
  },
  updateLogAmount(entryId, newAmount, newCals, newPro, newCarb, newFat) {
    const logs = this.getLogs();
    const t = today();
    if (!logs[t]) return;
    const entry = logs[t].find(e => e.id === entryId);
    if (entry) {
      entry.amount = newAmount;
      entry.cals   = newCals;
      entry.pro    = newPro;
      entry.carb   = newCarb;
      entry.fat    = newFat;
    }
    this.set(this.LOGS, logs);
  },

  // Plan
  getPlan()       { return this.get(this.PLAN) || []; },
  setPlan(p)      { this.set(this.PLAN, p); },

  // Gamification
  getGame() {
    return this.get(this.GAME) || {
      streak: 0, xp: 0, lastLogDate: null,
      badges: ['first_step'], totalFoodsLogged: 0, level: 1
    };
  },
  setGame(g)      { this.set(this.GAME, g); },
};

// ===== DATE HELPERS =====
function today() {
  return new Date().toISOString().split('T')[0];
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function dayName(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
}

function shortDayName(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
}

// Macro calc helper — given food and amount in grams
function macrosForAmount(food, grams) {
  const ratio = grams / 100;
  return {
    cals: Math.round(food.cal  * ratio),
    pro:  Math.round(food.pro  * ratio * 10) / 10,
    carb: Math.round(food.carb * ratio * 10) / 10,
    fat:  Math.round(food.fat  * ratio * 10) / 10,
  };
}
