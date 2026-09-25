const t = require('tap');
const utils = require('../utils');

t.test('ran_no should return a number within the given range', function (t) {
  for (let i = 0; i < 100; i++) {
    const value = utils.ran_no(1, 10);
    t.ok(value >= 1 && value <= 10);
  }
  t.end();
});

t.test('uid should generate an ID with the requested length', function (t) {
  const id = utils.uid(16);

  t.equal(id.length, 16);
  t.ok(/^[A-Za-z0-9]+$/.test(id));

  t.end();
});

t.test('forbidden should return HTTP 403', function (t) {
  const headers = {};
  let body = '';

  const res = {
    statusCode: 0,

    setHeader: function (name, value) {
      headers[name] = value;
    },

    end: function (value) {
      body = value;
    }
  };

  utils.forbidden(res);

  t.equal(res.statusCode, 403);
  t.equal(headers['Content-Type'], 'text/plain');
  t.equal(body, 'Forbidden');

  t.end();
});