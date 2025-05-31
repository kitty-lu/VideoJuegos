import Chart from 'chart.js/auto';

let charts = {};

const chartColors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  success: '#95E1D3',
  warning: '#FCE38A',
  danger: '#F38181'
};

export function setupCharts() {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  
  // Gráfico de ventas mensuales
  charts.monthlySales = new Chart(
    document.getElementById('monthlySalesChart'),
    {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Ventas Mensuales',
          data: [],
          backgroundColor: chartColors.primary,
          borderColor: chartColors.primary,
          borderWidth: 1
        }]
      },
      options: getChartOptions('Ventas Mensuales', isDark)
    }
  );

  // Gráfico de ventas diarias
  charts.dailySales = new Chart(
    document.getElementById('dailySalesChart'),
    {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Ventas Diarias',
          data: [],
          borderColor: chartColors.secondary,
          tension: 0.1,
          fill: false
        }]
      },
      options: getChartOptions('Ventas Diarias', isDark)
    }
  );

  // Gráfico de ventas por producto
  charts.productSales = new Chart(
    document.getElementById('productSalesChart'),
    {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Ventas por Producto',
          data: [],
          backgroundColor: chartColors.accent,
          borderColor: chartColors.accent,
          borderWidth: 1
        }]
      },
      options: getChartOptions('Ventas por Producto', isDark)
    }
  );

  // Gráfico de distribución de productos
  charts.productDistribution = new Chart(
    document.getElementById('productDistributionChart'),
    {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: Object.values(chartColors)
        }]
      },
      options: getChartOptions('Distribución de Productos', isDark)
    }
  );
}

export function updateCharts(sales) {
  const monthlyData = processMonthlyData(sales);
  const dailyData = processDailyData(sales);
  const productData = processProductData(sales);

  updateChart(charts.monthlySales, monthlyData.labels, monthlyData.values);
  updateChart(charts.dailySales, dailyData.labels, dailyData.values);
  updateChart(charts.productSales, productData.labels, productData.values);
  updatePieChart(charts.productDistribution, productData.labels, productData.values);
}

function processMonthlyData(sales) {
  const monthlyData = {};
  
  sales.forEach(sale => {
    const date = new Date(sale.date);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyData[monthYear] = (monthlyData[monthYear] || 0) + sale.amount;
  });

  return {
    labels: Object.keys(monthlyData),
    values: Object.values(monthlyData)
  };
}

function processDailyData(sales) {
  const dailyData = {};
  
  sales.forEach(sale => {
    const date = new Date(sale.date).toLocaleDateString();
    dailyData[date] = (dailyData[date] || 0) + sale.amount;
  });

  return {
    labels: Object.keys(dailyData),
    values: Object.values(dailyData)
  };
}

function processProductData(sales) {
  const productData = {};
  
  sales.forEach(sale => {
    productData[sale.product_name] = (productData[sale.product_name] || 0) + sale.amount;
  });

  return {
    labels: Object.keys(productData),
    values: Object.values(productData)
  };
}

function updateChart(chart, labels, data) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

function updatePieChart(chart, labels, data) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

function getChartOptions(title, isDark) {
  const textColor = isDark ? '#F3F4F6' : '#333';
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: {
            family: "'Press Start 2P', cursive",
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: textColor,
        font: {
          family: "'Press Start 2P', cursive",
          size: 14,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColor
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        ticks: {
          color: textColor
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };
}