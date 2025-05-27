document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = document.querySelectorAll('.account-dropdown');
  
  dropdowns.forEach(dropdown => {
    const btn = dropdown.querySelector('.account-btn');
    const content = dropdown.querySelector('.dropdown-content');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
    });
  });
  
  // Закрытие при клике вне меню
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-content').forEach(content => {
      content.style.display = 'none';
    });
  });
});