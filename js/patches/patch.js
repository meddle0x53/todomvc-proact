//Patches that were needed by the mvc implementation that should be added to the next major version of ProAct.js
(function( window, ProAct ) {
	'use strict';

  ProAct.ArrayCore.prototype.makeListener = function () {
    var self = this.shell;
    return function (event) {
      if (!(event instanceof ProAct.Event)) {
        self.push(event);

        return;
      }

      if (event.type === ProAct.Event.Types.value) {
        self.push(event.args[2]);

        return;
      }

      var op    = event.args[0],
          ind   = event.args[1],
          ov    = event.args[2],
          nv    = event.args[3],
          pArrayProto = ProAct.Array.prototype,
          nvs,
          operations = ProAct.Array.Operations;

      if (op === operations.set) {
        self[ind] = nv;
      } else if (op === operations.add) {
        nvs = slice.call(nv, 0);
        if (ind === 0) {
          pArrayProto.unshift.apply(self, nvs);
        } else {
          pArrayProto.push.apply(self, nvs);
        }
      }

    };
  };


})( window, ProAct );


