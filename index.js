
var _ = require('underscore');

var entities = {};

module.exports = {
  get: function (key) {
    return entities[key];
  },
  set: function (entity, prefix, key) {
    if (!key)
      key = _.uniqueId('s');
    if (prefix)
      key = prefix + '-' + key;

    entities[key] = entity;
    this.emit('set', key, entity);
    this.emit('set:' + key, entity);
    return key;
  }
};

require('emitter')(module.exports);
