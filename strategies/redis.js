const { EventEmitter } = require('events');
// eslint-disable-next-line import/no-unresolved
const { createClient } = require('redis');

class RedisCache extends EventEmitter{
  constructor({
    prefix = 'app:long:cache',
    client = createClient(),
    subscriber = createClient(),
  }) {
    super();
    const regex = new RegExp(`^${prefix}:keys:(.*)`);
    
    this.prefix = prefix;
    this.client = client;
    this.subscriber = subscriber;

    client.config('set', 'notify-keyspace-events', 'KEA');
    subscriber.subscribe('__keyevent@0__:set');
    subscriber.on('message', (channel, key) => {
      if(channel === '__keyevent@0__:set') {
        const exec = regex.exec(key);

        if(exec) {
          client.get(key, (err, value) => {
            if(!err) {
              this.emit(exec[1], value);
            }
          });
        }
      }
    });
  }

  /**
   * Returns the key for a given type
   * @param {'sub'|'key'} type The type of the key
   */
  key(key, type = 'sub') {
    return `${this.prefix}:${type === 'sub' ? 'subs': 'keys'}:${key}`;
  }

  set(key, value, expire = -1) {
    return new Promise((resolve, reject) => {
      const k = this.key(key, 'key');
      this.client.set(k, value, (err, reply) => {
        if(err) {
          return reject(err);
        }
  
        this.client.publish(this.key(key, 'sub'), value);
        return resolve(reply);
      });
  
      if(expire >= 0) {
        this.client.expire(k, expire);
      }
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(this.key(key, 'key'), (err, reply) => {
        if(err) {
          return reject(err);
        }

        return resolve(reply);
      });
    });
  }
}

module.exports = RedisCache;
