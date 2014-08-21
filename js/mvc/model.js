(function( window, ProAct ) {
	'use strict';

  // 1. Model instance is ProAct.js object.
  // 2. Model class can be extended, it defines properties.
  // 3. Model knows about storage.
  //   3.1. How?
  // 4. Model can be created, has crud methods.
  // 5. Model has relations to other models/collections of models
  // 6. Storage listens to model changes.
  // 7. Model should know whether it is saved.

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

    return child;
  };

  ProAct.Model.prototype = {
    constructor: ProAct.Model,
    initialize: function (data, storage) {
      ProAct.Utils.ex(this, data);
      ProAct.prob(this);

      this.storage = storage;
    }
  };

})( window, ProAct );

