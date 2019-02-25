const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const nunjucks = require('nunjucks');
const resError = require('res-error');

const entries = require('./routes/entries');
const register = require('./routes/register');
const login = require('./routes/login');
const api = require('./routes/api');

const validate = require('./middleware/validate');
const messages = require('./middleware/messages');
const user = require('./middleware/user');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'nj');
nunjucks.configure('views', {autoescape: true, express: app});

app.use(logger('dev'));
app.use(express.json());
app.use(resError);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(messages);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', api.auth);
app.use(user);

app.get('/api/user/:id', api.user);
app.get('/', entries.list);
app.get('/post', entries.form);
app.post('/post', 
  validate.required('entry[title]'),
  validate.lengthAbove('entry[title]', 4),
  entries.submit
);
//注册
app.get('/register', register.form);
app.post('/register', register.submit);
//登录
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/login', login.logout);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => {
  console.log('app is listening at 3000');
});

module.exports = app;
