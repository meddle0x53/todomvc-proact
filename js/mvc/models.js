(function( window, ProAct ) {
	'use strict';

  ProAct.Models = ProAct.Models || {};

  function Models(type, storage, initial) {
    this.type = type;
    this.storage = storage;

    if (!initial) {
      initial = [];
    }

    ProAct.Array.apply(this, initial);

    this.addListenr(function (event) {
      var op    = event.args[0],
          ind   = event.args[1],
          ov    = event.args[2],
          nv    = event.args[3],
          ovs, nvs, i, ln,
          operations = ProAct.Array.Operations;

      if (op === operations.set) {
        nv.save();
      } else if (op === operations.add) {
        nvs = slice.call(nv, 0);
        ln = nvs.length;

        for (i = 0; i < ln, i++) {
          nvs[i].save();
        }
      } else if (op === operations.remove) {
        ov.destroy();
      } else if (op === operations.setLength) {
        // TODO should be imposible to do that
      } else if (op === operations.splice) {
        nvs = slice.call(nv, 0);
        ln = nvs.length;

        for (i = 0; i < ln, i++) {
          nvs[i].save();
        }

        ovs = slice.call(ov, 0);
        ln = ovs.length;

        for (i = 0; i < ln, i++) {
          ovs[i].destroy();
        }
      }
    });
  };

  Models.prototype = ProAct.Utils.ex(Object.create(ProAct.Array.prototype), {
    constructor: Models
  });

  ProAct.Models.create = function (type, storage) {
    return new Models(type, storage, Array.prototype.slice.call(arguments, 2));
  };

})( window, ProAct );
