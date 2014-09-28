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
              this.setupActionStream.apply(this, [$actionEl, action, streamPath].concat(streamData[i]));
            }
          } else {
            this.setupActionStream.apply(this, [$actionEl, action, streamPath].concat(streamData));
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

          pipeStreamData = pipeData[1] + '|<<($' + (p + 1) + ')';
          pipeArgs = pipeData.slice(3);

          prop = this.propFromPath(pipeData[0]);
          pipeArgs.push(prop);

          this.setupStreamWithDestination(pipeStreamData, pipeData[2], pipeArgs);

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

      if (this.model && !this.parentView && this.model.p('isDestroyed')) {
        this.model.p('isDestroyed').on(function (e) {
          view.destroy();
        });
      }
    },

    destroy: function () {
      // TODO Real destroy here!
      this.$el.remove();
    },

    render: function (model) {
      this.bindModel(model);

      if (!this.setupElement()) {
        return;
      }

      this.beforeRender(this.$el);
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

    arrayFilter: function (array, filter, path) {
      return new ProAct.ArrayFilter(array, filter, this.registry, path);
    },

    regRead: function (key) {
      var val = this.registry.get(key);
      if (!val && ProAct.registry) {
        val = ProAct.registry.get(key);
      }

      return val;
    },

    propFromPath: function (path, obj) {
      var prop = obj ? obj : this, i,
          paths = path.split('.'),
          ln = paths.length - 1,
          path, prev, method;

      for (i = 0; i < ln; i++) {
        path = paths[i];
        if (path === '[]') {
          return this.allArrayProps(prop._array, paths.slice(i + 1));
        } else if (path.charAt(0) === '[' && path.charAt(path.length - 1) === ']') {
          return this.arrayFilter(prop, path.substring(1, path.length - 1), paths.slice(i + 1).join('.'));
        }

        prop = prop[path];
      }
      path = paths[i];
      prev = prop;
      prop = prop.p(path);

      if (!prop && path.indexOf('do') === 0) {
        path = path.toLowerCase().substring(2);
        method = prev[path];
        if (method && P.U.isFunction(method)) {
          return P.U.bind(prev, method);
        }
      }

      if (!prop && path.indexOf('l:') === 0) {
        method = this.regRead(path);
        if (method) {
          prev = prev[method] ? prev : this;

          return P.U.bind(prev, this.regRead(path));
        }
      }

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

    setupStream: function (streamKey, streamData) {
      var key = streamKey ? streamKey : ProAct.Utils.uuid(),
          streamArgs = ['s:' + key, streamData],
          args = Array.prototype.slice.call(arguments, 2);

      if (args.length) {
        streamArgs = streamArgs.concat(args);
      }

      return this.registry.make.apply(this.registry, streamArgs);
    },

    setupStreamWithDestination: function (streamData, destinationName, args, streamKey) {
      if (destinationName) {
        var destination = this.propFromPath(destinationName),
            dsl = P.U.isFunction(destination) ? '@' : '>>',
            stream;

        if (streamData) {
          streamData += '|';
        }

        streamData +=  dsl + '($' + (args.length + 1) + ')'
        args.push(destination);
      }

      stream = this.setupStream.apply(this, [streamKey, streamData].concat(args))
      if (P.U.isArray(destination)) {
        this.multyStreams[destinationName] = stream;
      }

      return stream;
    },

    setupActionStream: function ($actionEl, action, path, streamData, propertyName) {
      var view = this,
          args = Array.prototype.slice.call(arguments, 4),
          stream, streamKey;

      if (action.indexOf('.') !== -1) {
        streamKey = (path + '-' + action).replace(/\./g, '-');
      }

      stream = this.setupStreamWithDestination(streamData, propertyName, args, streamKey);

      $actionEl.on(action + '.' + this.id, function (e) {
        e.proView = view;
        stream.trigger(e);
      });

      return stream;
    }
  };

})( window, $, ProAct);
