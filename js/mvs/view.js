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
    template: null
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

    setupClasses: function () {
      var view = this;
      this.classes.core.on(function (event) {
        var op    = event.args[0],
            ind   = event.args[1],
            ov    = event.args[2],
            nv    = event.args[3],
            nvs, ovs, i, ln,
            slice = Array.prototype.slice,
            operations = ProAct.Array.Operations;
        if (op === operations.add) {
          nvs = slice.call(nv, 0);
          ln = nvs.length;
          for (i = 0; i < ln; i++) {
            view.$el.addClass(nvs[i]);
          }
        } else if (op === operations.remove) {
          view.$el.removeClass(ov);
        } else if (op === operations.splice) {
          nvs = slice.call(nv, 0);
          ln = nvs.length;

          for (i = 0; i < ln; i++) {
            view.$el.addClass(nvs[i]);
          }

          ovs = slice.call(ov, 0);
          ln = ovs.length;

          for (i = 0; i < ln; i++) {
            view.$el.removeClass(ovs[i]);
          }
        }
      });
    },

    setupBindings: function () {
      var view = this,
          $bindings = this.$el.find('[pro-bind]');

      $bindings.each(function () {
        var $binding = $(this),
            property = $binding.attr('pro-bind'),
            tag = $binding.prop('tagName').toLowerCase(),
            oneWay = (tag !== 'input'),
            updating = false;

        if (!view.p(property)) {
          return;
        }

        if (property.substring(0, 7) === 'one-way') {
          property = property.substring(8);
          oneWay = true;
        }

        // ->
        view.p(property).on(function () {
          if (updating) {
            return;
          }

          if (tag !== 'input') {
            $binding.text(view[property]);
          } else if ($binding.attr('type') === 'checkbox') {
            $binding.prop('checked', view[property]);
          } else {
            $binding.prop('value', view[property]);
          }
        });

        // sync
        view.p(property).update();

        if (oneWay) {
          return;
        }

        // <-
        $binding.on('change', function () {
          try {
            updating = true;
            if ($binding.attr('type') === 'checkbox') {
              view[property] = $binding.prop('checked');
            } else {
              view[property] = $binding.prop('value');
            }
          } finally {
            updating = false;
          }
        });
      });
    },

    setupStreams: function () {
      var streams = this.streams,
          streamPath, action, $actionEl,
          streamData, i, ln;

      for (streamPath in streams) {
        $actionEl = this.$el.find(streamPath)
        for (action in streams[streamPath]) {
          streamData = streams[streamPath][action];
          if (ProAct.Utils.isArray(streamData[0])) {
            ln = streamData.length;
            for (i = 0; i < ln; i++) {
              this.setupActionStream.apply(this, [$actionEl, action].concat(streamData[i]));
            }
          } else {
            this.setupActionStream.apply(this, [$actionEl, action].concat(streamData));
          }
        }
      }
    },

    setupPipes: function () {
      var pipes = this.pipes,
          pipeData, pipeStreamData, pipeDataLn, pipeArgs,
          prop, p, i, ln;

      ln = pipes.length;
      for (i = 0; i < ln; i++) {
        pipeData = pipes[i];

        if (!this.p(pipeData[0]) || !this.p(pipeData[2])) {
          continue;
        }

        pipeDataLn = pipeData.length;

        if (pipeDataLn > 2) {
          p = pipeDataLn - 3;

          pipeStreamData = pipeData[1] + '|<<($' + (p + 1) + ')|>>($' + (p + 2) + ')';
          pipeArgs = pipeData.slice(3);

          prop = this.propFromPath(pipeData[0]);
          pipeArgs.push(prop);
          pipeArgs.push(this.propFromPath(pipeData[2]));

          this.setupStream.apply(this, [pipeStreamData].concat(pipeArgs));

          // sync
          prop.update(prop.makeEvent());
        }
      }
    },

    beforeRender: function ($el) {
    },

    doRender: function ($el) {
      var view = this;

      if (this.parentView) {
        this.$parent = this.parentView.$el;
      }

      if (this.template && this.$parent) {
        this.$parent.append(this.$el);
      }

      if (this.model) {
        this.model.p('isDestroyed').on(function (e) {
          if (view.isDestroyed) {
            // TODO Real destroy here!
            view.$el.remove();
          }
        });
      }
    },

    render: function (model) {
      this.bindModel(model);

      if (!this.setupElement()) {
        return;
      }

      this.beforeRender(this.$el);
      this.setupClasses();
      this.setupBindings();
      this.setupStreams();
      this.setupPipes();

      this.doRender();

      this.afterRender(this.$el);
    },

    afterRender: function ($el) {
    },

    propFromPath: function (path) {
      var prop = this.p(path);

      if (prop.type() === ProAct.Property.Types.array) {
        prop = prop.get().core;

      }

      if (prop.target) {
        prop = prop.target;
      }

      return prop;
    },

    setupStream: function (streamData) {
      var streamArgs = ['s:' + ProAct.Utils.uuid(), streamData],
          args = Array.prototype.slice.call(arguments, 1);

      if (args.length) {
        streamArgs = streamArgs.concat(args);
      }

      return this.registry.make.apply(this.registry, streamArgs);
    },

    setupActionStream: function ($actionEl, action, streamData, propertyName) {
      var view = this,
          args = Array.prototype.slice.call(arguments, 2),
          stream;

      if (propertyName) {
        if (this.p(propertyName)) {
          args.unshift(this.propFromPath(propertyName));
        } else {
          return;
        }
      }


      stream = this.setupStream.apply(this, [streamData].concat(args));
      $actionEl.on(action, function (e) {
        e.proView = view;
        stream.trigger(e);
      });

      return stream;
    }
  };

})( window, $, ProAct);
