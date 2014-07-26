
var uid = require('uid');
var shelf = window.localStorage;

var entities = {};
exports = module.exports = {
  get: function (key) {
    var entity = entities[key];
    if (!entity) {
      entity = shelf.getItem(key);
      if (entity) {
        try {
          entity = JSON.parse(entity);
        } catch(e) {};
        entities[key] = entity;
      }
    }
    return entity;
  },

  set: function (val, key, opts) {
    if (typeof key === 'object') {
      opts = key;
      key = null;
    }
    if (!key)
      key = uid('s');
    opts || (opts={});
    entities[key] = val;
    if (opts.persist)
      shelf.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
    this.emit('set', key, val, opts.persist || false);
    this.emit('set:' + key, val, opts.persist || false);
    return key;
  },

  remove: function (key, opts) {
    if (!entities.hasOwnProperty(key))
      return;
    opts || (opts={});
    if (opts.persist)
      shelf.removeItem(key);
    entities[key] = null;
    this.emit('remove', key, opts.persist || false);
    this.emit('remove:' + key, opts.persist || false);
    return key;
  },

  clear: function (opts) {
    opts || (opts={});
    if (opts.persist)
      shelf.clear();
    entities = {};
    this.emit('clear', opts.persist || false);
  }
};

require('emitter')(module.exports);
