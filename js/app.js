ProAct.ArrayProperty = P.AP  = function (queueName, proObject, property) {
  if (queueName && !P.U.isString(queueName)) {
    property = proObject;
    proObject = queueName;
    queueName = null;
  }

  var self = this, getter;

  getter = function () {
    var isPA = function (value) {
       return value !== null && P.U.isObject(value) && P.U.isArray(value._array) && value.length !== undefined && value.core != undefined;
    };

    self.addCaller();
    if (!isPA(self.val)) {
      self.val = new P.A(self.val);
    }

    var get = P.P.defaultGetter(self),
        set = function (newVal) {
          if (self.val == newVal || self.val.valueOf() == newVal) {
            return;
          }

          self.oldVal = self.val;
          self.val = newVal;

          if (self.val === null || self.val === undefined) {
            P.P.reProb(self).update();
            return self;
          }

          if (!isPA(self.val)) {
            self.val = new P.A(self.val);
            if (queueName) {
              self.val.core.queueName = queueName;
            }
          }

          if (self.oldVal) {
            var i, listener,
                toRemove = [], toRemoveLength,
                oldIndListeners = self.oldVal.__pro__.listeners.index,
                oldIndListenersLn = oldIndListeners.length,
                newIndListeners = self.val.__pro__.listeners.index,
                oldLenListeners = self.oldVal.__pro__.listeners.length,
                oldLenListenersLn = oldLenListeners.length,
                newLenListeners = self.val.__pro__.listeners.length;

            for (i = 0; i < oldIndListenersLn; i++) {
              listener = oldIndListeners[i];
              if (listener.property && listener.property.proObject === self.proObject) {
                newIndListeners.push(listener);
                toRemove.push(i);
              }
            }
            toRemoveLength = toRemove.length;
            for (i = 0; i < toRemoveLength; i++) {
              oldIndListeners.splice[toRemove[i], 1];
            }
            toRemove = [];

            for (i = 0; i < oldLenListenersLn; i++) {
              listener = oldLenListeners[i];
              if (listener.property && listener.property.proObject === self.proObject) {
                newLenListeners.push(listener);
                toRemove.push(i);
              }
            }
            toRemoveLength = toRemove.length;
            for (i = 0; i < toRemoveLength; i++) {
              oldLenListeners.splice[toRemove[i], 1];
            }
            toRemove = [];
          }

          ActorUtil.update.call(self);
        };

    P.P.defineProp(self.proObject, self.property, get, set);

    self.state = P.States.ready;
    return self.val;
  };

  P.P.call(this, queueName, proObject, property, getter, function () {});
}

ProAct.ArrayProperty.prototype = P.U.ex(Object.create(P.P.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.ArrayProperty
   * @final
   * @for ProAct.ArrayProperty
   */
  constructor: ProAct.ArrayProperty,

  /**
   * Retrieves the {{#crossLink "ProAct.Property.Types"}}{{/crossLink}} value of <i>this</i> property.
   * <p>
   *  For instances of the `ProAct.ArrayProperty` class, it is
   *  {{#crossLink "ProAct.Property.Types/array:property"}}{{/crossLink}}.
   * </p>
   *
   * @for ProAct.ArrayProperty
   * @instance
   * @method type
   * @return {Number}
   *      The right type of the property.
   */
  type: function () {
    return P.P.Types.array;
  },

  /**
   * Called automatically after initialization of this property.
   * <p>
   *  For `ProAct.ArrayProperty` it does nothing -
   *  the real initialization is lazy and is performed on the first read of <i>this</i>.
   * </p>
   *
   * @for ProAct.ArrayProperty
   * @protected
   * @instance
   * @method afterInit
   */
  afterInit: function () {}
});

/**
 * <p>
 *  Constructor for `ProAct.ArrayPropertyProvider`.
 * </p>
 * <p>
 *  Provides {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instances for fields pointing to arrays.
 * </p>
 * <p>
 *  `ProAct.ArrayPropertyProvider` is part of the proact-properties module of ProAct.js.
 * </p>
 *
 * @for ProAct.ArrayPropertyProvider
 * @extends ProAct.PropertyProvider
 * @constructor
 */
ProAct.ArrayPropertyProvider = P.APP = function () {
  P.PP.call(this);
};

ProAct.ArrayPropertyProvider.prototype = P.U.ex(Object.create(P.PP.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.ArrayPropertyProvider
   * @final
   * @for ProAct.ArrayPropertyProvider
   */
  constructor: ProAct.ArrayPropertyProvider,

  /**
   * Used to check if this `ProAct.ArrayPropertyProvider` is compliant with the field and meta data.
   *
   * @for ProAct.ArrayPropertyProvider
   * @instance
   * @method filter
   * @param {Object} object
   *      The object to which a new {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance should be provided.
   * @param {String} property
   *      The field name of the <i>object</i> to turn into a {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance to be provided.
   * @return {Boolean}
   *      True if the value of <b>object[property]</b> an array.
   */
  filter: function (object, property, meta) {
    return P.AU.isArrayObject(object[property]);
  },

  /**
   * Provides an instance of {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}}.
   *
   * @for ProAct.ArrayPropertyProvider
   * @instance
   * @method provide
   * @param {String} queueName
   *      The name of the queue all the updates should be pushed to.
   *      <p>
   *        If this parameter is null/undefined the default queue of
   *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
   *      </p>
   * @param {Object} object
   *      The object to which a new {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance should be provided.
   * @param {String} property
   *      The field of the <i>object</i> to turn into a {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}}.
   * @param {String|Array} meta
   *      Meta information to be used for filtering and configuration of the {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance to be provided.
   * @return {ProAct.ArrayProperty}
   *      A {{#crossLink "ProAct.ArrayProperty"}}{{/crossLink}} instance provided by <i>this</i> provider.
   */
  provide: function (queueName, object, property, meta) {
    return new P.AP(queueName, object, property);
  }
});

P.PP.prependProvider(new P.ArrayPropertyProvider());

var oldTypeFunction = P.P.Types.type;
P.U.ex(P.Property.Types, {

    /**
     * ProAct.Property for array types - fields containing arrays.
     *
     * @property array
     * @type Number
     * @final
     * @for ProAct.Property.Types
     */
    array: {}, // arrays

    type: function (value) {
      if (P.U.isArray(value)) {
        return P.P.Types.array;
      }

      return oldTypeFunction(value);
    }

});

(function(window, ProAct) {
	'use strict';

  window.app = window.app || {};
  var app = window.app;

  app.storage = new ProAct.LocalStorage();

  app.getTaskListView = function (filter) {
    if (!app.views) {
      app.views = new app.TasksView();
      app.models = ProAct.Models.create(app.Task, app.storage);
      app.views.render(app.models);

      app.newView = new app.NewTaskView();
      app.newView.render(app.Task.create({}, app.storage));
    }

    app.views.setFilter(filter);

    return app.views;
  };

  app.router = new ProAct.Router();
  app.router
    .route(function () {
      app.getTaskListView('l:truth');
    })
    .route(/completed/, function () {
      app.getTaskListView('l:done');
    })
    .route(/active/, function () {
      app.getTaskListView('l:active');
    }).start();

})(window, ProAct);
