//Patches that were needed by the mvc implementation that should be added to the next major version of ProAct.js
(function( window, ProAct ) {
  'use strict';

  ProAct.Utils.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  };

  ProAct.Utils.extendClass = function (data) {
    var parent = this,
        child = function () {
          parent.apply(this, Array.prototype.slice.call(arguments));
        };

    ProAct.Utils.ex(child, parent);
    ProAct.Utils.ex(child.prototype, parent.prototype);
    ProAct.Utils.ex(child.initData, data);

    child.uuid = ProAct.Utils.uuid();
    child.prototype.constructor = child;

    return child;
  };

  ProAct.Event.make = function (source, target, type, data) {
    if (type === 'array' || type === ProAct.Event.Types.array) {
      return ProAct.Event.makeArray(data[0], data.slice(1));
    }
  };

  ProAct.Event.makeArray = function (source, target, type, data) {
    var eventType = ProAct.Event.Types.array;
    if (type === 'remove' || type === ProAct.Array.Operations.remove) {
      return new ProAct.Event(source, target, eventType, ProAct.Array.Operations.remove, data[0], data[1], data[2]);
    }
  };

  ProAct.Event.simple = function (eventType, subType, value) {
    if ((eventType === 'array' || eventType === 'a') && (subType === 'pop' || subType === 'shift')) {
      return ProAct.Event.makeArray(null, null, 'remove', [subType === 'shift' ? 0 : 1]);
    }
  };

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


  ProAct.DSL.predefined.mapping.pop = function () {
    return ProAct.Event.simple('array', 'pop');
  };

  ProAct.DSL.predefined.mapping.shift = function () {
    return ProAct.Event.simple('array', 'shift');
  };

  ProAct.DSL.predefined.mapping.eventToVal = function (event) {
    return event.args[0][event.target];
  };


})( window, ProAct );
