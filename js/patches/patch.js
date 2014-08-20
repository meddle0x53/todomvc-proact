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
      } else if (op === operations.remove) {
        if (ind === 0) {
          self.shift();
        } else {
          self.pop();
        }
      } else if (op === operations.setLength) {
        self.length = nv;
      } else if (op === operations.reverse) {
        self.reverse();
      } else if (op === operations.sort) {
        if (ProAct.Utils.isFunction(nv)) {
          self.sort(nv);
        } else {
          self.sort();
        }
      } else if (op === operations.splice) {
        nvs = slice.call(nv, 0);
        pArrayProto.splice.apply(self, [ind, ov.length].concat(nvs));
      }
    };
  };


})( window, ProAct );


