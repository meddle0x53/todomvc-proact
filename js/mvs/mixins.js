(function( window, ProAct ) {
  'use strict';

  function mixin (context) {
    var i, ln = arguments.length;
    for (i = 1; i < ln; i++) {
      ex(context, arguments[i]);
    }
  }

  function include () {
    mixin(this.prototype);
  }

  var RegistryStore = {
    reg: function () {
      var streamProvider = new P.R.StreamProvider(),
          functionProvider = new P.R.FunctionProvider(),
          proObjectProvider = new P.R.ProObjectProvider();

      if (!this.registry) {
        this.registry = new ProAct.Registry()
          .register('s', streamProvider)
          .register('po', proObjectProvider)
          .register('obj', proObjectProvider)
          .register('f', functionProvider)
          .register('l', functionProvider);
      }

      return this.registry;
    },

    regRead: function (key) {
      var val = this.registry().get(key);
      if (!val && ProAct.registry) {
        val = ProAct.registry.get(key);
      }

      return val;
    }
  };

  ProAct.Mixins = {
    mixin: mixin,
    include: include,
    RegistryStore: RegistryStore
  };
})( window, ProAct);

