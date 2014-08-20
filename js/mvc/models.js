(function( window, ProAct ) {
	'use strict';

  ProAct.Models = ProAct.Models || {};

  var Models = function (type, storage, initial) {
    this.type = type;
    this.storage = storage;

    if (!initial) {
      initial = [];
    }

    ProAct.Array.apply(this, initial);
  };

  Models.prototype = ProAct.Utils.ex(Object.create(ProAct.Array.prototype), {
    constructor: Models,
    load: function (location) {
      if (this.storage) {
        return Models.prototype.splice.apply(this, [0, this._array.length].concat(this.storage.load(location)));
      }

      return false;
    },
    save: function (location) {
      if (this.storage) {
        return this.storage.save(this, location);
      }

      return false;
    }
  });

  ProAct.Models.create = function (type, storage) {
    return new Models(type, storage, Array.prototype.slice.call(arguments, 2));
  };

})( window, ProAct );
