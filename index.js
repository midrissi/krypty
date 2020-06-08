const { createHash } = require('crypto');
const MemoryStrategy = require('./strategies/memory');

exports.transform = function transform(data, type = 'body') {
  switch (type) {
    case 'body':
      if (!data) {
        return Buffer.from([]);
      }

      if (typeof data === 'object') {
        return Buffer.from(JSON.stringify(data), 'utf8');
      }

      if (typeof data === 'string') {
        return Buffer.from(data, 'utf8');
      }

      return Buffer.from([]);
    case 'headers':
      return Buffer.from(JSON.stringify(data), 'utf8');
    case 'method':
    case 'url':
      return Buffer.from(data, 'utf8');
    default:
      return Buffer.from([]);
  }
};

exports.cache = ({
  initValue = null,
  timeout = 5,
  client = new MemoryStrategy(),
}) => {
  /**
   * Cache the request
   * @controller Cache
   * @param {Express.Request} req The request
   * @param {OutcommingMessage} res The response
   * @param {Function} next Go to the next middleware
   */
  return async function cache(req, res, next) {
    const { cookie } = req.headers;
    let value;

    const hash = createHash('sha256')
      .update(exports.transform(req.method, 'method'))
      .update(exports.transform(req.body, 'body'))
      .update(exports.transform({ cookie }, 'headers'))
      .update(exports.transform(req.originalUrl, 'url'))
      .digest('hex');

    try {
      value = await client.get(hash);
    } catch(e) {
      return next();
    }

    if(value === initValue) {
      return client.once(hash, (data) => {
        let json;
        try {
          json = JSON.parse(data);
        } catch(e) {
          return;
        }

        const { body, headers, status } = json;
        res
          .status(status)
          .set(headers)
          .send(body);
      });
    } if(value) {
      value = JSON.parse(value);
      return res
        .status(value.status)
        .set(value.headers)
        .send(value.body);
    }

    client.set(hash, initValue);

    const originalSend = res.send;
    res.send = function sendOverWrite(body) {
      client.set(hash, JSON.stringify({
        body,
        headers: res.getHeaders(),
        status: res.statusCode,
      }), timeout);
      originalSend.call(this, body);
    };

    return next();
  };
};

exports.memory = (opts = {}) => this.cache({
  ...opts,
  client: new MemoryStrategy(),
});

exports.redis = (opts = {}) => {
  // eslint-disable-next-line global-require
  const RedisStrategy = require('./strategies/redis');
  const { initValue = '__INIT_VALUE__', timeout, ...redisOpts } = opts;

  return this.cache({
    timeout,
    initValue,
    client: new RedisStrategy(redisOpts),
  });
};
