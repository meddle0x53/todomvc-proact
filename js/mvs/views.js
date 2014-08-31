(function( window, $, ProAct ) {
  'use strict';

  ProAct.Views = ProAct.Views || ProAct.View.extend({
    $itemsEl: null,
    children: {},
    template: null,
    type: 'views',
    childType: null,
    items: function () {
      return this.models.filter(function () {
        return true;
      });
    },
    length: function () {
      return this.items.length;
    }
  });

  ProAct.Utils.ex(ProAct.Views.prototype, {
    constructor: ProAct.Views,

    bindModel: function (models) {
      if (!this.models) {
        this.models = models;

        ProAct.prob(this, {
          $el: 'noprop',
          $itemsEl: 'noprop',
          $parent: 'noprop',
          model: 'noprop',
          streams: 'noprop',
          pipes: 'noprop',
          lambdas: 'noprop',
          registry: 'noprop',
          template: 'noprop',
          children: 'noprop',
          childType: 'noprop'
        });

        this.models.load();
      }
    },

    addChildView: function (childModel) {
      if (!this.children[childModel.uuid()]) {
        var child = new this.childType({
              parentView: this
            }),
            stream, path, prop;

        child.render(childModel)
        this.children[childModel.uuid()] = child;

        for (path in this.multyStreams) {
          if (path.indexOf('models.[].') !== 1) {
            stream = this.multyStreams[path];
            path = path.substring(path.indexOf('models.[].') + 10);
            prop = this.propFromPath(path, childModel);

            if (prop.sources.indexOf(stream) === -1) {
              stream.out(prop);
            }
          }
        }
      }
    },

    doRender: function () {
      if (this.itemsEl && this.itemsId) {
        this.$itemsEl = $(this.itemsEl + '#' + this.itemsId);
      }
      var view = this,
          i, ln = this.items.length;

      for (i = 0; i < ln; i++) {
        this.addChildView(this.items[i]);
      }

      this.models.core.on(function (event) {
        var op    = event.args[0],
            ind   = event.args[1],
            ov    = event.args[2],
            nv    = event.args[3],
            ovs, nvs, i, ln,
            slice = Array.prototype.slice,
            operations = ProAct.Array.Operations;

        if (op === operations.add) {
          nvs = slice.call(nv, 0);
          ln = nvs.length;

          for (i = 0; i < ln; i++) {
            view.addChildView(nvs[i]);
          }
        } else if (op === operations.remove) {
          // TODO
        } else if (op === operations.splice) {
          if (nv) {
            nvs = slice.call(nv, 0);
            ln = nvs.length;

            for (i = 0; i < ln; i++) {
              view.addChildView(nvs[i]);
            }

          }

          if (ov) {
            ovs = slice.call(ov, 0);
            ln = ovs.length;

            for (i = 0; i < ln; i++) {
              view.children[ovs[i].uuid()].destroy();
              delete view.children[ovs[i].uuid()];
            }
          }
        }
      });
    }
  });

})(window, $, ProAct);

