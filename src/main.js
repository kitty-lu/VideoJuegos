import { login, logout, isAuthenticated } from './auth';
import { getSales, createSale, updateSale, deleteSale } from './api';
import { setupCharts, updateCharts } from './charts';
import { setupTheme } from './theme';

let salesTable;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  setupTheme();
  setupEventListeners();
  checkAuth();
});

// Configurar escuchadores de eventos
function setupEventListeners() {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('saleForm').addEventListener('submit', handleSaleSubmit);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Verificar autenticación
function checkAuth() {
  if (isAuthenticated()) {
    showDashboard();
  } else {
    showLogin();
  }
}

// Mostrar/ocultar contenedores
function showLogin() {
  document.getElementById('loginContainer').classList.remove('d-none');
  document.getElementById('dashboardContainer').classList.add('d-none');
  document.getElementById('logoutBtn').classList.add('d-none');
}

function showDashboard() {
  document.getElementById('loginContainer').classList.add('d-none');
  document.getElementById('dashboardContainer').classList.remove('d-none');
  document.getElementById('logoutBtn').classList.remove('d-none');
  loadDashboardData();
}

// Manejadores de eventos
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    await login(username, password);
    showDashboard();
  } catch (error) {
    alert(error.message);
  }
}

async function handleSaleSubmit(e) {
  e.preventDefault();
  const saleData = {
    product_name: document.getElementById('productName').value,
    amount: parseFloat(document.getElementById('amount').value),
    date: document.getElementById('date').value
  };

  try {
    await createSale(saleData);
    document.getElementById('saleForm').reset();
    loadDashboardData();
  } catch (error) {
    alert('Error al registrar la venta');
  }
}

function handleLogout() {
  logout();
  showLogin();
}

// Cargar datos del dashboard
async function loadDashboardData() {
  try {
    const response = await getSales();
    const sales = response.data;
    
    updateStats(sales);
    updateCharts(sales);
    initializeDataTable(sales);
  } catch (error) {
    console.error('Error al cargar datos:', error);
    alert('Error al cargar los datos del dashboard');
  }
}

// Actualizar estadísticas
function updateStats(sales) {
  const totalSales = sales.length;
  const amounts = sales.map(sale => sale.amount);
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  const averageAmount = totalAmount / totalSales || 0;
  const highestAmount = Math.max(...amounts, 0);
  const lowestAmount = Math.min(...amounts, 0);

  document.getElementById('totalSales').textContent = totalSales;
  document.getElementById('averageSale').textContent = formatCurrency(averageAmount);
  document.getElementById('highestSale').textContent = formatCurrency(highestAmount);
  document.getElementById('lowestSale').textContent = formatCurrency(lowestAmount);
}

// Inicializar tabla de datos
function initializeDataTable(sales) {
  if (salesTable) {
    salesTable.destroy();
  }

  salesTable = new DataTable('#salesTable', {
    data: sales,
    columns: [
      { data: 'id' },
      { data: 'product_name' },
      { 
        data: 'amount',
        render: (data) => formatCurrency(data)
      },
      { 
        data: 'date',
        render: (data) => new Date(data).toLocaleDateString()
      },
      {
        data: null,
        render: function(data, type, row) {
          return `
            <button class="btn btn-sm btn-danger" onclick="deleteSaleRow(${row.id})">
              Eliminar
            </button>
          `;
        }
      }
    ],
    order: [[3, 'desc']],
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
    }
  });
}

// Utilidades
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Exponer funciones necesarias globalmente
window.deleteSaleRow = async (id) => {
  if (confirm('¿Está seguro de que desea eliminar esta venta?')) {
    try {
      await deleteSale(id);
      loadDashboardData();
    } catch (error) {
      alert('Error al eliminar la venta');
    }
  }
};