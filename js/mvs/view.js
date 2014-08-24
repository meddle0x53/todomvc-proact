(function( window, $, ProAct ) {
  'use strict';

  ProAct.View = ProAct.View || function (data) {
    ProAct.Utils.ex(this, this.constructor.initData);
    this.initialize(data);
  };

  ProAct.View.initData = {
    el: 'div',
    $el: null,
    id: null,
    classes: []
  };

  ProAct.View.idNumber = 1;

  ProAct.View.extend = ProAct.Utils.extendClass;

  ProAct.View.prototype = {
    constructor: ProAct.View,

    initialize: function (data) {
      ProAct.Utils.ex(this, data, {}, {
        $el: 'noprop',
        model: 'noprop'
      });

      if (!this.id) {
        this.id = 'proact-view-' + ProAct.View.idNumber;
        ProAct.View.idNumber = ProAct.View.idNumber + 1;
      }
    },

    bindModel: function (model) {
      if (!this.model) {
        ProAct.proxy(model, this);

        this.model = model;
      }
    },

    render: function (model) {
      this.bindModel(model);

      // rendering logic here!
    }
  };

})( window, $, ProAct);
