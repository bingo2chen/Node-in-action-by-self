/**
 * 用户模型
 */
const redis = require('redis');
const bcrypt = require('bcrypt');
const db = redis.createClient();

class User {
  constructor(obj) {
    for(let key in obj) {
      this[key] = obj[key];
    }
  }

  //update
  save(cb) {
    if (this.id) {
      this.update(cb);
    } else {
      db.incr('user:ids', (err, id) => {
        if (err) return cb(err);
        this.id = id;
        console.log(this.id)
        this.hashPassword((err) => {//密码hash
          if (err) return cb(err);
          this.update(cb);
        });
      });
    }
  }

  update(cb) {
    const id = this.id;
    db.set(`user:id:${this.name}`, id, (err) => { //用名称索引用户id
      if (err) return cb(err);
      db.hmset(`user:${id}`, this, (err) => { //用redis存储当前类型
        cb(err);
      });
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name
    }
  };

  //添加bcrypt加密函数
  hashPassword(cb) {
    bcrypt.genSalt(12, (err, salt) => { //生成12个字符的盐
      if (err) return cb(err);
      this.salt = salt;
      bcrypt.hash(this.pass, salt, (err, hash) => { //生成hash
        if (err) return cb(err);
        this.pass = hash;
        cb();
      })
    });
  }

  // 从redis中获取数据
  static getByName(name, cb) {
    User.getId(name, (err, id) => { //用名称查找用户ID
      if (err) return cb(err);
      User.getByName(id, cb); //用ID抓取用户
    });
  }

  static getId(name, cb) {
    db.get(`user:id:${name}`, cb);
  }

  static get(id, cb) {
    db.hgetall(`user:${id}`, (err, user) => {
      if (err) return cb(err);
      cb(null, new User(user));
    });
  }

  //用户登录认证
  static authenticate(name, pass, cb) {
    User.getByName(name, (err, user) => { //通过用户名查找用户
      if (err) return cb(err);
      if (!user.id) return cb();
      bcrypt.hash(pass, user.salt, (err, hash) => {
        if (err) return cb(err);
        if (hash == user.pass) return cb(null, user);
        cb(); //密码无效
      });
    });
  }
}

module.exports = User;

