(function( window, ProAct ) {
  'use strict';

  ProAct.Model = ProAct.Model || function (data, storage) {
    ProAct.Utils.ex(this, this.constructor.initData);
    this.initialize(data, storage);
  };

  ProAct.Model.initData = {
    isDestroyed: false,
    isSaved: false,
    isCreated: false
  };

  ProAct.Model.create = function (data, storage) {
    var Const = function () {},
        Constructor = this,
        instance;

    Const.prototype = Constructor.prototype;

    instance = new Const();
    Constructor.apply(instance, Array.prototype.slice.call(arguments));

    return instance;
  };

  ProAct.Model.extend = ProAct.Utils.extendClass;

  ProAct.Model.prototype = {
    constructor: ProAct.Model,
    initialize: function (data, storage) {
      ProAct.Utils.ex(this, data);

      ProAct.prob(this);

      this.storage = storage;

      var model = this;
      this.p('isDestroyed').on(function () {
        if (model.isDestroyed) {
          return model.destroy();
        }
      });

      this.p('isSaved').on(function () {
        if (model.isSaved) {
          return model.save();
        }
      });
    },

    uuid: function () {
      if (!this.uid) {
        this.uid = ProAct.Utils.uuid();
      }

      return this.uid;
    },

    save: function () {
      if (!this.isCreated) {
        return this.storage.create(this);
      }

      return this.storage.update(this);
    },

    destroy: function () {
      return this.storage.destroy(this);
    }
  };

})( window, ProAct );

