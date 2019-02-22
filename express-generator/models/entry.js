/**
 * 消息条目模型
 */

const redis = require('redis');
const db = redis.createClient();
class Entry {
  constructor(obj) {
    for (let key in obj) {
      this[key] = obj[key];
    }
  }

  //获取一部分消息
  static getRange(from, to, cb) {
    db.lrange('entries', from, to, (err, items) => {
      if (err) return cb(err);
      let entries = [];
      items.forEach((item) => {
        entries.push(JSON.parse(item));
      });
      cb(null, entries);
    })
  }

  save(cb) {
    const entryJSON = JSON.stringify(this);
    db.lpush(
      'entries',
      entryJSON,
      (err) => {
        if (err) return cb(err);
        cb();
      }
    );
  }
};

module.exports = Entry;