const express = require('express');
const path = require('path');
const session = require('express-session');
const booksDB = require('./booksDB');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройки
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400000,
    sameSite: 'lax',
    httpOnly: true
  }
}));

// Обработка ошибок
process.on('uncaughtException', (err) => {
  console.error('Неперехваченная ошибка:', err);
});

// Маршруты
app.get('/', (req, res) => {
  res.render('index', { 
    books: booksDB.books,
    title: 'Все книги',
    count: booksDB.books.length,
    user: req.session.user
  });
});

app.get('/russian', (req, res) => {
  const russianBooks = booksDB.getByCategory('russian');
  res.render('index', { 
    books: russianBooks,
    title: 'Отечественная литература',
    count: russianBooks.length,
    user: req.session.user
  });
});

app.get('/foreign', (req, res) => {
  const foreignBooks = booksDB.getByCategory('foreign');
  res.render('index', { 
    books: foreignBooks,
    title: 'Зарубежная литература',
    count: foreignBooks.length,
    user: req.session.user
  });
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { 
    error: req.query.error
  });
});

app.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('register', { 
    error: req.query.error
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.redirect('/login?error=Все поля обязательны');
  }

  const user = booksDB.authenticate(email, password);
  if (!user) {
    return res.redirect('/login?error=Неверный email или пароль');
  }

  req.session.user = user;
  res.redirect('/');
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.redirect('/register?error=Все поля обязательны');
  }

  if (booksDB.findUserByEmail(email)) {
    return res.redirect('/register?error=Пользователь с таким email уже существует');
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password: password // В продакшене нужно использовать bcrypt!
  };

  booksDB.addUser(newUser);
  req.session.user = newUser;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Ошибка при выходе:', err);
    }
    res.redirect('/');
  });
});

app.get('/search', (req, res) => {
  const query = req.query.query;
  if (!query || query.trim().length < 2) {
    return res.redirect('/');
  }
  
  const results = booksDB.search(query);
  res.render('index', { 
    books: results,
    title: `Результаты поиска: "${query}"`,
    count: results.length,
    user: req.session.user
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).render('404', { user: req.session.user });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { user: req.session.user });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});