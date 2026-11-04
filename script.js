
'use strict';

const STORE_KEY = 'fittrack.activities.v2';
const SETTINGS_KEY = 'fittrack.settings.v1';

const $ = (id) => document.getElementById(id);

const icons = {
  'Walking': '👟',
  'Running': '🏃',
  'Cycling': '🚴',
  'Yoga': '🧘',
  'Gym / Strength training': '🏋️',
  'Swimming': '🏊',
  'Dance': '💃',
  'Sports': '⚽',
  'Other': '✳'
};

function localISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

let activities = readJSON(STORE_KEY, []);
if (!Array.isArray(activities)) activities = [];

let settings = {
  stepGoal: 6000,
  minuteGoal: 30,
  ...readJSON(SETTINGS_KEY, {})
};

function saveActivities() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(activities));
    return true;
  } catch {
    alert('Could not save data. Your browser storage may be full or disabled.');
    return false;
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    alert('Could not save preferences in this browser.');
    return false;
  }
}

function sum(list, key) {
  return list.reduce(
    (acc, item) => acc + (Number(item[key]) || 0),
    0
  );
}

function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(
    undefined,
    { day: 'numeric', month: 'short', year: 'numeric' }
  );
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function activityMarkup(item) {
  return `
    <article class="activity-item">
      <div class="activity-symbol">
        ${icons[item.type] || '✳'}
      </div>

      <div class="activity-info">
        <strong>${escapeHTML(item.type)}</strong>
        <span>
          ${formatDate(item.date)} · ${item.minutes} min
          ${item.notes ? ' · ' + escapeHTML(item.notes) : ''}
        </span>
      </div>

      <div class="activity-meta">
        ${Number(item.steps || 0).toLocaleString()} steps<br>
        ${item.calories == null
          ? 'Calories not entered'
          : `${Number(item.calories).toLocaleString()} cal*`}
      </div>

      <button
        class="delete-button"
        data-delete="${escapeHTML(item.id)}"
        aria-label="Delete activity"
      >×</button>
    </article>
  `;
}

function showView(name) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('hidden', view.id !== name);
  });

  document.querySelectorAll('.nav-link').forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.view === name
    );
  });

  if (name === 'dashboard') renderDashboard();
  if (name === 'history') renderHistory();
  if (name === 'settings') loadSettingsForm();
}

document.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener('click', () => {
    showView(button.dataset.view);
  });
});

document.querySelectorAll('[data-go]').forEach(button => {
  button.addEventListener('click', () => {
    showView(button.dataset.go);
  });
});

function setProgress(fillId, textId, value, goal, suffix = '') {
  const fill = $(fillId);
  const text = $(textId);

  if (!goal || goal < 0) {
    fill.parentElement.parentElement.style.display = 'none';
    return;
  }

  fill.parentElement.parentElement.style.display = '';

  const percent = Math.min(100, (value / goal) * 100);

  fill.style.width = `${percent}%`;

  text.textContent =
    `${value.toLocaleString()} / ${goal.toLocaleString()}${suffix}`;
}

function renderDashboard() {
  const today = localISO();

  const todayItems = activities.filter(
    item => item.date === today
  );

  $('welcomeDate').textContent =
    new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  $('metricSteps').textContent =
    sum(todayItems, 'steps').toLocaleString();

  $('metricMinutes').textContent =
    sum(todayItems, 'minutes').toLocaleString();

  const caloriesEntered = todayItems.filter(
    item => item.calories !== null &&
            item.calories !== undefined
  );

  $('metricCalories').textContent =
    caloriesEntered.length
      ? sum(caloriesEntered, 'calories').toLocaleString()
      : '—';

  $('metricActivities').textContent =
    todayItems.length.toString();

  setProgress(
    'stepsProgress',
    'stepsProgressText',
    sum(todayItems, 'steps'),
    Number(settings.stepGoal)
  );

  setProgress(
    'minutesProgress',
    'minutesProgressText',
    sum(todayItems, 'minutes'),
    Number(settings.minuteGoal),
    ' min'
  );

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();

    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    const iso = localISO(date);

    return {
      iso,
      label: date.toLocaleDateString(undefined, {
        weekday: 'short'
      }),
      minutes: sum(
        activities.filter(item => item.date === iso),
        'minutes'
      )
    };
  });

  const max = Math.max(
    30,
    ...days.map(day => day.minutes)
  );

  $('weeklyChart').innerHTML = days.map(day => `
    <div class="chart-day" title="${day.minutes} active minutes">
      <div class="chart-track">
        <div
          class="chart-bar"
          style="height:${
            day.minutes
              ? Math.max(4, day.minutes / max * 100)
              : 0
          }%"
        ></div>
      </div>
      <small>${day.label}</small>
    </div>
  `).join('');

  const recent = [...activities]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  $('recentList').innerHTML = recent.length
    ? recent.map(activityMarkup).join('')
    : '<div class="empty">No activities logged yet. Add an entry to see it here.</div>';
}

function renderHistory() {
  const sorted = [...activities].sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  $('entryCount').textContent =
    `${sorted.length} ${sorted.length === 1 ? 'entry' : 'entries'}`;

  $('historyList').innerHTML = sorted.length
    ? sorted.map(activityMarkup).join('')
    : '<div class="empty">Your activity history is empty. Log an activity to get started.</div>';
}

// Activity form

$('activityDate').value = localISO();

$('activityForm').addEventListener('submit', event => {
  event.preventDefault();

  const date = $('activityDate').value;
  const minutes = Number($('minutes').value);

  const steps = $('steps').value === ''
    ? 0
    : Number($('steps').value);

  const caloriesText = $('calories').value.trim();

  const calories = caloriesText === ''
    ? null
    : Number(caloriesText);

  if (
    !date ||
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 1440 ||
    !Number.isInteger(steps) ||
    steps < 0 ||
    (
      calories !== null &&
      (!Number.isInteger(calories) || calories < 0)
    )
  ) {
    $('formMessage').textContent =
      'Please check the date and enter valid whole numbers.';
    return;
  }

  const entry = {
    id: (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    date,
    type: $('activityType').value,
    minutes,
    steps,
    calories,
    notes: $('notes').value.trim()
  };

  activities.push(entry);

  if (!saveActivities()) {
    activities.pop();
    return;
  }

  $('activityForm').reset();
  $('activityDate').value = localISO();

  $('formMessage').textContent =
    'Activity saved on this device.';

  showView('dashboard');
});

// Settings

function loadSettingsForm() {
  $('stepGoal').value = settings.stepGoal;
  $('minuteGoal').value = settings.minuteGoal;
}

$('settingsForm').addEventListener('submit', event => {
  event.preventDefault();

  const stepGoal = Number($('stepGoal').value);
  const minuteGoal = Number($('minuteGoal').value);

  if (
    !Number.isInteger(stepGoal) ||
    stepGoal < 0 ||
    stepGoal > 100000 ||
    !Number.isInteger(minuteGoal) ||
    minuteGoal < 0 ||
    minuteGoal > 1440
  ) {
    $('settingsMessage').textContent =
      'Enter valid targets, or use 0 to hide a progress bar.';
    return;
  }

  const previous = settings;

  settings = { stepGoal, minuteGoal };

  if (!saveSettings()) {
    settings = previous;
    return;
  }

  $('settingsMessage').textContent =
    'Preferences saved.';

  renderDashboard();
});

// Delete activity

document.addEventListener('click', event => {
  const deleteButton = event.target.closest('[data-delete]');

  if (!deleteButton) return;

  const id = deleteButton.dataset.delete;

  activities = activities.filter(
    item => String(item.id) !== id
  );

  saveActivities();

  renderHistory();
  renderDashboard();
});

// Export backup

$('exportButton').addEventListener('click', () => {
  const blob = new Blob(
    [JSON.stringify({ activities, settings }, null, 2)],
    { type: 'application/json' }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.download = `fittrack-backup-${localISO()}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
});

// Clear all data

$('clearData').addEventListener('click', () => {
  if (
    !confirm(
      'Delete all activity entries saved in this browser? This cannot be undone.'
    )
  ) return;

  activities = [];

  saveActivities();

  renderDashboard();
  renderHistory();
});

// Initial page setup

loadSettingsForm();
renderDashboard();
renderHistory();
