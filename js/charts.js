// ===== CHART INSTANCES =====
let wChart, rChart, bfC, paceC;

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a1e', titleColor: '#f0ede8', bodyColor: '#9a9890', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
  scales: {
    x: { ticks: { color: '#5a5856', font: { size: 10, family: 'DM Sans' }, maxRotation: 30 }, grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, border: { display: false } },
    y: { ticks: { color: '#5a5856', font: { size: 10, family: 'DM Sans' } }, grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, border: { display: false } }
  }
};

function initCharts() {
  const wCtx = document.getElementById('weightChart');
  const rCtx = document.getElementById('runChart');
  const bfCtx = document.getElementById('bfChart');
  const pCtx = document.getElementById('paceChart');

  if (wCtx) {
    wChart = new Chart(wCtx, {
      type: 'line',
      data: { labels: [], datasets: [{ data: [], borderColor: '#e8622a', backgroundColor: 'rgba(232,98,42,0.07)', tension: 0.45, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#e8622a', pointBorderColor: 'transparent', fill: true, borderWidth: 2 }] },
      options: { ...chartDefaults, scales: { x: chartDefaults.scales.x, y: { ...chartDefaults.scales.y, suggestedMin: 72, suggestedMax: 88 } } }
    });
  }

  if (rCtx) {
    rChart = new Chart(rCtx, {
      type: 'bar',
      data: { labels: [], datasets: [{ data: [], backgroundColor: 'rgba(232,98,42,0.4)', borderColor: '#e8622a', borderWidth: 1.5, borderRadius: 5, hoverBackgroundColor: 'rgba(232,98,42,0.65)' }] },
      options: { ...chartDefaults }
    });
  }

  if (bfCtx) {
    bfC = new Chart(bfCtx, {
      type: 'line',
      data: { labels: [], datasets: [{ data: [], borderColor: '#2dbd8a', backgroundColor: 'rgba(45,189,138,0.07)', tension: 0.45, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#2dbd8a', pointBorderColor: 'transparent', fill: true, borderWidth: 2 }] },
      options: { ...chartDefaults, scales: { x: chartDefaults.scales.x, y: { ...chartDefaults.scales.y, suggestedMin: 14, suggestedMax: 28 } } }
    });
  }

  if (pCtx) {
    paceC = new Chart(pCtx, {
      type: 'line',
      data: { labels: [], datasets: [{ data: [], borderColor: '#4a9eff', backgroundColor: 'rgba(74,158,255,0.07)', tension: 0.45, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#4a9eff', pointBorderColor: 'transparent', fill: true, borderWidth: 2 }] },
      options: { ...chartDefaults, scales: { x: chartDefaults.scales.x, y: { ...chartDefaults.scales.y, reverse: true, ticks: { ...chartDefaults.scales.y.ticks, callback: v => v.toFixed(1) + '/km' } } } }
    });
  }
}

function refreshCharts() {
  const weighIns = logs.filter(l => l.weight).sort((a,b) => a.date.localeCompare(b.date));
  const runs = logs.filter(l => l.distance).sort((a,b) => a.date.localeCompare(b.date));
  const bfLogs = logs.filter(l => l.bf).sort((a,b) => a.date.localeCompare(b.date));
  const paceLogs = runs.filter(l => l.pace);

  if (wChart) {
    wChart.data.labels = weighIns.map(l => l.date.slice(5));
    wChart.data.datasets[0].data = weighIns.map(l => l.weight);
    wChart.update('active');
  }

  if (rChart) {
    const last8 = runs.slice(-8);
    rChart.data.labels = last8.map(l => l.date.slice(5));
    rChart.data.datasets[0].data = last8.map(l => parseFloat(l.distance.toFixed(1)));
    rChart.update('active');
  }

  if (bfC) {
    bfC.data.labels = bfLogs.map(l => l.date.slice(5));
    bfC.data.datasets[0].data = bfLogs.map(l => l.bf);
    bfC.update('active');
  }

  if (paceC) {
    paceC.data.labels = paceLogs.map(l => l.date.slice(5));
    paceC.data.datasets[0].data = paceLogs.map(l => l.pace);
    paceC.update('active');
  }
}
