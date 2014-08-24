(function( window, ProAct ) {
	'use strict';

  ProAct.Model = ProAct.Model || function (data, storage) {
    ProAct.Utils.ex(this, this.constructor.initData);
    this.initialize(data, storage);
  };

  ProAct.Model.initData = {};

  ProAct.Model.create = function (data, storage) {
    var Const = function () {},
        Constructor = this,
        instance;

    Const.prototype = Constructor.prototype;

    instance = new Const();
    Constructor.apply(instance, Array.prototype.slice.call(arguments));

    return instance;
  };

  ProAct.Model.extend = function (data) {
    var parent = this,
        child = function () {
          parent.apply(this, Array.prototype.slice.call(arguments));
        };

    ProAct.Utils.ex(child, parent);
    ProAct.Utils.ex(child.prototype, parent.prototype);
    ProAct.Utils.ex(child.initData, data);
    child.uuid = ProAct.Utils.uuid();

    return child;
  };

  ProAct.Model.prototype = {
    constructor: ProAct.Model,
    initialize: function (data, storage) {
      ProAct.Utils.ex(this, data);
      ProAct.prob(this);

      this.storage = storage;

      if (this.storage) {
      }
    },

    save: function () {
      if (!this.isSaved) {
        return this.storage.create(this);
      }

      return this.storage.update(this);
    }
  };

})( window, ProAct );

