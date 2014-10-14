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
    type: 'view',
    streams: {},
    pipes: [],
    lambdas: {},
    $parent: null,
    parentView: null,
    template: null,
    multyStreams: {}
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

      var streamProvider = new P.R.StreamProvider(),
          functionProvider = new P.R.FunctionProvider(),
          proObjectProvider = new P.R.ProObjectProvider(),
          lambda;

      this.registry = new ProAct.Registry()
        .register('s', streamProvider)
        .register('po', proObjectProvider)
        .register('obj', proObjectProvider)
        .register('f', functionProvider)
        .register('l', functionProvider);

      for (lambda in this.lambdas) {
        this.registry.store('l:' + lambda, this.lambdas[lambda]);
      }
    },

    bindModel: function (model) {
      if (!this.model) {
        ProAct.proxy(this, model, {
          $el: 'noprop',
          $parent: 'noprop',
          model: 'noprop',
          streams: 'noprop',
          pipes: 'noprop',
          lambdas: 'noprop',
          registry: 'noprop',
          template: 'noprop',
          beforeRender: 'noprop',
          afterRender: 'noprop'
        }, {});

        this.model = model;
      }
    },

    setupElement: function () {
      if (!this.$el) {
        if (this.template) {
          this.$el = $(this.template);
        }

        if (this.id && (!this.$el || this.$el.length === 0)) {
          this.$el = $(this.el + '#' + this.id);
        }

        if (!this.$el || this.$el.length === 0) {
          this.$el = $('[pro-view=' + this.type + ']')
        }

        if (!this.$el || this.$el.length === 0) {
          return false;
        }

        this.$el = this.$el.first();
      }

      return !!this.$el;
    },

    setupBindings: function () {
      ProAct.Bindings.setup(this);
    },

    setupStreams: function () {
      ProAct.Streams.setupActionStreams(this, this.$el, this.streams);
    },

    setupPipes: function () {
      ProAct.Streams.setupPipes(this, this.pipes);
    },

    beforeRender: function ($el) {
    },

    doRender: function ($el) {
      var view = this;

      if (this.parentView) {
        this.$parent = this.parentView.$itemsEl ? this.parentView.$itemsEl : this.parentView.$el;
      }

      if (this.template && this.$parent) {
        this.$parent.append(this.$el);
      }

      if (this.model && !this.parentView && this.model.p('isDestroyed')) {
        this.model.p('isDestroyed').on(function (e) {
          view.destroy();
        });
      }
    },

    render: function (model) {
      this.bindModel(model);

      var view = this;
      ProAct.flow.run(function () {
        if (!view.setupElement()) {
          return;
        }

        view.beforeRender(view.$el);

        view.setupBindings();
        view.setupStreams();
        view.setupPipes();

        view.doRender();

        view.afterRender(view.$el);
      });
    },

    afterRender: function ($el) {
    },

    regRead: function (key) {
      var val = this.registry.get(key);
      if (!val && ProAct.registry) {
        val = ProAct.registry.get(key);
      }

      return val;
    },

    destroy: function () {
      // TODO Real destroy here!
      this.$el.remove();
    }

  };

})( window, $, ProAct);
