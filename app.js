const express = require('express');
const path = require('path');
const session = require('express-session');
const booksDB = require('./booksDB');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка движка шаблонов
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Для CSS/JS/изображений
app.use(express.urlencoded({ extended: true })); // Для данных форм
app.use(session({
  secret: 'your-secret-key-123',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // true для HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 1 день
  }
}));

// Главная страница
app.get('/', (req, res) => {
  res.render('index', {
    books: booksDB.books,
    title: 'Все книги',
    count: booksDB.books.length,
    user: req.session.user
  });
});

// Страница входа (GET)
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { 
    error: req.query.error 
  });
});
// Обработка выхода
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Ошибка при выходе:', err);
      return res.status(500).send('Ошибка при выходе');
    }
    res.redirect('/'); // Редирект на главную после выхода
  });
});
// Обработка входа (POST)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Валидация
  if (!email || !password) {
    return res.redirect('/login?error=Заполните все поля');
  }

  // Аутентификация
  const user = booksDB.authenticate(email, password);
  if (!user) {
    return res.redirect('/login?error=Неверный email или пароль');
  }

  // Создание сессии
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email
  };

  res.redirect('/');
});

// Страница регистрации (GET)
app.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('register', { 
    error: req.query.error 
  });
});

// Обработка регистрации (POST)
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Валидация
  if (!username || !email || !password) {
    return res.redirect('/register?error=Заполните все поля');
  }

  // Проверка существующего пользователя
  if (booksDB.findUserByEmail(email)) {
    return res.redirect('/register?error=Пользователь с таким email уже существует');
  }

  // Создание нового пользователя
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password // В реальном проекте нужно хешировать!
  };

  booksDB.addUser(newUser);
  
  // Автоматический вход после регистрации
  req.session.user = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email
  };

  res.redirect('/');
});

// Страница входа (GET)
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { 
    error: req.query.error,
    user: null // Явно передаем null если пользователь не авторизован
  });
});

// Страница регистрации (GET)
app.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('register', { 
    error: req.query.error,
    user: null // Явно передаем null если пользователь не авторизован
  });
});

// Категории книг
app.get('/russian', (req, res) => {
  res.render('index', {
    books: booksDB.getByCategory('russian'),
    title: 'Отечественная литература',
    count: booksDB.getByCategory('russian').length,
    user: req.session.user
  });
});

app.get('/foreign', (req, res) => {
  res.render('index', {
    books: booksDB.getByCategory('foreign'),
    title: 'Зарубежная литература',
    count: booksDB.getByCategory('foreign').length,
    user: req.session.user
  });
});

// Поиск
app.get('/search', (req, res) => {
  const query = req.query.query || '';
  const results = query.length >= 2 ? booksDB.search(query) : [];
  
  res.render('index', {
    books: results,
    title: `Результаты поиска: "${query}"`,
    count: results.length,
    user: req.session.user
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});