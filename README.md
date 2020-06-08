Krypty
---

Krypty is an express middleware helping you to prevent running consuming APIs multiple times.

:snail: Without using the library, the `response time` will be like:

![Without krypty](https://raw.githubusercontent.com/midrissi/krypty/master/screenshots/without-krypty.png)

:rocket: Using the library, the response is much better:

![With krypty](https://raw.githubusercontent.com/midrissi/krypty/master/screenshots/with-krypty.png)

See it in action:

[![Krypty - Memory Strategy](https://img.youtube.com/vi/huUO9Qkyz9k/0.jpg)](https://www.youtube.com/watch?v=huUO9Qkyz9k)

:rocket::rocket: Using Redis strategy is even better. In the demo bellow, we start an express app in two different ports (`3000` and `3001`), then we launch a request that takes `10 seconds` multiple times.

[![Krypty - Memory Strategy](https://img.youtube.com/vi/pQUDQ3_LUUg/0.jpg)](https://www.youtube.com/watch?v=pQUDQ3_LUUg)

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
  (req, res) => setTimeout(() => res.json(true), 5000),
]);

app.listen(process.env.PORT || 3000);
```

## Using Redis Strategy

```javascript
const { redis } = require('krypty');
const express = require('express');
const { createClient } = require('redis');

const app = express();

app.use('/long', [
  krypty.redis(),
  (req, res) => setTimeout(() => res.json(true), 5000),
]);

app.listen(process.env.PORT || 3000);
```

## License

MIT © Mohamed IDRISSI
