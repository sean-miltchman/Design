// ===== NUTRITION CALCULATIONS =====

/**
 * Calculate calorie and macro targets from user profile.
 * Uses Mifflin-St Jeor BMR formula.
 */
function calculateTargets(user) {
  // Convert imperial to metric
  const weightKg = user.weight * 0.453592;
  const heightCm = user.height * 2.54;

  // Mifflin-St Jeor BMR
  let bmr;
  if (user.sex === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * user.age) + 5;
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * user.age) - 161;
  }

  // Activity multiplier based on daily activity minutes
  let actFactor;
  const mins = user.activityMins;
  if      (mins <= 20)  actFactor = 1.2;
  else if (mins <= 50)  actFactor = 1.375;
  else if (mins <= 80)  actFactor = 1.55;
  else if (mins <= 110) actFactor = 1.725;
  else                  actFactor = 1.9;

  const tdee = Math.round(bmr * actFactor);

  // Adjust for goal
  let calories;
  if (user.goal === 'cut') {
    calories = tdee - 500;
  } else {
    calories = tdee + 300;
  }
  calories = Math.max(1200, calories); // safety floor

  // Macros
  const protein = Math.round(user.weight * 1.0);       // 1g per lb bodyweight
  const fat     = Math.round((calories * 0.28) / 9);   // ~28% of cals from fat
  const carbCal = calories - (protein * 4) - (fat * 9);
  const carbs   = Math.max(50, Math.round(carbCal / 4));

  // BMI
  const heightM = user.height * 0.0254;
  const bmi     = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  return { calories, protein, carbs, fat, tdee, bmi };
}

// ===== MEAL PLAN GENERATOR =====

/**
 * Generate a 7-day meal plan with realistic, meal-appropriate food combos.
 * Each meal type only pulls from foods that actually make sense for that meal.
 */
function generatePlan(user, foods) {
  const targets = user.targets;

  // Filter by restrictions first
  const ok = (f) => {
    if (user.restrictions.vegan        && !f.vegan) return false;
    if (user.restrictions.peanutAllergy && f.nuts)  return false;
    return true;
  };

  const av = foods.filter(ok);
  const fallback = (arr) => arr.length > 0 ? arr : av; // never return empty

  // ── Breakfast-friendly foods ──────────────────────────────────────────────
  const bkfstProteins = fallback(av.filter(f =>
    [5,9,3,41,19,24,47].includes(f.id)                         // eggs, yogurt, tofu, whey, cottage cheese, milk
  ));
  const bkfstCarbs = fallback(av.filter(f =>
    [6,14,25,2,21,48,49].includes(f.id)                        // oatmeal, bread, rice, quinoa, granola, rice cakes
  ));
  const bkfstExtras = fallback(av.filter(f =>
    [7,8,22,51,52,53,34,50,16,43].includes(f.id)               // banana, apple, blueberries, strawberries, avocado, honey
  ));

  // ── Lunch-friendly foods ──────────────────────────────────────────────────
  const lunchProteins = fallback(av.filter(f =>
    [1,18,20,26,27,29,3,32,17,40].includes(f.id)               // chicken, tuna, turkey, beef, shrimp, tofu, chickpeas, lentils
  ));
  const lunchCarbs = fallback(av.filter(f =>
    [2,25,15,35,11,44].includes(f.id)                          // brown rice, white rice, pasta, potato, sweet potato, corn
  ));
  const lunchVeggies = fallback(av.filter(f =>
    [12,23,36,37,38,39,45,46].includes(f.id)                   // broccoli, spinach, cauliflower, pepper, mushrooms, kale, carrot, cucumber
  ));

  // ── Dinner-friendly foods ─────────────────────────────────────────────────
  const dinnerProteins = fallback(av.filter(f =>
    [1,10,20,26,30,29,3,17].includes(f.id)                     // chicken, salmon, turkey, beef, steak, pork, tofu, lentils
  ));
  const dinnerCarbs = fallback(av.filter(f =>
    [2,25,15,11,35,21].includes(f.id)                          // rice, pasta, sweet potato, potato, quinoa
  ));
  const dinnerVeggies = fallback(av.filter(f =>
    [12,23,36,37,38,39,45].includes(f.id)                      // broccoli, spinach, cauliflower, pepper, mushrooms, kale, carrot
  ));

  // ── Snacks ────────────────────────────────────────────────────────────────
  const snackOptions = fallback(av.filter(f =>
    [7,8,9,22,51,52,13,4,19,33].includes(f.id)                 // fruit, yogurt, almonds, pb, cottage cheese, hummus
  ));

  const plan = [];
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  for (let d = 0; d < 7; d++) {
    plan.push({
      day:     d + 1,
      dayName: days[d],
      breakfast: buildMeal(targets.calories * 0.25, bkfstProteins,  bkfstCarbs,   bkfstExtras,   d, 0),
      lunch:     buildMeal(targets.calories * 0.35, lunchProteins,  lunchCarbs,   lunchVeggies,  d, 1),
      dinner:    buildMeal(targets.calories * 0.30, dinnerProteins, dinnerCarbs,  dinnerVeggies, d, 2),
      snack:     buildSnack(targets.calories * 0.10, snackOptions, d),
    });
  }
  return plan;
}

/**
 * Build a single meal: one protein + one carb + one extra/veggie.
 * Uses day index as rotation seed so each day is different.
 */
function buildMeal(targetCals, proteinFoods, carbFoods, extraFoods, dayIdx, mealOffset) {
  const pFood = pick(proteinFoods, dayIdx * 3 + mealOffset);
  const cFood = pick(carbFoods,   dayIdx * 2 + mealOffset + 1);
  const eFood = pick(extraFoods,  dayIdx     + mealOffset + 2);

  const unique = dedupeByName([pFood, cFood, eFood]);
  const splits = unique.length === 3 ? [0.50, 0.35, 0.15]
               : unique.length === 2 ? [0.60, 0.40]
               :                       [1.00];

  return unique.map((food, i) => {
    const mealCals = targetCals * splits[i];
    const grams    = clampGrams(Math.round((mealCals / food.cal) * 100));
    const m        = macrosForAmount(food, grams);
    return { foodId: food.id, name: food.name, emoji: food.emoji, amount: grams,
             cals: m.cals, pro: m.pro, carb: m.carb, fat: m.fat };
  });
}

function buildSnack(targetCals, snackFoods, dayIdx) {
  const food  = pick(snackFoods, dayIdx * 7 + 3);
  const grams = clampGrams(Math.round((targetCals / food.cal) * 100));
  const m     = macrosForAmount(food, grams);
  return [{ foodId: food.id, name: food.name, emoji: food.emoji, amount: grams,
            cals: m.cals, pro: m.pro, carb: m.carb, fat: m.fat }];
}

// ===== HELPERS =====

function pick(arr, idx) {
  if (!arr || arr.length === 0) return DEFAULT_FOODS[0];
  return arr[Math.abs(idx) % arr.length];
}

function clampGrams(g) {
  return Math.min(500, Math.max(30, g));
}

function dedupeByName(foods) {
  const seen = new Set();
  return foods.filter(f => {
    if (seen.has(f.name)) return false;
    seen.add(f.name);
    return true;
  });
}

// ===== DAILY SUMMARY =====

function getDailySummary(logs) {
  const entries = logs || [];
  return entries.reduce((acc, e) => {
    acc.cals += e.cals  || 0;
    acc.pro  += e.pro   || 0;
    acc.carb += e.carb  || 0;
    acc.fat  += e.fat   || 0;
    return acc;
  }, { cals: 0, pro: 0, carb: 0, fat: 0 });
}

// Weekly summary: last 7 days
function getWeeklySummary() {
  const logs  = DB.getLogs();
  const days  = [];
  const dates = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push(dateStr);
    const dayLogs = logs[dateStr] || [];
    days.push({ date: dateStr, ...getDailySummary(dayLogs) });
  }

  const nonZero = days.filter(d => d.cals > 0);
  const avg = nonZero.length > 0
    ? {
        cals: Math.round(nonZero.reduce((s,d) => s + d.cals, 0) / nonZero.length),
        pro:  Math.round(nonZero.reduce((s,d) => s + d.pro,  0) / nonZero.length),
        carb: Math.round(nonZero.reduce((s,d) => s + d.carb, 0) / nonZero.length),
        fat:  Math.round(nonZero.reduce((s,d) => s + d.fat,  0) / nonZero.length),
      }
    : { cals: 0, pro: 0, carb: 0, fat: 0 };

  return { days, avg };
}

// Fun weekly fact based on user progress
function getFunFact(weeklyAvg, targets) {
  if (!targets || weeklyAvg.cals === 0) {
    return "🌟 Start logging your meals to unlock weekly insights!";
  }

  const pctDiff = Math.round(((weeklyAvg.pro - targets.protein) / targets.protein) * 100);
  const calDiff = Math.round(((weeklyAvg.cals - targets.calories) / targets.calories) * 100);

  if (pctDiff >= 10)  return `💪 Your protein was ${pctDiff}% above target this week — gains are coming!`;
  if (pctDiff <= -15) return `🥩 Heads up — you're ${Math.abs(pctDiff)}% below your protein goal. Time to add more chicken!`;
  if (calDiff >= 15)  return `🍕 You averaged ${calDiff}% over your calorie goal. Dial it back slightly this week!`;
  if (calDiff <= -15) return `🥗 You're ${Math.abs(calDiff)}% under your calorie target. Don't forget to eat enough!`;
  return `🎯 Great consistency this week — you hit your targets almost perfectly. Keep it up!`;
}
