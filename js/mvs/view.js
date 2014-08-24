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
    classes: [],
    type: 'view'
  };

  ProAct.View.idNumber = 1;

  ProAct.View.extend = ProAct.Utils.extendClass;

  ProAct.View.prototype = {
    constructor: ProAct.View,

    initialize: function (data) {
      ProAct.Utils.ex(this, data);

      if (!this.id) {
        this.id = 'proact-view-' + ProAct.View.idNumber;
        ProAct.View.idNumber = ProAct.View.idNumber + 1;
      }
    },

    bindModel: function (model) {
      if (!this.model) {
        ProAct.proxy(this, model, {
          $el: 'noprop',
          model: 'noprop'
        }, {});

        this.model = model;
      }
    },

    render: function (model) {
      this.bindModel(model);

      if (!this.$el) {
        if (this.id) {
          this.$el = $(this.el + '#' + this.id);
        }

        if (!this.$el || this.$el.length === 0) {
          this.$el = $('[pro-view=' + this.type + ']')
        }

        if (!this.$el || this.$el.length === 0) {
          return;
        }

        this.$el = this.$el.first();
      }

      var view = this,
          $bindings = this.$el.find('[pro-bind]');

      $bindings.each(function () {
        var $binding = $(this),
            property = $binding.attr('pro-bind'),
            updating = false;

        // ->
        view.p(property).on(function () {
          if (updating) {
            return;
          }

          if ($binding.attr('type') === 'checkbox') {
            $binding.prop('checked', view[property]);
          }
        });

        $binding.on('change', function () {
          try {
            updating = true;
            if ($binding.attr('type') === 'checkbox') {
              view[property] = $binding.prop('checked');
            }
          } finally {
            updating = false;
          }
        });


      });

      // rendering logic here!
    }
  };

})( window, $, ProAct);
