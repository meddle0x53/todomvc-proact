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

    child.initData = {};
    ProAct.Utils.ex(child.initData, parent.initData);

    ProAct.Utils.ex(child.prototype, parent.prototype);
    ProAct.Utils.ex(child.initData, data);

    child.uuid = ProAct.Utils.uuid();
    child.prototype.constructor = child;

    return child;
  };

  ProAct.Utils.clone = function (obj) {
    if (P.U.isArray(obj)) {
      return obj.slice(0);
    }
    return obj;
  };

  ProAct.Utils.ex = function(destination, source) {
    var p;

    for (p in source) {
      if (source.hasOwnProperty(p)) {
        destination[p] = P.U.clone(source[p]);
      }
    }
    return destination;
  };

  ProAct.Event.make = function (source, target, type, data) {
    if (type === 'array' || type === ProAct.Event.Types.array) {
      return ProAct.Event.makeArray(data[0], data.slice(1));
    }
  };

  ProAct.Event.makeArray = function (source, target, type, data) {
    var eventType = ProAct.Event.Types.array, arr;
    if (type === 'remove' || type === ProAct.Array.Operations.remove) {
      return new ProAct.Event(source, target, eventType, ProAct.Array.Operations.remove, data[0], data[1], data[2]);
    }

    if (type === 'splice' || type === ProAct.Array.Operations.splice) {
      if (!ProAct.Utils.isArray(data[1])) {
        data[1] = new Array(data[1]);
      }

      return new ProAct.Event(source, target, eventType, ProAct.Array.Operations.splice, data[0], data[1], data[2]);
    }
  };

  ProAct.Event.simple = function (eventType, subType, value, array) {
    if ((eventType === 'array' || eventType === 'a') && (subType === 'pop' || subType === 'shift')) {
      return ProAct.Event.makeArray(null, null, 'remove', [subType === 'shift' ? 0 : 1]);
    }

    if ((eventType === 'array' || eventType === 'a') && (subType === 'splice')) {
      return ProAct.Event.makeArray(null, null, 'splice', [value, 1]);
    }

    if ((eventType === 'array' || eventType === 'a') && (subType === 'deleteElement' || subType === 'del')) {
      if (array) {
        var index = array.indexOf(value);

        if (index !== -1) {
          return ProAct.Event.makeArray(null, array, 'splice', [index, 1]);
        }
      } else {
        return ProAct.Event.makeArray(null, array, 'splice', [null, [value]]);
      }
    }

    return null;
  };

  ProAct.ArrayCore.prototype.actionFunction =  function (fun) {
    var core = this,
        slice = Array.prototype.slice;
    return function () {
      var oldCaller = ProAct.currentCaller,
          i = arguments[1], res;

      ProAct.currentCaller = core.indexListener(i);
      res = fun.apply(this, slice.call(arguments, 0));
      ProAct.currentCaller = oldCaller;

      return res;
    };
  };

	ProAct.ArrayFilter = function (array, filter, registry, propertyPath) {
	  P.Observable.call(this);

    if (!P.U.isProArray(array)) {
      array = new ProAct.Array(array);
    }

    if (registry && P.U.isString(registry)) {
      propertyPath = registry;
      registry = null;
    }
	
    var filterFunc = filter;
    if (P.U.isString(filter)) {
      if (!registry && ProAct.registry) {
        registry = ProAct.registry;
      }
      filterFunc = registry.get(filter);

      if (!filterFunc && ProAct.registry) {
        filterFunc = ProAct.registry.get(filter);
      }
    }

    this.original = array;
    this.array = array.filter(filterFunc);
    this.propertyPath = propertyPath;
	};

	ProAct.ArrayFilter.prototype = P.U.ex(Object.create(P.Observable.prototype), {
    constructor: ProAct.ArrayFilter,

    makeEvent: function (source) {
      return source;
    },

	  makeListener: function () {
	    if (!this.listener) {
	      var filter = this;
	      this.listener = function (event) {
          var propertyPath = filter.propertyPath;
          filter.listeners.change = [];
          filter.array._array.forEach(function (el) {
            if (propertyPath && el.__pro__ && el.p(propertyPath)) {
              filter.on(el.p(propertyPath).makeListener());
            } else if (el.makeListener) {
              filter.on(el.makeListener());
            }
          });

          filter.update(event);
          filter.listeners.change = [];
	      };
	    }
	
	    return this.listener;
	  }
  });

  ProAct.ArrayCore.prototype.indexListener = function (i) {
    if (!this.indexListeners) {
      this.indexListeners = {};
    }

    var core = this,
        shell = core.shell;
    if (!this.indexListeners[i]) {
      this.indexListeners[i] = {
        call: function (source) {
          core.makeListener(new ProAct.Event(source, shell, ProAct.Event.Types.array, [
            ProAct.Array.Operations.set, i, shell._array[i], shell._array[i]
          ]));
        },
        property: core
      };
    }

    return this.indexListeners[i];
  };

  ProAct.ArrayCore.prototype.makeListener = function () {
    if (!this.listener) {
      var self = this.shell;
      this.listener =  function (event) {
        if (!event || !(event instanceof ProAct.Event)) {
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
            slice = Array.prototype.slice,
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
          if (nv) {
            nvs = slice.call(nv, 0);
          } else {
            nvs = [];
          }
          if (ind === null || ind === undefined) {
            ind = self.indexOf(ov[0]);
            if (ind === -1) {
              return;
            }
          }
          pArrayProto.splice.apply(self, [ind, ov.length].concat(nvs));
        }
      };
    }

    return this.listener;
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

  ProAct.DSL.predefined.filtering.defined = function (event) {
    return event.args[0][event.target] !== undefined;
  };

  ProAct.DSL.predefined.filtering.original = function (event) {
    return event.source === undefined;
  };

  ProAct.DSL.predefined.mapping['true'] = function (event) {
    return true;
  };


})( window, ProAct );
