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
    return binding;
  }

  function prepBinding (binding) {
    bindings.unshift(binding);
    return binding;
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

  function addInputBinding (bindingDefinition) {
    var binding = {
      filter: function ($binding, tag) {
        return tag === 'input' &&
          (bindingDefinition.type ?
           $binding.attr('type') === bindingDefinition.type : true);
      },
      onProp: function ($binding, view, property, safe) {
        $binding.prop(bindingDefinition.prop, view[property]);
      },
      change: function ($binding, view, property) {
        view[property] = $binding.prop(bindingDefinition.prop);
      },
      onChange: function ($binding, view, property) {
        jqOn(this, $binding, bindingDefinition.event, view, property);
      }
    };


    return addBinding(binding);
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
  addInputBinding({
    type: 'checkbox',
    prop: 'checked',
    event: 'change'
  });

  addInputBinding({
    prop: 'value',
    event: 'keydown'
  });

})( window, ProAct );
