(function( window, ProAct ) {
	'use strict';

  ProAct.Storage = ProAct.Storage || function () {};

  ProAct.Storage.prototype = {
    constructor: ProAct.Storage,

    create: function (model) {},
    update: function (model) {},
    read: function (uuid, query) {},
    del: function (model) {},

    reload: function (uuid) {},
    save: function (models) {},

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

      return model;
    },

    register: function (uuid, data) {
      if (!this.store[uuid]) {
        this.store[uuid] = [];
      }

      return this.store[uuid];
    }
  });

})( window, ProAct );
