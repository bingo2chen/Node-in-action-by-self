const User = require('./user');
const user = new User({ 
  name: 'Lily',
  pass: 'pa'
});
user.save((err) => {
  if (err) console.error(err);
  console.log('user id %d', user.id);
})