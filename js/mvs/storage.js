(function( window, ProAct ) {
	'use strict';

  ProAct.Storage = ProAct.Storage || function () {
    ProAct.Observable.call(this);
  };
  ProAct.Storage.currentCaller = null;

  ProAct.Storage.prototype = ProAct.Utils.ex(Object.create(ProAct.Observable.prototype), {
    constructor: ProAct.Storage,

    makeEvent: function (e) {
      return e;
    },

    create: function (model) {
      this.update(model, [model.constructor.uuid]);

      return model;
    },
    save: function (model) { return model; },
    read: function (uuid, query) {
      if (ProAct.Storage.currentCaller) {
        this.on(uuid, ProAct.Storage.currentCaller);
      }
    },
    destroy: function (model) {
      this.update(ProAct.Event.simple('array', 'del', model), [model.constructor.uuid]);

      return model;
    },

    register: function (uuid, data) {}
  });

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
      model.isCreated = true;
      model.isSaved = true;

      return ProAct.Storage.prototype.create.call(this, model);
    },

    destroy: function (model) {
      var uuid = model.constructor.uuid,
          storage = this.register(uuid);

      ProAct.Utils.remove(storage, model);
      model.isSaved = false;

      return ProAct.Storage.prototype.destroy.call(this, model);
    },

    read: function (uuid, query) {
      ProAct.Storage.prototype.read.call(this, uuid, query);

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
