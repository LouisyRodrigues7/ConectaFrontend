
const channels = [
  { id: 3096316, key: "NUQB46X37DE06NP5", label: "Parada 1" },
  { id: 3102167, key: "3EFVUAMPT6UA7AJ3", label: "Parada 2" },
  { id: 3174071, key: "UU92V5ZK4L0YYR12", label: "Parada 3" },
  { id: 3174077, key: "RTH6JYKPEEOEGDQH", label: "Parada 4" }
];

let totalClicksChart, hourlyClicksChart, comparacaoFluxoChart, comparacaoDeficienciaChart;
let paradaSelecionada = "todas";
let periodoSelecionado = "24h";

async function fetchData(channel) {
  try {
    const url = `https://api.thingspeak.com/channels/${channel.id}/feeds.json?api_key=${channel.key}&results=500`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Thingspeak fetch falhou para canal ${channel.id}: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.feeds || [];
  } catch (err) {
    console.error("Erro ao buscar dados do ThingSpeak:", err);
    return [];
  }
}

function prepareHourlyData(feeds) {
  const hours = {};
  feeds.forEach(f => {
    if (!f || !f.created_at) return;
    const h = new Date(f.created_at).getHours();
    if (!hours[h]) hours[h] = { visual: 0, fisico: 0 };
    hours[h].visual += parseInt(f.field1) || 0;
    hours[h].fisico += parseInt(f.field2) || 0;
  });
  const labels = Object.keys(hours).sort((a, b) => a - b);
  return {
    labels: labels.map(l => l + ":00"),
    visual: labels.map(h => hours[h].visual),
    fisico: labels.map(h => hours[h].fisico)
  };
}

function calcularLimiteTempo(periodo) {
  const agora = new Date();
  switch (periodo) {
    case "24h":
      agora.setHours(agora.getHours() - 24);
      break;
    case "7d":
      agora.setDate(agora.getDate() - 7);
      break;
    case "1m":
      agora.setMonth(agora.getMonth() - 1);
      break;
    case "3m":
      agora.setMonth(agora.getMonth() - 3);
      break;
    case "6m":
      agora.setMonth(agora.getMonth() - 6);
      break;
    case "1a":
      agora.setFullYear(agora.getFullYear() - 1);
      break;
  }
  return agora;
}

async function updateCharts() {
  let feedsPorCanal = await Promise.all(channels.map(ch => fetchData(ch)));

  if (paradaSelecionada !== "todas") {
    const idx = parseInt(paradaSelecionada, 10) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < feedsPorCanal.length) {
      feedsPorCanal = [feedsPorCanal[idx]];
    } else {
      console.warn("Índice de parada inválido:", paradaSelecionada);
    }
  }

  const limiteTempo = calcularLimiteTempo(periodoSelecionado);
  feedsPorCanal = feedsPorCanal.map(feeds => {
    return feeds.filter(f => {
      if (!f || !f.created_at) return false;
      return new Date(f.created_at) >= limiteTempo;
    });
  });

 
  const allFeeds = feedsPorCanal.flat();
  const totalVisual = allFeeds.reduce((a, f) => a + (parseInt(f.field1) || 0), 0);
  const totalFisico = allFeeds.reduce((a, f) => a + (parseInt(f.field2) || 0), 0);

  document.getElementById("totalVisual").textContent = totalVisual;
  document.getElementById("totalFisico").textContent = totalFisico;

  const fluxoTotal = feedsPorCanal.map(feeds =>
    feeds.reduce((total, feed) => total + (parseInt(feed.field1) || 0) + (parseInt(feed.field2) || 0), 0)
  );

  const totalGeralDeAcionamentos = fluxoTotal.reduce((soma, v) => soma + v, 0);

  const topParadaElement = document.getElementById("topParada");
  if (totalGeralDeAcionamentos === 0) {
    topParadaElement.textContent = '–';
  } else {
    if (paradaSelecionada === "todas") {
      const labelsWhenAll = channels.map(c => c.label);
      const indexTop = fluxoTotal.indexOf(Math.max(...fluxoTotal));
      topParadaElement.textContent = labelsWhenAll[indexTop] || channels[indexTop]?.label || `Parada ${indexTop+1}`;
    } else {
      const idx = parseInt(paradaSelecionada, 10) - 1;
      topParadaElement.textContent = channels[idx]?.label || "–";
    }
  }

  const { labels, visual, fisico } = prepareHourlyData(allFeeds);

  if (totalClicksChart && totalClicksChart.data && totalClicksChart.data.datasets && totalClicksChart.data.datasets[0]) {
    totalClicksChart.data.datasets[0].data = [totalVisual, totalFisico];
  }
  if (hourlyClicksChart) {
    hourlyClicksChart.data.labels = labels;
    if (hourlyClicksChart.data.datasets[0]) hourlyClicksChart.data.datasets[0].data = visual;
    if (hourlyClicksChart.data.datasets[1]) hourlyClicksChart.data.datasets[1].data = fisico;
  }

  if (feedsPorCanal.length === 1 && paradaSelecionada !== "todas") {
    const idx = parseInt(paradaSelecionada, 10) - 1;
    comparacaoFluxoChart.data.labels = [channels[idx]?.label || `Parada ${idx+1}`];
    comparacaoFluxoChart.data.datasets[0].data = [fluxoTotal[0] || 0];
  } else {
    comparacaoFluxoChart.data.labels = channels.map(c => c.label);
    if (fluxoTotal.length === channels.length) {
      comparacaoFluxoChart.data.datasets[0].data = fluxoTotal;
    } else {
      const preenchido = channels.map((_, i) => fluxoTotal[i] || 0);
      comparacaoFluxoChart.data.datasets[0].data = preenchido;
    }
  }

  const dadosVisualPorParada = feedsPorCanal.map(f => f.reduce((a, r) => a + (parseInt(r.field1) || 0), 0));
  const dadosFisicoPorParada = feedsPorCanal.map(f => f.reduce((a, r) => a + (parseInt(r.field2) || 0), 0));

  if (paradaSelecionada === "todas") {
    const vis = channels.map((_, i) => dadosVisualPorParada[i] || 0);
    const fis = channels.map((_, i) => dadosFisicoPorParada[i] || 0);
    comparacaoDeficienciaChart.data.datasets[0].data = vis;
    comparacaoDeficienciaChart.data.datasets[1].data = fis;
    comparacaoDeficienciaChart.data.labels = channels.map(c => c.label);
  } else {
    comparacaoDeficienciaChart.data.datasets[0].data = [dadosVisualPorParada[0] || 0];
    comparacaoDeficienciaChart.data.datasets[1].data = [dadosFisicoPorParada[0] || 0];
    const idx = parseInt(paradaSelecionada, 10) - 1;
    comparacaoDeficienciaChart.data.labels = [channels[idx]?.label || `Parada ${idx+1}`];
  }

  if (totalClicksChart) totalClicksChart.update();
  if (hourlyClicksChart) hourlyClicksChart.update();
  if (comparacaoFluxoChart) comparacaoFluxoChart.update();
  if (comparacaoDeficienciaChart) comparacaoDeficienciaChart.update();

  document.getElementById("ultimaAtualizacao").textContent = new Date().toLocaleTimeString("pt-BR");
}

function createCharts() {
  totalClicksChart = new Chart(document.getElementById('totalClicksChart'), {
    type: 'bar',
    data: {
      labels: ['Deficiente Visual', 'Deficiente Físico'],
      datasets: [{
        label: 'Total de Cliques',
        data: [0, 0],
        backgroundColor: ['#2b4eff', '#ff8a00']
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  hourlyClicksChart = new Chart(document.getElementById('hourlyClicksChart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Deficiente Visual', data: [], borderColor: '#2b4eff', backgroundColor: 'rgba(43,78,255,0.2)', tension: 0.4, fill: true },
        { label: 'Deficiente Físico', data: [], borderColor: '#ff8a00', backgroundColor: 'rgba(255,138,0,0.2)', tension: 0.4, fill: true }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  });

  comparacaoFluxoChart = new Chart(document.getElementById('comparacaoFluxoChart'), {
    type: 'bar',
    data: {
      labels: channels.map(c => c.label),
      datasets: [{ label: 'Fluxo Total', data: channels.map(_ => 0), backgroundColor: ['#2b4eff', '#ff8a00', '#4caf50', '#e91e63'] } ]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  comparacaoDeficienciaChart = new Chart(document.getElementById('comparacaoDeficienciaChart'), {
    type: 'bar',
    data: {
      labels: channels.map(c => c.label),
      datasets: [
        { label: 'Deficiente Visual', data: channels.map(_ => 0), backgroundColor: '#2b4eff' },
        { label: 'Deficiente Físico', data: channels.map(_ => 0), backgroundColor: '#ff8a00' }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  });


  updateCharts();
  setInterval(updateCharts, 4000);
}


const themeToggle = document.getElementById("temaToggle");
const body = document.body;

function setTema(isDarkMode) {
  body.classList.toggle("dark-mode", isDarkMode);
  if (themeToggle) themeToggle.checked = isDarkMode;
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}

if (themeToggle) {
  themeToggle.addEventListener("change", (e) => {
    setTema(e.target.checked);
  });
}


const paradaSelect = document.getElementById("paradaSelect");
if (paradaSelect) {
  paradaSelect.addEventListener("change", (e) => {
    paradaSelecionada = e.target.value;
    updateCharts();
  });
}

const periodoSelect = document.getElementById("periodoSelect");
if (periodoSelect) {
  periodoSelect.addEventListener("change", (e) => {
    periodoSelecionado = e.target.value;
    updateCharts();
  });
}

const atualizarBtn = document.getElementById("atualizarBtn");
if (atualizarBtn) atualizarBtn.addEventListener("click", updateCharts);

const savedTheme = localStorage.getItem("theme");
setTema(savedTheme === null || savedTheme === "dark");

createCharts();
