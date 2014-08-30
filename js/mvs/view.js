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

    classesListener: function ($el) {
      var v = this;
      return function (event) {
        var op    = event.args[0],
            ind   = event.args[1],
            ov    = event.args[2],
            nv    = event.args[3],
            nvs, i, ln,
            slice = Array.prototype.slice,
            operations = ProAct.Array.Operations;

        if (op === operations.add) {
          nvs = slice.call(nv, 0);
          ln = nvs.length;
          for (i = 0; i < ln; i++) {
            $el.addClass(nvs[i]);
          }
        } else if (op === operations.remove) {

          $el.removeClass(ov);
        } else if (op === operations.splice) {
          nvs = slice.call(nv, 0);
          ln = nvs.length;

          for (i = 0; i < ln; i++) {
            $el.addClass(nvs[i]);
          }

          ln = ov.length;

          for (i = 0; i < ln; i++) {
            $el.removeClass(ov[i]);
          }
        }
      };
    },

    setupClasses: function () {
      if (this.classes === null) {
        this.classes = [];
      }
      this.classes.core.on(this.classesListener(this.$el));
    },

    setupBindings: function () {
      var view = this,
          $bindings = this.$el.find('[pro-bind]');

      $bindings.each(function () {
        var $binding = $(this),
            property = $binding.attr('pro-bind'),
            tag = $binding.prop('tagName').toLowerCase(),
            oneWay = (tag !== 'input'),
            safe = false,
            updating = false;

        if (property.substring(0, 7) === 'one-way') {
          property = property.substring(8);
          oneWay = true;
        }

        if (property.substring(0, 4) === 'safe') {
          property = property.substring(5);
          safe = true;
        }

        if (!view.p(property)) {
          return;
        }

        // ->
        view.p(property).on(function () {
          if (updating) {
            return;
          }

          if (tag !== 'input') {
            safe ? $binding.html(view[property]) : $binding.text(view[property]);
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

      $bindings = this.$el.find('[pro-class]');
      $bindings.each(function () {
        var $binding = $(this),
            property = $binding.attr('pro-class'),
            prop = view[property];

        if (!prop) {
          view.p().set(property, []);
          prop = view[property];
        }

        prop.core.on(view.classesListener($binding));
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
          prop, p, i, ln,
          destination, stream;

      ln = pipes.length;
      for (i = 0; i < ln; i++) {
        pipeData = pipes[i];

        pipeDataLn = pipeData.length;

        if (pipeDataLn > 2) {
          p = pipeDataLn - 3;

          pipeStreamData = pipeData[1] + '|<<($' + (p + 1) + ')|>>($' + (p + 2) + ')';
          pipeArgs = pipeData.slice(3);

          prop = this.propFromPath(pipeData[0]);
          pipeArgs.push(prop);

          destination = this.propFromPath(pipeData[2]);
          pipeArgs.push(destination);

          var stream = this.setupStream.apply(this, [pipeStreamData].concat(pipeArgs));
          window.s = window.s || {};
          window.s[pipeData[0]] = stream;

          if (P.U.isArray(destination)) {
            this.multyStreams[pipeData[2]] = stream;
          }

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
        this.$parent = this.parentView.$itemsEl ? this.parentView.$itemsEl : this.parentView.$el;
      }

      if (this.template && this.$parent) {
        this.$parent.append(this.$el);
      }

      if (this.model && !this.parentView) {
        this.model.p('isDestroyed').on(function (e) {
          view.destroy();
        });
      }
    },

    destroy: function () {
      if (this.isDestroyed) {
        // TODO Real destroy here!
        this.$el.remove();
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

    allArrayProps: function (array, paths) {
      var i, ln = array.length, 
          props = [],
          path = paths.join('.');

      for (i = 0; i < ln; i++) {
        props.push(this.propFromPath(path, array[i]))
      }

      return props;
    },

    propFromPath: function (path, obj) {
      var prop = obj ? obj : this, i,
          paths = path.split('.'),
          ln = paths.length - 1;

      for (i = 0; i < ln; i++) {
        if (paths[i] === '[]') {
          return this.allArrayProps(prop._array, paths.slice(i + 1));
        }
        prop = prop[paths[i]];
      }
      prop = prop.p(paths[i]);

      if (prop.type && (prop.type() === ProAct.Property.Types.array)) {
        prop = prop.get().core;
      }

      if (prop.type && (prop.type() === ProAct.Property.Types.auto)) {
        if (P.U.isProArray(prop.get())) {
          prop = prop.get().core;
        }
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
        args.unshift(this.propFromPath(propertyName));
      }


      stream = this.setupStream.apply(this, [streamData].concat(args));
      $actionEl.on(action + '.' + this.id, function (e) {
        e.proView = view;
        stream.trigger(e);
      });

      return stream;
    }
  };

})( window, $, ProAct);
