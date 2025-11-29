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
    case "24h": agora.setHours(agora.getHours() - 24); break;
    case "7d": agora.setDate(agora.getDate() - 7); break;
    case "1m": agora.setMonth(agora.getMonth() - 1); break;
    case "3m": agora.setMonth(agora.getMonth() - 3); break;
    case "6m": agora.setMonth(agora.getMonth() - 6); break;
    case "1a": agora.setFullYear(agora.getFullYear() - 1); break;
  }
  return agora;
}

async function updateCharts() {
  let feedsPorCanal = await Promise.all(channels.map(ch => fetchData(ch)));

  if (paradaSelecionada !== "todas") {
    const idx = parseInt(paradaSelecionada, 10) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < feedsPorCanal.length) {
      feedsPorCanal = [feedsPorCanal[idx]];
    }
  }

  const limiteTempo = calcularLimiteTempo(periodoSelecionado);
  feedsPorCanal = feedsPorCanal.map(feeds =>
    feeds.filter(f => f?.created_at && new Date(f.created_at) >= limiteTempo)
  );

  const allFeeds = feedsPorCanal.flat();
  const totalVisual = allFeeds.reduce((a, f) => a + (parseInt(f.field1) || 0), 0);
  const totalFisico = allFeeds.reduce((a, f) => a + (parseInt(f.field2) || 0), 0);

  document.getElementById("totalVisual").textContent = totalVisual;
  document.getElementById("totalFisico").textContent = totalFisico;

  const fluxoTotal = feedsPorCanal.map(feeds =>
    feeds.reduce((total, feed) => total + (parseInt(feed.field1) || 0) + (parseInt(feed.field2) || 0), 0)
  );

  const totalGeral = fluxoTotal.reduce((s, v) => s + v, 0);

  const topParadaElement = document.getElementById("topParada");
  if (totalGeral === 0) topParadaElement.textContent = "–";
  else {
    if (paradaSelecionada === "todas") {
      const labelsAll = channels.map(c => c.label);
      const idxTop = fluxoTotal.indexOf(Math.max(...fluxoTotal));
      topParadaElement.textContent = labelsAll[idxTop];
    } else {
      const idx = parseInt(paradaSelecionada, 10) - 1;
      topParadaElement.textContent = channels[idx]?.label;
    }
  }

  const { labels, visual, fisico } = prepareHourlyData(allFeeds);

  if (totalClicksChart) {
    totalClicksChart.data.datasets[0].data = [totalVisual, totalFisico];
    totalClicksChart.update();
  }

  if (hourlyClicksChart) {
    hourlyClicksChart.data.labels = labels;
    hourlyClicksChart.data.datasets[0].data = visual;
    hourlyClicksChart.data.datasets[1].data = fisico;
    hourlyClicksChart.update();
  }

  if (comparacaoFluxoChart) {
    comparacaoFluxoChart.data.labels = channels.map(c => c.label);
    comparacaoFluxoChart.data.datasets[0].data = fluxoTotal;
    comparacaoFluxoChart.update();
  }

  if (comparacaoDeficienciaChart) {
    comparacaoDeficienciaChart.data.labels = channels.map(c => c.label);
    comparacaoDeficienciaChart.data.datasets[0].data = channels.map((_, i) => fluxoTotal[i] || 0);
    comparacaoDeficienciaChart.update();
  }

  document.getElementById("ultimaAtualizacao").textContent =
    new Date().toLocaleTimeString("pt-BR");
}

function createCharts() {
  totalClicksChart = new Chart(document.getElementById("totalClicksChart"), {
    type: "bar",
    data: {
      labels: ["Deficiente Visual", "Deficiente Físico"],
      datasets: [
        {
          label: "Total de Cliques",
          data: [0, 0],
          backgroundColor: ["#2b4eff", "#ff8a00"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  hourlyClicksChart = new Chart(document.getElementById("hourlyClicksChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Deficiente Visual", data: [], borderColor: "#2b4eff", backgroundColor: "rgba(43,78,255,0.2)", tension: 0.4, fill: true },
        { label: "Deficiente Físico", data: [], borderColor: "#ff8a00", backgroundColor: "rgba(255,138,0,0.2)", tension: 0.4, fill: true }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: { y: { beginAtZero: true } }
    }
  });

  comparacaoFluxoChart = new Chart(document.getElementById("comparacaoFluxoChart"), {
    type: "bar",
    data: {
      labels: channels.map(c => c.label),
      datasets: [
        {
          label: "Fluxo Total",
          data: channels.map(() => 0),
          backgroundColor: ["#2b4eff", "#ff8a00", "#4caf50", "#e91e63"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  comparacaoDeficienciaChart = new Chart(document.getElementById("comparacaoDeficienciaChart"), {
    type: "bar",
    data: {
      labels: channels.map(c => c.label),
      datasets: [
        { label: "Deficiente Visual", data: channels.map(() => 0), backgroundColor: "#2b4eff" },
        { label: "Deficiente Físico", data: channels.map(() => 0), backgroundColor: "#ff8a00" }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } }
  });

  updateCharts();
  setInterval(updateCharts, 4000);
}

const themeToggle = document.getElementById("temaToggle");
const body = document.body;

function setTema(isDark) {
  body.classList.toggle("dark-mode", isDark);
  if (themeToggle) themeToggle.checked = isDark;
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

if (themeToggle) {
  themeToggle.addEventListener("change", (e) => setTema(e.target.checked));
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

/* ★★★★★ ADIÇÃO PARA GERAR PDF ★★★★★ */
const btnGerarPDF = document.getElementById("btnGerarPDF");
const periodoRelatorio = document.getElementById("periodoRelatorio");
const statusPDF = document.getElementById("statusPDF");

if (btnGerarPDF) {
  btnGerarPDF.addEventListener("click", async () => {
    const periodo = periodoRelatorio.value;

    statusPDF.textContent = "Gerando PDF...";

    try {
      const res = await fetch(`http://localhost:5000/api/relatorio/gerar?periodo=${periodo}`);

      if (!res.ok) {
        statusPDF.textContent = "Erro ao gerar relatório.";
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${periodo}.pdf`;
      link.click();

      statusPDF.textContent = "PDF gerado com sucesso!";
    } catch (error) {
      console.error(error);
      statusPDF.textContent = "Erro ao conectar ao servidor.";
    }
  });
}
