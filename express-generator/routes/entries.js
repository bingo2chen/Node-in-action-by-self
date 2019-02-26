//form
const Entry = require('../models/entry');

exports.list = (req, res, next) => {
  Entry.getRange(0, -1, (err, entries) => {
    if (err) return next(err);
    console.log(res.locals.user,222222);
    
    res.render('entries', {
      title: 'Entries',
      entries: entries,
      user: res.locals.user
    });
  });
};

exports.submit = (req, res, next) => {
  const data = req.body.entry;
  const user = res.locals.user;
  const username = user ? user.name : null;
  console.log(data, user, username)
  const entry = new Entry({
    username: username,
    title: data.title,
    body: data.body
  });
  entry.save((err) => {
    if (err) return next(err);
    res.redirect('/');
  })
};

exports.form = (req, res) => {
  res.render('post', {
    title: 'Post',
    user: res.locals.user
  });
};