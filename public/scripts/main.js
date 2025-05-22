// Поиск книг
document.getElementById('searchForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  searchBooks();
});

document.getElementById('searchInput')?.addEventListener('input', searchBooks);

function searchBooks() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const results = books.filter(book => 
    book.title.toLowerCase().includes(query) || 
    book.author.toLowerCase().includes(query)
  );
  displayResults(results);
}

function displayResults(results) {
  const container = document.getElementById('searchResults');
  container.innerHTML = '';
  results.forEach(book => {
    const item = document.createElement('div');
    item.innerHTML = `<h4>${book.title}</h4><p>${book.author}</p>`;
    item.addEventListener('click', () => window.location.href = book.link);
    container.appendChild(item);
  });
}