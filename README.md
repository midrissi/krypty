Krypty
---

Krypty is an express middleware helping you to prevent running consuming APIs multiple times.

:snail: Without using the library, the response time will be like:

![Without krypty](screeshots/without-krypty.png)

:rocket: Using the library, the response is much better:

![With krypty](screeshots/with-krypty.png)

## Install

```shell
npm install --save krypty
```

## How to use

```javascript
const krypty = require('krypty');
const express = require('express');
const app = express();

app.use('/long', [
  krypty.memory(),
  (req, res) => setTimeou(() => res.json(true), 10000),
]);

app.listen(process.env.PORT || 3000);
```

## Using with Redis

```javascript
const { redis } = require('krypty');
const express = require('express');
const { createClient } = require('redis');

const app = express();

app.use('/long', [
  krypty.redis(),
  (req, res) => setTimeou(() => res.json(true), 10000),
]);

app.listen(process.env.PORT || 3000);
```

## License

MIT © Mohamed IDRISSI
