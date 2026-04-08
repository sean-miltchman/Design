// ===== SETUP WIZARD LOGIC =====

const TOTAL_STEPS = 6;
let currentStep = 1;
let formData = {
  name: '', age: 16, sex: 'male',
  height: 67, weight: 150, targetWeight: 140,
  activityMins: 60,
  goal: '',
  dietLength: 30,
  restrictions: { vegan: false, peanutAllergy: false }
};

// ─── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // If user already exists, skip to app
  if (DB.getUser()) {
    window.location.href = 'app.html';
    return;
  }

  // Wire sliders to display values
  wireSlider('activitySlider', 'activityVal', v => `${v}<span> min/day</span>`);
  wireSlider('dietSlider',     'dietVal',     v => `${v}<span> days</span>`);

  // Wire goal cards
  document.querySelectorAll('.goal-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      formData.goal = card.dataset.goal;
    });
  });

  // Wire restriction toggles
  document.querySelectorAll('.toggle-row').forEach(row => {
    row.addEventListener('click', () => {
      const key = row.dataset.key;
      formData.restrictions[key] = !formData.restrictions[key];
      row.classList.toggle('on', formData.restrictions[key]);
      row.querySelector('.switch').classList.toggle('on', formData.restrictions[key]);
    });
  });

  showStep(1);
});

// ─── Slider helper ───────────────────────────────────────
function wireSlider(sliderId, displayId, formatter) {
  const slider  = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  if (!slider || !display) return;
  display.innerHTML = formatter(slider.value);
  slider.addEventListener('input', () => {
    display.innerHTML = formatter(slider.value);
  });
}

// ─── Step navigation ────────────────────────────────────
function showStep(n) {
  document.querySelectorAll('.setup-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${n}`).classList.add('active');

  const pct = ((n - 1) / TOTAL_STEPS) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('stepLabel').textContent = `Step ${n} of ${TOTAL_STEPS}`;

  const nextBtn = document.getElementById('nextBtn');
  nextBtn.textContent = n === TOTAL_STEPS ? "Let's Go! 🚀" : 'Continue →';
  currentStep = n;
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  collectStep(currentStep);

  if (currentStep === TOTAL_STEPS) {
    finishSetup();
  } else {
    showStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 1) showStep(currentStep - 1);
}

// ─── Validation ──────────────────────────────────────────
function validateStep(step) {
  if (step === 1) {
    const name = document.getElementById('inputName').value.trim();
    if (!name) { shake('inputName'); showMsg('What should we call you? 👋'); return false; }
    const age = parseInt(document.getElementById('inputAge').value);
    if (isNaN(age) || age < 10 || age > 100) { shake('inputAge'); showMsg('Enter a valid age (10–100).'); return false; }
  }
  if (step === 2) {
    const h = parseFloat(document.getElementById('inputHeight').value);
    const w = parseFloat(document.getElementById('inputWeight').value);
    const t = parseFloat(document.getElementById('inputTarget').value);
    if (isNaN(h) || h < 48 || h > 96) { shake('inputHeight'); showMsg('Enter height between 48–96 inches.'); return false; }
    if (isNaN(w) || w < 50 || w > 500){ shake('inputWeight'); showMsg('Enter a valid weight.'); return false; }
    if (isNaN(t) || t < 50 || t > 500){ shake('inputTarget'); showMsg('Enter a valid target weight.'); return false; }
  }
  if (step === 4) {
    if (!formData.goal) { showMsg('Pick your goal — Bulk or Cut! 💪'); return false; }
  }
  return true;
}

function shake(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.style.borderColor = 'var(--primary)';
  el.style.animation = 'none';
  setTimeout(() => {
    el.style.animation = '';
    el.style.borderColor = '';
  }, 500);
}

function showMsg(msg) {
  showToast(msg);
}

// ─── Data collection ─────────────────────────────────────
function collectStep(step) {
  if (step === 1) {
    formData.name = document.getElementById('inputName').value.trim();
    formData.age  = parseInt(document.getElementById('inputAge').value);
    formData.sex  = document.getElementById('inputSex').value;
  }
  if (step === 2) {
    formData.height       = parseFloat(document.getElementById('inputHeight').value);
    formData.weight       = parseFloat(document.getElementById('inputWeight').value);
    formData.targetWeight = parseFloat(document.getElementById('inputTarget').value);
  }
  if (step === 3) {
    formData.activityMins = parseInt(document.getElementById('activitySlider').value);
  }
  // Step 4 (goal) collected via card clicks
  if (step === 5) {
    formData.dietLength = parseInt(document.getElementById('dietSlider').value);
  }
  // Step 6 (restrictions) collected via toggle clicks
}

// ─── Finish ──────────────────────────────────────────────
function finishSetup() {
  collectStep(6);

  // Calculate nutrition targets
  const targets = calculateTargets(formData);
  formData.targets   = targets;
  formData.startDate = today();

  // Save user
  DB.setUser(formData);

  // Init food database
  DB.getFoods(); // seeds defaults

  // Generate 7-day plan
  const foods = DB.getFoods();
  const plan  = generatePlan(formData, foods);
  DB.setPlan(plan);

  // Init gamification with "First Step" badge
  DB.setGame({
    streak: 0, xp: 50, lastLogDate: null,
    badges: ['first_step'], totalFoodsLogged: 0, level: 1
  });

  // Redirect to app
  window.location.href = 'app.html';
}

// ─── Toast ───────────────────────────────────────────────
function showToast(msg, type = '') {
  let t = document.getElementById('setupToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'setupToast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
