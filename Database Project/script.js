let gamesData = [];
let filteredData = [];
let hoursChart = null;
let seriesChart = null;

// Load data from JSON file
async function loadData() {
  try {
    const response = await fetch('games.json');
    gamesData = await response.json();
    filteredData = [...gamesData];
    populateFilters();
    updateStats();
    updateCharts();
    renderTable();
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('games-tbody').innerHTML = 
      '<tr><td colspan="5" style="text-align: center; color: #f44336;">Error loading data. Please check games.json file.</td></tr>';
  }
}

// Populate filter dropdowns
function populateFilters() {
  const seriesSet = new Set();
  const systemSet = new Set();
  
  gamesData.forEach(game => {
    seriesSet.add(game.series);
    systemSet.add(game.system);
  });
  
  const seriesFilter = document.getElementById('series-filter');
  const systemFilter = document.getElementById('system-filter');
  
  // Clear existing options (except "All")
  seriesFilter.innerHTML = '<option value="">All Series</option>';
  systemFilter.innerHTML = '<option value="">All Systems</option>';
  
  // Add series options
  Array.from(seriesSet).sort().forEach(series => {
    const option = document.createElement('option');
    option.value = series;
    option.textContent = series;
    seriesFilter.appendChild(option);
  });
  
  // Add system options
  Array.from(systemSet).sort().forEach(system => {
    const option = document.createElement('option');
    option.value = system;
    option.textContent = system;
    systemFilter.appendChild(option);
  });
}

// Update statistics
function updateStats() {
  const totalGames = filteredData.length;
  const totalHours = filteredData.reduce((sum, game) => sum + game.completionHours, 0);
  const avgHours = totalGames > 0 ? Math.round(totalHours / totalGames) : 0;
  
  document.getElementById('total-games').textContent = totalGames;
  document.getElementById('total-hours').textContent = totalHours;
  document.getElementById('avg-hours').textContent = avgHours;
}

// Sort data
function sortData() {
  const sortBy = document.getElementById('sort-by').value;
  
  filteredData.sort((a, b) => {
    switch(sortBy) {
      case 'hours-desc':
        return b.completionHours - a.completionHours;
      case 'hours-asc':
        return a.completionHours - b.completionHours;
      case 'title-asc':
        return a.gameTitle.localeCompare(b.gameTitle);
      case 'series-asc':
        return a.series.localeCompare(b.series);
      default:
        return 0;
    }
  });
  
  updateCharts();
  renderTable();
}

// Filter data
function filterData() {
  const seriesFilter = document.getElementById('series-filter').value;
  const systemFilter = document.getElementById('system-filter').value;
  
  filteredData = gamesData.filter(game => {
    const matchesSeries = !seriesFilter || game.series === seriesFilter;
    const matchesSystem = !systemFilter || game.system === systemFilter;
    return matchesSeries && matchesSystem;
  });
  
  updateStats();
  updateCharts();
  sortData();
}

// Render table
function renderTable() {
  const tbody = document.getElementById('games-tbody');
  
  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #f44336;">No games match the selected filters.</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredData.map((game, index) => `
    <tr data-series="${game.series}" style="animation-delay: ${index * 0.05}s">
      <td><strong>${game.gameTitle}</strong></td>
      <td class="series-cell">${game.series}</td>
      <td class="system-cell">${game.system}</td>
      <td class="hours-cell">~${game.completionHours} hours</td>
      <td class="notes-cell">${game.notes}</td>
    </tr>
  `).join('');
}

// Event listeners
document.getElementById('series-filter').addEventListener('change', filterData);
document.getElementById('system-filter').addEventListener('change', filterData);
document.getElementById('sort-by').addEventListener('change', sortData);

// QR Code functionality
function generateQRCode() {
  const currentUrl = window.location.href;
  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = ''; // Clear previous QR code
  
  new QRCode(qrContainer, {
    text: currentUrl,
    width: 256,
    height: 256,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

function showQRCode() {
  const qrContainer = document.getElementById('qr-container');
  qrContainer.classList.remove('hidden');
  generateQRCode();
}

function hideQRCode() {
  const qrContainer = document.getElementById('qr-container');
  qrContainer.classList.add('hidden');
}

// Chart functions
function updateCharts() {
  updateHoursChart();
  updateSeriesChart();
}

function updateHoursChart() {
  const ctx = document.getElementById('hours-chart').getContext('2d');
  
  // Sort by hours for better visualization
  const sortedData = [...filteredData].sort((a, b) => b.completionHours - a.completionHours);
  
  if (hoursChart) {
    hoursChart.destroy();
  }
  
  hoursChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedData.map(g => g.gameTitle.length > 20 ? g.gameTitle.substring(0, 20) + '...' : g.gameTitle),
      datasets: [{
        label: 'Completion Hours',
        data: sortedData.map(g => g.completionHours),
        backgroundColor: sortedData.map(g => {
          const colors = {
            'Fire Emblem': 'rgba(100, 200, 250, 0.8)',
            'Persona': 'rgba(200, 100, 255, 0.8)',
            'Smash Bros': 'rgba(255, 100, 100, 0.8)',
            'Xenoblade': 'rgba(100, 255, 150, 0.8)',
            'Zelda': 'rgba(255, 200, 100, 0.8)'
          };
          return colors[g.series] || 'rgba(76, 175, 80, 0.8)';
        }),
        borderColor: sortedData.map(g => {
          const colors = {
            'Fire Emblem': 'rgba(100, 200, 250, 1)',
            'Persona': 'rgba(200, 100, 255, 1)',
            'Smash Bros': 'rgba(255, 100, 100, 1)',
            'Xenoblade': 'rgba(100, 255, 150, 1)',
            'Zelda': 'rgba(255, 200, 100, 1)'
          };
          return colors[g.series] || 'rgba(76, 175, 80, 1)';
        }),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Hours by Game',
          color: '#4CAF50',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#b0b0b0'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#b0b0b0',
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function updateSeriesChart() {
  const ctx = document.getElementById('series-chart').getContext('2d');
  
  // Calculate total hours per series
  const seriesTotals = {};
  filteredData.forEach(game => {
    if (!seriesTotals[game.series]) {
      seriesTotals[game.series] = 0;
    }
    seriesTotals[game.series] += game.completionHours;
  });
  
  const series = Object.keys(seriesTotals);
  const totals = Object.values(seriesTotals);
  
  const colors = {
    'Fire Emblem': 'rgba(100, 200, 250, 0.8)',
    'Persona': 'rgba(200, 100, 255, 0.8)',
    'Smash Bros': 'rgba(255, 100, 100, 0.8)',
    'Xenoblade': 'rgba(100, 255, 150, 0.8)',
    'Zelda': 'rgba(255, 200, 100, 0.8)'
  };
  
  if (seriesChart) {
    seriesChart.destroy();
  }
  
  seriesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: series,
      datasets: [{
        data: totals,
        backgroundColor: series.map(s => colors[s] || 'rgba(76, 175, 80, 0.8)'),
        borderColor: series.map(s => {
          const borderColors = {
            'Fire Emblem': 'rgba(100, 200, 250, 1)',
            'Persona': 'rgba(200, 100, 255, 1)',
            'Smash Bros': 'rgba(255, 100, 100, 1)',
            'Xenoblade': 'rgba(100, 255, 150, 1)',
            'Zelda': 'rgba(255, 200, 100, 1)'
          };
          return borderColors[s] || 'rgba(76, 175, 80, 1)';
        }),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#b0b0b0',
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: 'Hours by Series',
          color: '#4CAF50',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      }
    }
  });
}

// Event listeners
document.getElementById('show-qr-btn').addEventListener('click', showQRCode);
document.getElementById('close-qr-btn').addEventListener('click', hideQRCode);
document.getElementById('series-filter').addEventListener('change', filterData);
document.getElementById('system-filter').addEventListener('change', filterData);
document.getElementById('sort-by').addEventListener('change', sortData);

// Initialize
loadData();

