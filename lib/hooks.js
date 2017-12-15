'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var debug = require('debug')('feathers-knex-transaction');

var start = function start(options) {
  return function (hook) {
    return new Promise(function (resolve) {
      if (!hook.service.Model || typeof hook.service.Model.transaction !== 'function') {
        return resolve(hook);
      }

      hook.service.Model.transaction(function (trx) {
        var id = Date.now();
        hook.params.transaction = {
          trx: trx,
          id: id
        };
        debug('started a new transaction %s', id);
        return resolve(hook);
      });
    });
  };
};

var end = function end(options) {
  return function (hook) {
    if (hook.params.transaction) {
      var _hook$params$transact = hook.params.transaction,
          trx = _hook$params$transact.trx,
          id = _hook$params$transact.id;

      return trx.commit().then(function () {
        return debug('finished transaction %s with success', id);
      }).then(hook);
    }
    return hook;
  };
};

var rollback = function rollback(options) {
  return function (hook) {
    if (hook.params.transaction) {
      var _hook$params$transact2 = hook.params.transaction,
          trx = _hook$params$transact2.trx,
          id = _hook$params$transact2.id;

      return trx.rollback().then(function () {
        return debug('rolling back transaction %s', id);
      }).then(hook);
    }
    return hook;
  };
};

exports.default = {
  transaction: {
    start: start,
    end: end,
    rollback: rollback
  }
};
module.exports = exports['default'];