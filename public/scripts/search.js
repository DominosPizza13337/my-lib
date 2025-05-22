document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      if (searchInput.value.trim().length < 2) {
        e.preventDefault();
        alert('Для поиска введите минимум 2 символа');
        searchInput.focus();
      }
    });
  }
});