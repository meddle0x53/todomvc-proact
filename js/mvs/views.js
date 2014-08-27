(function( window, $, ProAct ) {
  'use strict';

  ProAct.Views = ProAct.Views || ProAct.View.extend({
    children: [],
    template: null,
    type: 'views',
    childType: null,
    items: function () {
      return this.models;
    }
  });

  ProAct.Utils.ex(ProAct.Views.prototype, {
    constructor: ProAct.Views,

    bindModel: function (models) {
      if (!this.models) {
        ProAct.prob(this, {
          $el: 'noprop',
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

        this.models = models;
        this.models.load();
      }
    },

    doRender: function () {
      var view = this,
          i, ln = this.items.length,
          child;

      for (i = 0; i < ln; i++) {
        child = new this.childType({
          parentView: view
        });

        child.render(this.items[i])
        this.children[i] = child;
      }
    }
  });

})(window, $, ProAct);

