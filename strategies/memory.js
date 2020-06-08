const { EventEmitter } = require('events');

class MemoryCache extends EventEmitter{
  constructor() {
    super();
    this.cache = {};
  }

  async set(key, value, expire = -1) {
    this.cache[key] = value;
    this.emit(key, value);

    if(expire >= 0) {
      setTimeout(() => {
        delete this.cache[key];
      }, expire * 1000);
    }
  }

  async get(key) {
    return this.cache[key];
  }
}

module.exports = MemoryCache;
