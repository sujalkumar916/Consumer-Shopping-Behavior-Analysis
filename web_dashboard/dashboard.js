// ---------- Load embedded data ----------
const COLS = JSON.parse(document.getElementById('data-cols').textContent);
const ROWS = JSON.parse(document.getElementById('data-rows').textContent);

const idx = {};
COLS.forEach((c, i) => idx[c] = i);

const records = ROWS.map(r => ({
  age: r[idx['Age']],
  gender: r[idx['Gender']],
  item: r[idx['Item Purchased']],
  category: r[idx['Category']],
  amount: r[idx['Purchase Amount (USD)']],
  location: r[idx['Location']],
  size: r[idx['Size']],
  color: r[idx['Color']],
  season: r[idx['Season']],
  rating: r[idx['Review Rating']],
  subscription: r[idx['Subscription Status']],
  shipping: r[idx['Shipping Type']],
  discount: r[idx['Discount Applied']],
  promo: r[idx['Promo Code Used']],
  prevPurchases: r[idx['Previous Purchases']],
  payment: r[idx['Payment Method']],
  frequency: r[idx['Frequency of Purchases']],
  ageGroup: r[idx['Age Group']],
}));

const FILTER_FIELDS = [
  { key: 'category', label: 'Category', order: ['Clothing', 'Footwear', 'Outerwear', 'Accessories'] },
  { key: 'season', label: 'Season', order: ['Spring', 'Summer', 'Fall', 'Winter'] },
  { key: 'gender', label: 'Gender', order: ['Male', 'Female'] },
  { key: 'ageGroup', label: 'Age group', order: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'] },
  { key: 'subscription', label: 'Subscriber', order: ['Yes', 'No'] },
];

const activeFilters = {};
FILTER_FIELDS.forEach(f => activeFilters[f.key] = new Set());

// ---------- Build filter UI ----------
const filtersEl = document.getElementById('filters');
FILTER_FIELDS.forEach(f => {
  const group = document.createElement('div');
  group.className = 'filter-group';
  const h = document.createElement('h4');
  h.textContent = f.label;
  group.appendChild(h);
  const chips = document.createElement('div');
  chips.className = 'chips';
  f.order.forEach(val => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = val;
    chip.addEventListener('click', () => {
      if (activeFilters[f.key].has(val)) {
        activeFilters[f.key].delete(val);
        chip.classList.remove('active');
      } else {
        activeFilters[f.key].add(val);
        chip.classList.add('active');
      }
      render();
    });
    chips.appendChild(chip);
  });
  group.appendChild(chips);
  filtersEl.appendChild(group);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  FILTER_FIELDS.forEach(f => activeFilters[f.key].clear());
  document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));
  render();
});


function getFiltered() {
  return records.filter(rec => {
    return FILTER_FIELDS.every(f => {
      const set = activeFilters[f.key];
      return set.size === 0 || set.has(rec[f.key]);
    });
  });
}


function fmtUSD(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}
function avg(arr, fn) {
  if (!arr.length) return 0;
  return arr.reduce((s, x) => s + fn(x), 0) / arr.length;
}
function groupSum(data, keyFn, valFn) {
  const m = new Map();
  data.forEach(d => {
    const k = keyFn(d);
    m.set(k, (m.get(k) || 0) + valFn(d));
  });
  return m;
}


const PALETTE = ['#a03f47', '#c9a227', '#4f7d76', '#7c3138', '#8c8560', '#5a6b8c', '#b0754f', '#6f8f7a'];
Chart.defaults.color = '#9d9c94';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = '#33363f';

const charts = {};
function upsertChart(id, config) {
  if (charts[id]) {
    charts[id].data = config.data;
    charts[id].options = config.options;
    charts[id].update();
  } else {
    charts[id] = new Chart(document.getElementById(id), config);
  }
}

const kpiRow = document.getElementById('kpiRow');
function renderKPIs(data) {
  const totalRevenue = data.reduce((s, d) => s + d.amount, 0);
  const avgTicket = avg(data, d => d.amount);
  const avgRating = avg(data, d => d.rating);
  const subsPct = data.length ? (data.filter(d => d.subscription === 'Yes').length / data.length) * 100 : 0;
  const promoPct = data.length ? (data.filter(d => d.promo === 'Yes').length / data.length) * 100 : 0;

  const kpis = [
    { label: 'Customers', value: data.length.toLocaleString('en-US') },
    { label: 'Total revenue', value: fmtUSD(totalRevenue) },
    { label: 'Avg. ticket', value: fmtUSD(avgTicket) },
    { label: 'Avg. rating', value: avgRating.toFixed(2), suffix: '/ 5' },
    { label: 'Promo usage', value: promoPct.toFixed(0) + '%' },
  ];

  kpiRow.innerHTML = '';
  kpis.forEach(k => {
    const stub = document.createElement('div');
    stub.className = 'stub';
    stub.innerHTML = `<p class="k-label">${k.label}</p><p class="k-value">${k.value}${k.suffix ? ' <span>' + k.suffix + '</span>' : ''}</p>`;
    kpiRow.appendChild(stub);
  });
}


const stampEl = document.getElementById('stamp');
const stampCountEl = document.getElementById('stampCount');
const footerCountEl = document.getElementById('footerCount');


function render() {
  const data = getFiltered();

  stampCountEl.textContent = data.length.toLocaleString('en-US');
  stampEl.classList.remove('pulse');
  void stampEl.offsetWidth;
  stampEl.classList.add('pulse');

  footerCountEl.textContent = data.length === records.length
    ? `Showing all ${records.length.toLocaleString('en-US')} records`
    : `Showing ${data.length.toLocaleString('en-US')} of ${records.length.toLocaleString('en-US')} records`;

  renderKPIs(data);


  const catOrder = ['Clothing', 'Footwear', 'Outerwear', 'Accessories'];
  const catMap = groupSum(data, d => d.category, d => d.amount);
  upsertChart('chartCategory', {
    type: 'bar',
    data: {
      labels: catOrder,
      datasets: [{
        data: catOrder.map(c => catMap.get(c) || 0),
        backgroundColor: PALETTE[0],
        borderRadius: 4,
        maxBarThickness: 46,
      }]
    },
    options: baseOptions({ x: { grid: { display: false } }, y: { ticks: { callback: v => '$' + v.toLocaleString() } } })
  });

  const payCounts = groupSum(data, d => d.payment, () => 1);
  const payLabels = [...payCounts.keys()];
  upsertChart('chartPayment', {
    type: 'doughnut',
    data: {
      labels: payLabels,
      datasets: [{
        data: payLabels.map(l => payCounts.get(l)),
        backgroundColor: PALETTE,
        borderColor: '#1b1e25',
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { boxWidth: 10, padding: 10, font: { size: 11 } } } }
    }
  });

  const seasonOrder = ['Spring', 'Summer', 'Fall', 'Winter'];
  const seasonMap = groupSum(data, d => d.season, () => 1);
  const seasonAmtMap = groupSum(data, d => d.season, d => d.amount);
  upsertChart('chartSeason', {
    type: 'line',
    data: {
      labels: seasonOrder,
      datasets: [
        {
          label: 'Transactions',
          data: seasonOrder.map(s => seasonMap.get(s) || 0),
          borderColor: PALETTE[2],
          backgroundColor: 'rgba(79,125,118,0.15)',
          tension: 0.35,
          fill: true,
          yAxisID: 'y',
        },
      ]
    },
    options: baseOptions({ x: { grid: { display: false } }, y: { title: { display: false } } })
  });

  const ageOrder = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
  const ageGroups = ageOrder.map(g => data.filter(d => d.ageGroup === g));
  upsertChart('chartAge', {
    type: 'bar',
    data: {
      labels: ageOrder,
      datasets: [{
        data: ageGroups.map(g => avg(g, d => d.amount)),
        backgroundColor: PALETTE[1],
        borderRadius: 4,
        maxBarThickness: 38,
      }]
    },
    options: baseOptions({ x: { grid: { display: false } }, y: { ticks: { callback: v => '$' + v } } })
  });

  const locMap = groupSum(data, d => d.location, d => d.amount);
  const topLocs = [...locMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  upsertChart('chartLocation', {
    type: 'bar',
    data: {
      labels: topLocs.map(l => l[0]),
      datasets: [{
        data: topLocs.map(l => l[1]),
        backgroundColor: PALETTE[3],
        borderRadius: 4,
      }]
    },
    options: baseOptions({ indexAxis: 'y', y: { grid: { display: false } }, x: { ticks: { callback: v => '$' + v.toLocaleString() } } }, true)
  });

  const discYes = data.filter(d => d.discount === 'Yes');
  const discNo = data.filter(d => d.discount === 'No');
  upsertChart('chartDiscount', {
    type: 'bar',
    data: {
      labels: ['With discount', 'Without discount'],
      datasets: [{
        data: [avg(discYes, d => d.amount), avg(discNo, d => d.amount)],
        backgroundColor: [PALETTE[0], PALETTE[4]],
        borderRadius: 4,
        maxBarThickness: 70,
      }]
    },
    options: baseOptions({ x: { grid: { display: false } }, y: { ticks: { callback: v => '$' + v } } })
  });

  const freqOrder = ['Weekly', 'Fortnightly', 'Bi-Weekly', 'Monthly', 'Every 3 Months', 'Quarterly', 'Annually'];
  const freqPresent = freqOrder.filter(f => data.some(d => d.frequency === f));
  upsertChart('chartFrequency', {
    type: 'bar',
    data: {
      labels: freqPresent,
      datasets: [{
        data: freqPresent.map(f => avg(data.filter(d => d.frequency === f), d => d.rating)),
        backgroundColor: PALETTE[5],
        borderRadius: 4,
        maxBarThickness: 50,
      }]
    },
    options: baseOptions({ x: { grid: { display: false } }, y: { min: 0, max: 5 } })
  });
}

function baseOptions(scaleOverrides = {}, horizontal = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#2a2d36' }, ...(scaleOverrides.x || {}) },
      y: { grid: { color: '#2a2d36' }, ...(scaleOverrides.y || {}) },
    },
  };
}

render();