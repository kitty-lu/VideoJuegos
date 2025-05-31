export function setupTheme() {
  const toggleTheme = document.getElementById('toggleTheme');
  
  toggleTheme.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    html.setAttribute('data-bs-theme', newTheme);
    updateThemeUI(newTheme === 'dark');
    
    // Guardar preferencia en localStorage
    localStorage.setItem('dashboardTheme', newTheme);
  });
  
  // Cargar tema guardado
  const savedTheme = localStorage.getItem('dashboardTheme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeUI(savedTheme === 'dark');
  }
}

function updateThemeUI(isDark) {
  const icon = document.querySelector('.mode-icon');
  const text = document.querySelector('.mode-text');
  
  icon.textContent = isDark ? '☀️' : '🌙';
  text.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
}