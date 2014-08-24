(function( window, ProAct ) {
	'use strict';

  ProAct.Storage = ProAct.Storage || function () {};

  ProAct.Storage.prototype = {
    constructor: ProAct.Storage,

    create: function (model) { return model; },
    update: function (model) { return model; },
    read: function (uuid, query) {},
    destroy: function (model) { return model; },

    register: function (uuid, data) {}
  };

  ProAct.MemStorage = ProAct.MemStorage || function () {
    ProAct.Storage.call(this);

    this.store = {};
  };

  ProAct.MemStorage.prototype = ProAct.Utils.ex(Object.create(ProAct.Storage.prototype), {
    constructor: ProAct.MemStorage,

    create: function (model) {
      var uuid = model.constructor.uuid,
          storage = this.register(uuid);

      storage.push(model);
      model.isSaved = true;

      return model;
    },

    destroy: function (model) {
      var uuid = model.constructor.uuid,
          storage = this.register(uuid);

      ProAct.Utils.remove(storage, model);
      model.isSaved = false;

      return model;
    },

    read: function (uuid, query) {
      var storage = this.register(uuid);

      return [].concat(storage);
    },

    register: function (uuid, data) {
      if (!this.store[uuid]) {
        this.store[uuid] = [];
      }

      return this.store[uuid];
    }
  });

})( window, ProAct );
