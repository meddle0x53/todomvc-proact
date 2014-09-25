(function( window, ProAct ) {
  'use strict';

  var bindings = [],
      defaultBinding = {
        onProp: function ($binding, view, property, safe) {
          safe ? $binding.html(view[property]) : $binding.text(view[property]);
        },
        onChange: ProAct.N
      };

  function addBinding (binding) {
    bindings.push(binding);
  }

  function prepBinding (binding) {
    bindings.unshift(binding);
  }

  function delBinding (binding) {
    ProAct.Utils.remove(bindings, binding);
  }

  function filterBinding ($binding) {
    var i, ln = bindings.length,
        tag = $binding.prop('tagName').toLowerCase(),
        binding;

    for (i = 0; i < ln; i++) {
      var binding = bindings[i];
      if (binding.filter($binding, tag)) {
        return binding;
      }
    }

    return defaultBinding;
  }

  function onProp ($binding, view, property, safe) {
    if (!view.p(property)) {
      return;
    }

    var binding = filterBinding($binding);
    view.p(property).on(function () {
      if ($binding.updating) {
        return;
      }

      binding.onProp($binding, view, property, safe);
    });

    // sync
    view.p(property).update();
  }

  function onChange ($binding, view, property) {
    if (!view.p(property)) {
      return;
    }

    var binding = filterBinding($binding);
    binding.onChange($binding, view, property);
  }

  function jqOn (binding, $binding, type, view, property) {
    $binding.on(type, function () {
      try {
        $binding.updating = true;
        binding.change($binding, view, property);
      } finally {
        $binding.updating = false;
      }
    });
  }

  ProAct.Bindings = {
    addBinding : addBinding,
    prepBinding : prepBinding,
    delBinding : delBinding,
    onProp : onProp,
    onChange : onChange,
    jqOn: jqOn
  };

  // TODO to their own file!
  addBinding({
    filter: function ($binding, tag) {
      return tag === 'input' && $binding.attr('type') === 'checkbox';
    },
    onProp: function ($binding, view, property, safe) {
      $binding.prop('checked', view[property]);
    },
    change: function ($binding, view, property) {
      view[property] = $binding.prop('checked');
    },
    onChange: function ($binding, view, property) {
      jqOn(this, $binding, 'change', view, property);
    }
  });

  addBinding({
    filter: function ($binding, tag) {
      return tag === 'input';
    },
    onProp: function ($binding, view, property, safe) {
      $binding.prop('value', view[property]);
    },
    change: function ($binding, view, property) {
      view[property] = $binding.prop('value');
    },
    onChange: function ($binding, view, property) {
      jqOn(this, $binding, 'keydown', view, property);
    }
  });

})( window, ProAct );
